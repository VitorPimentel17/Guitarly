import { Request, Response, NextFunction } from 'express'
import { promisify } from 'node:util'
import jwt from 'jsonwebtoken'

import { authConfig } from '../config/auth'

export default async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers?.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' })
  }

  const [, token] = authHeader.split(' ')

  try {
    // @ts-ignore
    const decoded = await promisify(jwt.verify)(token, authConfig.secret)

    // @ts-ignore
    req?.userId = decoded.id

    return next()
  } catch (err) {
    console.log("Autorization Error", err)
    return res.status(401).json({ error: 'Token invalid' })
  }
}
