import path from 'node:path'
import express, { Router } from 'express'
import multer from 'multer'

import authMiddleware from './middlewares/auth'

import UserController from './controllers/User'
import SessionController from './controllers/Session'
import TabController from './controllers/Tab';
import { Tab } from './models/Tab';


export const app = express()

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, callback) {
      callback(null, path.resolve(__dirname, '..', 'uploads'))
    },
    filename(req, file, callback) {
      callback(null, `${Date.now()}-${file.originalname}`)
    },
  }),
})

app.route('/hello').get((request, response) => {
  return response.json({ message: 'Learning lab' })
})
app.route('/logout').post((request, response) => {
  response.status(200).send({ message: 'Logged out successfully' });
});
app.get('/users', UserController.index)

app.post('/users', UserController.store)


app.delete('/users/:id', UserController.delete); 
app.post('/session', SessionController.store)

app.use(authMiddleware)



app.get('/verify-session', authMiddleware, SessionController.checkSession);


app.get('/tabs', async (req, res) => {
  try {
    const searchQuery = req.query.query;
    const isExercise = req.query.isExercise === 'true'; 
    const hideExercises = req.query.hideExercises === 'true'; 
    const userId = req.user ? req.user.id : null; 

    let query: any = {};

    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { artist: { $regex: searchQuery, $options: 'i' } },
        { author: { $regex: searchQuery, $options: 'i' } }
      ]; 
    }

    if (isExercise) {
      query.isExercise = true; 
    }

    if (hideExercises) {
      query.isExercise = false; 
    }

 

    const tabs = await Tab.find(query).sort({ likes: -1, updatedAt: -1 });
    res.status(200).json(tabs); 
  } catch (error) {
    console.error('Error fetching tabs:', error);
    res.sendStatus(500);
  }
});


 
app.post('/tabs', TabController.store);
app.get('/tabs/:id', TabController.show);
app.put('/tabs/:id', TabController.update);
app.delete('/tabs/:id', TabController.delete);

app.post('/tabs/like', TabController.likeTab);
app.post('/tabs/unlike', TabController.unlikeTab)
app.post('/tabs/:id/incrementDownload', TabController.incrementDownload);
app.post('/tabs/removeLikes/:tabId', TabController.removeLikes);

app.get('/tabs/liked', async (req, res) => {
  try {
    const likedTabs = await Tab.find({ likes: { $gt: 0 } }).sort({ updatedAt: -1 });
    res.status(200).json(likedTabs);
  } catch (error) {
    console.error('Error fetching liked tabs:', error);
    res.sendStatus(500);
  }
});

app.get('/tabs/user', TabController.getUserTabs); 

app.get('/users/search', UserController.search);


app.get('/users/:id', UserController.show);
