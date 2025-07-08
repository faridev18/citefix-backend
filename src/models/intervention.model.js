const mongoose = require('mongoose')

const MaterialSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  unit: String,
  cost: Number
}, { _id: false })

const ProgressStepSchema = new mongoose.Schema({
  name: String,
  completed: Boolean,
  completedAt: Date
}, { _id: false })

const InterventionSchema = new mongoose.Schema({
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['scheduled', 'assigned', 'in_progress', 'completed', 'cancelled'], default: 'scheduled' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  scheduling: {
    scheduledDate: Date,
    estimatedDuration: Number, // minutes
    actualStartTime: Date,
    actualEndTime: Date
  },
  materials: [MaterialSchema],
  progress: {
    percentage: { type: Number, default: 0 },
    currentStep: String,
    steps: [ProgressStepSchema]
  },
  photos: [{
    type: String,
    url: String,
    takenAt: Date
  }],
  costs: {
    materials: Number,
    labor: Number,
    transport: Number,
    total: Number
  },
  notes: String,
  timestamps: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
  }
})

module.exports = mongoose.model('Intervention', InterventionSchema)
