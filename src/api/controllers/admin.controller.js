const User = require('../../models/user.model')
const Report = require('../../models/report.model')
const Intervention = require('../../models/intervention.model')

// GET /api/admin/stats - Statistiques globales
exports.getStats = async (req, res) => {
  try {
    // Utilisateurs
    const usersCount = await User.countDocuments()
    const activeUsers = await User.countDocuments({ status: 'active' })
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const usersThisMonth = await User.countDocuments({ createdAt: { $gte: oneMonthAgo } })

    // Signalements
    const reportsCount = await Report.countDocuments()
    const reportsThisMonth = await Report.countDocuments({ "timestamps.createdAt": { $gte: oneMonthAgo } })
    const pendingReports = await Report.countDocuments({ status: "reported" })
    const resolvedReports = await Report.countDocuments({ status: "resolved" })

    // Interventions
    const interventionsCount = await Intervention.countDocuments()
    const interventionsThisMonth = await Intervention.countDocuments({ createdAt: { $gte: oneMonthAgo } })

    // Catégorie/statut
    const byCategory = await Report.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
    const byStatus = await Report.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])

    // Techniciens depuis User (rôle)
    const topTechs = await User.find({ role: "technician" })
      .select("name avatar status")
      .limit(5)

    // Activité récente
    const recentActivity = await Report.find({})
      .sort({ "timestamps.createdAt": -1 })
      .limit(6)
      .select("title category status timestamps.createdAt priority")
      .lean()

    // Perf système simulée
    const performance = {
      responseTime: "1.2s",
      responseScore: 85,
      availability: 99.8,
      userSatisfaction: 4.2,
      userSatisfactionScore: 84
    }

    const alerts = [
      { id: 1, type: "system", message: "Maintenance prévue ce soir", severity: "info" },
      { id: 2, type: "performance", message: "Temps de réponse élevé secteur Akpakpa", severity: "warning" },
      { id: 3, type: "security", message: "Tentative de connexion suspecte détectée", severity: "error" },
    ]

    const userGrowth = usersCount > 0 ? Math.round((usersThisMonth / usersCount) * 100) : 0
    const reportGrowth = reportsCount > 0 ? Math.round((reportsThisMonth / reportsCount) * 100) : 0

    res.json({
      stats: {
        totalUsers: usersCount,
        activeUsers,
        totalReports: reportsCount,
        pendingReports,
        resolvedReports,
        interventions: interventionsCount,
        userGrowth,
        reportGrowth,
        interventionsThisMonth,
        reportsThisMonth
      },
      topCategories: byCategory.map(c => ({
        category: c._id,
        count: c.count,
        percentage: reportsCount > 0 ? Math.round((c.count / reportsCount) * 100) : 0
      })),
      byStatus,
      technicians: topTechs.map(t => ({
        id: t._id,
        name: t.name,
        avatar: t.avatar,
        status: t.status || "N/A",
      })),
      recentActivity: recentActivity.map(r => ({
        id: r._id,
        type: r.priority === "urgent" ? "report_urgent" : "report_resolved",
        message: `Signalement ${r.title} (${r.category}) - statut ${r.status}`,
        timestamp: r.timestamps.createdAt,
        priority: r.priority || "low"
      })),
      performance,
      alerts
    })
  } catch (err) {
    console.error("Erreur getStats admin:", err)
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
