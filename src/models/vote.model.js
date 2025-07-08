const mongoose = require('mongoose')

const VoteSchema = new mongoose.Schema({
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['confirmation', 'contestation'] },
  details: {
    reason: String,
    evidence: String
  },
  location: {
    coordinates: {
      type: { type: String, default: 'Point' },
      coordinates: [Number]
    },
    accuracy: Number
  },
  timestamps: {
    createdAt: { type: Date, default: Date.now }
  }
})

VoteSchema.index({ reportId: 1, userId: 1 }, { unique: true })

module.exports = mongoose.model('Vote', VoteSchema)
