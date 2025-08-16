import express from 'express';
import Blog from '../models/Blog';
import { attachUser, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all blogs for current user
router.get('/', attachUser, async (req: AuthRequest, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('promptId', 'prompt type');

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// Get single blog
router.get('/:id', attachUser, async (req: AuthRequest, res) => {
  try {
    const blog = await Blog.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('promptId');

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

// Create new blog
router.post('/', 
  attachUser,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('promptId').notEmpty().withMessage('Prompt ID is required')
  ],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, content, summary, tags, status, seoMeta, promptId } = req.body;

      const blog = await Blog.create({
        userId: req.user._id,
        promptId,
        title,
        content,
        summary,
        tags,
        status: status || 'draft',
        seoMeta
      });

      res.status(201).json(blog);
    } catch (error) {
      console.error('Error creating blog:', error);
      res.status(500).json({ error: 'Failed to create blog' });
    }
  }
);

// Update blog
router.put('/:id',
  attachUser,
  async (req: AuthRequest, res) => {
    try {
      const { title, content, summary, tags, status, seoMeta } = req.body;

      const blog = await Blog.findOneAndUpdate(
        {
          _id: req.params.id,
          userId: req.user._id
        },
        {
          title,
          content,
          summary,
          tags,
          status,
          seoMeta
        },
        { new: true, runValidators: true }
      );

      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
      }

      res.json(blog);
    } catch (error) {
      console.error('Error updating blog:', error);
      res.status(500).json({ error: 'Failed to update blog' });
    }
  }
);

// Delete blog
router.delete('/:id', attachUser, async (req: AuthRequest, res) => {
  try {
    const blog = await Blog.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

// Publish/Unpublish blog
router.patch('/:id/publish', attachUser, async (req: AuthRequest, res) => {
  try {
    const { publish } = req.body;
    
    const blog = await Blog.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id
      },
      {
        status: publish ? 'published' : 'draft',
        publishedAt: publish ? new Date() : undefined
      },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json(blog);
  } catch (error) {
    console.error('Error updating blog status:', error);
    res.status(500).json({ error: 'Failed to update blog status' });
  }
});

export default router;