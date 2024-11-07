import 'dotenv/config'

import path from 'node:path'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

import { app as router } from './router'

const app = express()

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
}))

mongoose
  .connect('mongodb://localhost:27017/guitarly')
  .then(() => {
    app.use(express.json())

    app.use(
      '/uploads',
      express.static(path.resolve(__dirname, '..', 'uploads'))
    )

    app.use(router)

    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT} 🚀`)
    })
  })
  .catch(() => {
    console.log('Error connecting to mongodb ⚠️')
  })
