const mongoose = require('mongoose')

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['status_change', 'comment', 'assignment', 'resolution', 'system'], default: 'system' },
  title: String,
  message: String,
  data: mongoose.Schema.Types.Mixed, // Données additionnelles (reportId, etc.)
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  delivery: {
    channels: [String], // ["push", "email", "sms"]
    sent: mongoose.Schema.Types.Mixed // Détail de l'envoi
  },
  read: { type: Boolean, default: false },
  readAt: Date,
  timestamps: {
    createdAt: { type: Date, default: Date.now },
    scheduledFor: Date
  }
})

module.exports = mongoose.model('Notification', NotificationSchema)
