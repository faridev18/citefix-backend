const User = require('../../models/user.model')
const Report = require('../../models/report.model')
const Intervention = require('../../models/intervention.model')

// GET /api/admin/stats - Statistiques globales
exports.getStats = async (req, res) => {
  try {
    const usersCount = await User.countDocuments()
    const reportsCount = await Report.countDocuments()
    const interventionsCount = await Intervention.countDocuments()
    const activeUsers = await User.countDocuments({ status: 'active' })

    // Statistiques avancées : par catégorie, par statut...
    const byCategory = await Report.aggregate([
      { $group: { _id: '$category', total: { $sum: 1 } } }
    ])
    const byStatus = await Report.aggregate([
      { $group: { _id: '$status', total: { $sum: 1 } } }
    ])

    res.json({
      usersCount,
      reportsCount,
      interventionsCount,
      activeUsers,
      byCategory,
      byStatus
    })
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// GET /api/admin/users - Liste paginée des utilisateurs
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 30, role, status, search } = req.query
    const filter = {}
    if (role) filter.role = role
    if (status) filter.status = status
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ]
    }
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// PUT /api/admin/users/:id - Modifier un utilisateur
exports.updateUser = async (req, res) => {
  try {
    const updates = req.body
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// GET /api/admin/reports - Liste paginée de tous les signalements
exports.getAllReports = async (req, res) => {
  try {
    const { page = 1, limit = 30, status, category } = req.query
    const filter = {}
    if (status) filter.status = status
    if (category) filter.category = category
    const reports = await Report.find(filter)
      .sort({ 'timestamps.createdAt': -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
    res.json(reports)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// PUT /api/admin/reports/:id/status - Changer le statut d’un signalement
exports.changeReportStatus = async (req, res) => {
  try {
    const { status, comment } = req.body
    const allowedStatuses = ['reported', 'validated', 'assigned', 'in_progress', 'completed', 'resolved', 'rejected']
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut non valide' })
    }
    const report = await Report.findById(req.params.id)
    if (!report) return res.status(404).json({ error: 'Signalement introuvable' })
    report.status = status
    if (!report.statusHistory) report.statusHistory = []
    report.statusHistory.push({
      status,
      date: new Date(),
      comment: comment || 'Mise à jour par l’admin',
      userId: req.user._id
    })
    report.timestamps.updatedAt = new Date()
    if (status === 'resolved' || status === 'completed') {
      report.timestamps.resolvedAt = new Date()
    }
    await report.save()
    res.json(report)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
}
