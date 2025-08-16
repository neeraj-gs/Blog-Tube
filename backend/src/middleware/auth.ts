import { Request, Response, NextFunction } from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import User from '../models/User';

export interface AuthRequest extends Request {
  auth?: {
    userId?: string;
  };
  user?: any;
}

export const clerkMiddleware = ClerkExpressRequireAuth();

export const attachUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findOne({ clerkId: req.auth.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error attaching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkSubscriptionLimits = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if user has exceeded their limits
    if (user.subscription.creditsUsed >= user.subscription.creditsLimit) {
      // Check if it's time to reset
      if (new Date() >= new Date(user.subscription.resetDate)) {
        user.subscription.creditsUsed = 0;
        user.subscription.resetDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
        await user.save();
      } else {
        return res.status(403).json({ 
          error: 'Credit limit exceeded', 
          resetDate: user.subscription.resetDate 
        });
      }
    }

    next();
  } catch (error) {
    console.error('Error checking subscription limits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};