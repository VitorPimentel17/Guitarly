import mongoose, { Schema } from 'mongoose'

const tabSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  description: {
    type: String,
  },
  columns: {
    type: Number,
    required: true,
  },
  bpm: {
    type: Number,
    required: true,
  },
  rows: {
    type: Number,
    required: true,
  },
  tabValues: {
    type: [[String]], 
    required: true,
    default: [[]], 
  },
  author: {
    type: String,
    required: true,
  
  },
  likes: {
    type: Number,
    default: 0,
  },
  artist: {
    type: String,
   
  },
  isExercise: {
    type: Boolean,
    required: true,
  },
  visibility: {
    type: Number,
    required: true,
  },
  notesPerBeat: {
    type: Number,
    required: true,
  },
  downloads: {
    type: Number,
    default: 0,
  },
  

}, { timestamps: true });

export const Tab = mongoose.model('Tab', tabSchema)
