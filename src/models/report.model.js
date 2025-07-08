const mongoose = require('mongoose')

const MediaSchema = new mongoose.Schema({
  type: String, // image, video...
  url: String,
  thumbnail: String,
  uploadedAt: Date
}, { _id: false })

const StatusHistorySchema = new mongoose.Schema({
  status: String,
  date: Date,
  comment: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: false })

const ReportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['reported', 'validated', 'assigned', 'in_progress', 'completed', 'resolved', 'rejected'], default: 'reported' },

  location: {
    address: String,
    coordinates: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], index: '2dsphere' }
    },
    zone: String,
    landmark: String
  },

  citizen: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    anonymous: Boolean
  },

  media: [MediaSchema],

  engagement: {
    views: { type: Number, default: 0 },
    confirmations: { type: Number, default: 0 },
    contestations: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    bookmarks: { type: Number, default: 0 }
  },

  assignment: {
    technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedAt: Date,
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    estimatedDuration: Number, // minutes
    notes: String
  },

  statusHistory: [StatusHistorySchema],
  tags: [String],

  timestamps: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
    resolvedAt: Date
  }
})

module.exports = mongoose.model('Report', ReportSchema)
