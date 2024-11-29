import { Schema } from 'mongoose'

const ScoreSchema = new Schema({
  category: {
    type: String,
  },
  highScore: {
    type: Number,
    default: 0
  }
})

// export default models.Score || model('Score', ScoreSchema)
export default ScoreSchema