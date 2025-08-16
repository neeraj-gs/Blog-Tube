import express from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import User from '../models/User';

const router = express.Router();

// Webhook to sync user from Clerk
router.post('/webhook/user', async (req, res) => {
  try {
    const { data, type } = req.body;

    if (type === 'user.created' || type === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url } = data;
      
      const email = email_addresses[0]?.email_address;
      const name = `${first_name || ''} ${last_name || ''}`.trim() || 'User';

      await User.findOneAndUpdate(
        { clerkId: id },
        {
          clerkId: id,
          email,
          name,
          imageUrl: image_url,
        },
        { upsert: true, new: true }
      );

      return res.status(200).json({ success: true });
    }

    if (type === 'user.deleted') {
      await User.findOneAndDelete({ clerkId: data.id });
      return res.status(200).json({ success: true });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get or create user
router.post('/sync', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get user from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);
    
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';

    // Find or create user in database
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      user = await User.create({
        clerkId: userId,
        email,
        name,
        imageUrl: clerkUser.imageUrl,
      });
    } else {
      // Update user info
      user.email = email;
      user.name = name;
      user.imageUrl = clerkUser.imageUrl;
      await user.save();
    }

    res.json({ user });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;