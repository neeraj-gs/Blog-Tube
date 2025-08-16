import express from 'express';
import Prompt from '../models/Prompt';
import Blog from '../models/Blog';
import User from '../models/User';
import { attachUser, checkSubscriptionLimits, AuthRequest } from '../middleware/auth';
import { generateBlog } from '../services/openai';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all prompts for current user
router.get('/', attachUser, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    const prompts = await Prompt.find({ userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Prompt.countDocuments({ userId });

    res.json({
      prompts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

// Get single prompt
router.get('/:id', attachUser, async (req: AuthRequest, res) => {
  try {
    const prompt = await Prompt.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    // Get associated blog if exists
    const blog = await Blog.findOne({ promptId: prompt._id });

    res.json({ prompt, blog });
  } catch (error) {
    console.error('Error fetching prompt:', error);
    res.status(500).json({ error: 'Failed to fetch prompt' });
  }
});

// Create new prompt and generate blog
router.post('/',
  attachUser,
  checkSubscriptionLimits,
  [
    body('type').isIn(['youtube', 'text']).withMessage('Invalid prompt type'),
    body('prompt').notEmpty().withMessage('Prompt is required')
  ],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type, prompt, youtubeUrl, transcript, metadata } = req.body;

      // Create prompt record
      const newPrompt = await Prompt.create({
        userId: req.user._id,
        type,
        prompt,
        youtubeUrl,
        transcript,
        metadata
      });

      // Generate blog using OpenAI
      const blogData = await generateBlog({
        type,
        prompt,
        transcript,
        metadata
      });

      // Create blog record
      const blog = await Blog.create({
        userId: req.user._id,
        promptId: newPrompt._id,
        title: blogData.title,
        content: blogData.content,
        summary: blogData.summary,
        tags: blogData.tags,
        status: 'draft',
        seoMeta: blogData.seoMeta
      });

      // Update user credits
      req.user.subscription.creditsUsed += 1;
      await req.user.save();

      res.status(201).json({
        prompt: newPrompt,
        blog,
        creditsRemaining: req.user.subscription.creditsLimit - req.user.subscription.creditsUsed
      });
    } catch (error: any) {
      console.error('Error creating prompt:', error);
      
      if (error.message?.includes('rate limit')) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }
      
      res.status(500).json({ error: 'Failed to generate blog' });
    }
  }
);

// Regenerate blog from existing prompt
router.post('/:id/regenerate',
  attachUser,
  checkSubscriptionLimits,
  async (req: AuthRequest, res) => {
    try {
      const prompt = await Prompt.findOne({
        _id: req.params.id,
        userId: req.user._id
      });

      if (!prompt) {
        return res.status(404).json({ error: 'Prompt not found' });
      }

      // Generate new blog
      const blogData = await generateBlog({
        type: prompt.type,
        prompt: prompt.prompt,
        transcript: prompt.transcript,
        metadata: prompt.metadata
      });

      // Create new blog record
      const blog = await Blog.create({
        userId: req.user._id,
        promptId: prompt._id,
        title: blogData.title,
        content: blogData.content,
        summary: blogData.summary,
        tags: blogData.tags,
        status: 'draft',
        seoMeta: blogData.seoMeta
      });

      // Update user credits
      req.user.subscription.creditsUsed += 1;
      await req.user.save();

      res.json({
        blog,
        creditsRemaining: req.user.subscription.creditsLimit - req.user.subscription.creditsUsed
      });
    } catch (error) {
      console.error('Error regenerating blog:', error);
      res.status(500).json({ error: 'Failed to regenerate blog' });
    }
  }
);

// Delete prompt and associated blogs
router.delete('/:id', attachUser, async (req: AuthRequest, res) => {
  try {
    const prompt = await Prompt.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    // Delete associated blogs
    await Blog.deleteMany({ promptId: prompt._id });

    res.json({ message: 'Prompt and associated blogs deleted successfully' });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    res.status(500).json({ error: 'Failed to delete prompt' });
  }
});

export default router;