import express from 'express';
import { YoutubeTranscript } from 'youtube-transcript';
import { attachUser } from '../middleware/auth';
import axios from 'axios';

const router = express.Router();

// Extract video ID from YouTube URL
const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

// Get YouTube video metadata
const getVideoMetadata = async (videoId: string) => {
  try {
    // Using YouTube oEmbed API (no API key required)
    const response = await axios.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    return {
      title: response.data.title,
      author: response.data.author_name,
      authorUrl: response.data.author_url,
      thumbnail: response.data.thumbnail_url
    };
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    return null;
  }
};

// Get transcript from YouTube video
router.post('/transcript', attachUser, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    const videoId = extractVideoId(url);
    
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Get transcript
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (!transcript || transcript.length === 0) {
      return res.status(404).json({ error: 'No transcript available for this video' });
    }

    // Format transcript
    const formattedTranscript = transcript
      .map(item => item.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Get video metadata
    const metadata = await getVideoMetadata(videoId);

    res.json({
      videoId,
      transcript: formattedTranscript,
      metadata,
      segments: transcript // Original segments with timestamps
    });
  } catch (error: any) {
    console.error('Transcript error:', error);
    
    if (error.message?.includes('Could not get transcript')) {
      return res.status(404).json({ error: 'Transcript not available for this video' });
    }
    
    res.status(500).json({ error: 'Failed to fetch transcript' });
  }
});

// Validate YouTube URL
router.post('/validate', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ valid: false, error: 'URL is required' });
    }

    const videoId = extractVideoId(url);
    
    if (!videoId) {
      return res.status(200).json({ valid: false, error: 'Invalid YouTube URL format' });
    }

    // Try to get metadata to validate the video exists
    const metadata = await getVideoMetadata(videoId);
    
    if (!metadata) {
      return res.status(200).json({ valid: false, error: 'Video not found' });
    }

    res.json({ valid: true, videoId, metadata });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ valid: false, error: 'Failed to validate URL' });
  }
});

export default router;