import { Request } from 'express'; 
declare global {
  namespace Express {
    interface Request {
      user?: { id: string }; 
    }
  }
}

import { Response } from 'express';
import { Tab } from '../models/Tab';
import { User } from '../models/User'; 
import { Types } from 'mongoose'; 
class TabController {
  async index(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      const query = userId ? { userId: new Types.ObjectId(userId as string) } : {};
      const tabs = await Tab.find(query);
      res.status(200).json(tabs);
    } catch (error) {
      res.sendStatus(500);
    }
  }

  async store(req: Request, res: Response) {
    try {
      console.log('Request body:', req.body); 
      const tab = await Tab.create(req.body);
      res.status(201).json(tab);
    } catch (error) {
      console.error('Error creating tab:', error as any); 
      res.status(500).json({ error: 'Internal Server Error', details: (error as any).message });
    }
  }

  async show(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tab = await Tab.findById(id);

      if (!tab) {
        return res.status(404).json({ error: 'Tab not found.' });
      }

      res.status(200).json(tab);
    } catch (error) {
      res.sendStatus(500);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tab = await Tab.findByIdAndUpdate(id, req.body, { new: true });

      if (!tab) {
        return res.status(404).json({ error: 'Tab not found.' });
      }

      res.status(200).json(tab);
    } catch (error) {
      res.sendStatus(500);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tab = await Tab.findByIdAndDelete(id);

      if (!tab) {
        return res.status(404).json({ error: 'Tab not found.' });
      }

      res.sendStatus(204);
    } catch (error) {
      res.sendStatus(500);
    }
  }

  async likeTab(req: Request, res: Response) {
    try {
      const { userId, tabId } = req.body;

      console.log('User ID:', userId);
      console.log('Tab ID:', tabId);

      const user = await User.findById(userId);
      if (!user) {
        console.log('User not found with ID:', userId);
        return res.status(404).json({ error: 'User not found.' });
      }

      const tab = await Tab.findById(tabId);
      if (!tab) {
        return res.status(404).json({ error: 'Tab not found.' });
      }

      if (!user.likedTabs.includes(tabId)) {
        user.likedTabs.push(tabId);
        await user.save();

        tab.likes += 1;
        await tab.save();

        return res.status(200).json({ message: 'Tab liked successfully.' });
      } else {
        return res.status(400).json({ error: 'Tab already liked.' });
      }
    } catch (error: any) {
      console.error('Error liking tab:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }

  async unlikeTab(req: Request, res: Response) {
    try {
      const { userId, tabId } = req.body;

      console.log('User ID:', userId);
      console.log('Tab ID:', tabId);

      const user = await User.findById(userId);
      if (!user) {
        console.log('User not found with ID:', userId); 
        return res.status(404).json({ error: 'User not found.' });
      }

      const tab = await Tab.findById(tabId);
      if (!tab) {
        return res.status(404).json({ error: 'Tab not found.' });
      }

      const tabIndex = user.likedTabs.indexOf(tabId);
      if (tabIndex > -1) {
        user.likedTabs.splice(tabIndex, 1);
        await user.save();

        tab.likes -= 1;
        await tab.save();

        return res.status(200).json({ message: 'Tab unliked successfully.' });
      } else {
        return res.status(400).json({ error: 'Tab not liked yet.' });
      }
    } catch (error: any) {
      console.error('Error unliking tab:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }

  async incrementDownload(req: Request, res: Response) {
    try {
        const tabId = req.params.id;
        const tab = await Tab.findByIdAndUpdate(
            tabId,
            { $inc: { downloads: 1 } },
            { new: true }
        );
  
        if (!tab) {
            return res.status(404).send({ message: 'Tab not found' });
        }
  
        res.status(200).send(tab);
    } catch (error) {
        res.status(500).send({ message: 'Error incrementing download', error });
    }
  }

  async removeLikes(req: Request, res: Response) {
    const { tabId } = req.params;
    try {
      await User.updateMany(
        { likedTabs: tabId },
        { $pull: { likedTabs: tabId } }
      );
      res.status(200).send('Tab ID removed from all user profiles successfully');
    } catch (error) {
      console.error('Failed to remove tab ID from user profiles:', error);
      res.status(500).send('Failed to remove tab ID from user profiles');
    }
  }

  async getUserTabs(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' }); 
      }
      const userId = req.user.id; 
      const tabs = await Tab.find({ userId }).sort({ updatedAt: -1 }); 
    } catch (error) {
      console.error('Error fetching user tabs:', error);
      res.sendStatus(500);
    }
  }

  async getLikedTabs(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const userId = req.user.id;
      const user = await User.findById(userId).populate('likedTabs'); 
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      res.status(200).json(user.likedTabs); 
    } catch (error) {
      console.error('Error fetching liked tabs:', error);
      res.sendStatus(500);
    }
  }
}

export default new TabController();