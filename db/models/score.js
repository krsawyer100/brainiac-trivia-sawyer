import { Schema } from 'mongoose'

const ScoreSchema = new Schema({
  category: {
    type: String,
    required: true,
    index: true
  },
  highScore: {
    type: Number,
    default: 0
  }
})

export default ScoreSchema