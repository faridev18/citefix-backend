const Notification = require('../../models/notification.model')

// GET /api/notifications - Notifications utilisateur (tri récentes)
exports.getAllForUser = async (req, res) => {
  try {
    const userId = req.user._id
    const { page = 1, limit = 30 } = req.query
    const notifications = await Notification.find({ userId })
      .sort({ 'timestamps.createdAt': -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
    res.json(notifications)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// PUT /api/notifications/:id/read - Marquer comme lu
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true, readAt: new Date() },
      { new: true }
    )
    if (!notification) return res.status(404).json({ error: 'Notification introuvable' })
    res.json(notification)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// POST /api/notifications/send - Envoyer une notification
exports.sendNotification = async (req, res) => {
  try {
    const { userId, type, title, message, data, priority, channels, scheduledFor } = req.body
    if (!userId || !title || !message) {
      return res.status(400).json({ error: 'Champs requis manquants' })
    }
    const notif = await Notification.create({
      userId, type, title, message,
      data,
      priority: priority || 'medium',
      delivery: { channels: channels || ['push'] },
      read: false,
      timestamps: {
        createdAt: new Date(),
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined
      }
    })
    // Option : ici tu pourrais déclencher l’envoi push/email/sms réel
    res.status(201).json(notif)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
}
