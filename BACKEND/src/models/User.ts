import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  admin: {
    type: Boolean,
    default: false,
  },
  likedTabs: [{
    type: Schema.Types.ObjectId,
    ref: 'Tab',
    default: [],
  }],
}, {
  timestamps: true,
})

export const User = mongoose.model('User', userSchema)
