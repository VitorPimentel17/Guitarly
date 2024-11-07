import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'

import { User } from '../models/User'



class UserController {
  async index(req: Request, res: Response) {
    try {
      const users = await User.find()
      res.status(200).json(users)
    } catch (error) {
      res.sendStatus(500)
    }
  }

  async store(req: Request, res: Response) {
    try {
      const userExists = await User.findOne({ username: req.body.username });
      const emailExists = await User.findOne({ email: req.body.email });

      if (userExists) {
        return res.status(400).json({ error: 'Nome de usuário já existe.' });
      }

      if (emailExists) {
        return res.status(400).json({ error: 'Email já cadastrado.' });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = await User.create({ ...req.body, password: hashedPassword, admin: req.body.admin || false }); 
      res.status(201).json(user);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ error: 'Erro ao registrar. Tente novamente.' });
    }
  }

  async show(req: Request, res: Response) {
    try {
      const { id } = req.params

      const user = await User.findById(id)

      if (!user) {
        return res.status(401).json({ error: 'User not found.' })
      }

      const currentUser = {
        _id: user._id,
        username: user.username,
        email: user.email,
        password: user.password,
        admin: user.admin,
        likedTabs: user.likedTabs,
        
      }

      res.status(200).json(currentUser)
    } catch (error) {
      res.sendStatus(500)
    }
  }

  async update(req: Request, res: Response) {
    try {
      const imagePath = req.file?.filename
      const { id } = req.params

      const user = await User.findById(id)

      if (!user) {
        return res.status(401).json({ error: 'User not found.' })
      }

      if (req.body.email !== user?.email) {
        const userExists = await User.findOne({ email: req.body.email })

        if (userExists) {
          return res.status(400).json({ error: 'User already exists.' })
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { ...req.body, avatar: imagePath },
        {
          new: true,
        }
      )

      res.status(201).json(updatedUser)
    } catch (error) {
      res.sendStatus(500)
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      if (user.admin) {
        return res.status(403).json({ error: 'Não é possível excluir um usuário administrador.' });
      }

      await User.findByIdAndDelete(id);
      res.status(200).json({ message: 'Usuário excluído com sucesso.' });
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      res.sendStatus(500);
    }
  }

  async search(req: Request, res: Response) {
    try {
      const searchTerm = req.query.query as string; 

     
      const query = {
        $or: [
          { username: { $regex: searchTerm, $options: 'i' } }, 
          { email: { $regex: searchTerm, $options: 'i' } } 
        ]
      };

      const users = await User.find(query, 'username email'); 
      res.status(200).json(users);
    } catch (error) {
      console.error('Error searching users:', error);
      res.sendStatus(500);
      res.end()
    }
  }
}

export default new UserController()
