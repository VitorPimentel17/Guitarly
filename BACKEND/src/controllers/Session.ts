import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

import { authConfig } from '../config/auth'

import { User } from '../models/User'

class SessionController {
  async store(req: Request, res: Response) {
    try {
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado.' });
      }

      const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Senha incorreta.' });
      }

      const { _id: id, username, email, admin } = user;

      return res.json({
        user: {
          id,
          username,
          email,
          admin, 
        },
        token: jwt.sign({ id, username }, authConfig.secret, {
          expiresIn: authConfig.expiresIn,
        }),
      });
    } catch (error) {
      res.sendStatus(500);
    }
  }

  async checkSession(req: Request, res:Response) {
    return res.status(200).json({
      isLoggedIn: true,
      userId: req.body._id,
    });
  }
}
export default new SessionController()
