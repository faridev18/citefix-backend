const Report = require('../../models/report.model')
const mongoose = require('mongoose')

// GET /api/reports - Liste paginée
exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category } = req.query
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

// POST /api/reports - Créer un signalement
exports.create = async (req, res) => {
  try {
    const user = req.user
    const {
      title, description, category, priority,
      location, media, tags, anonymous
    } = req.body
    if (!title || !category || !location || !location.coordinates) {
      return res.status(400).json({ error: 'Champs requis manquants' })
    }
    const report = await Report.create({
      title,
      description,
      category,
      priority,
      status: 'reported',
      location,
      citizen: {
        userId: user._id,
        name: user.name,
        anonymous: anonymous || false
      },
      media: media || [],
      tags: tags || [],
      statusHistory: [{
        status: 'reported',
        date: new Date(),
        comment: 'Signalement créé',
        userId: user._id
      }],
      timestamps: { createdAt: new Date(), updatedAt: new Date() }
    })
    res.status(201).json(report)
  } catch (err) {
    console.error('Erreur report create:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// GET /api/reports/:id - Détail d'un signalement
exports.getById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
    if (!report) return res.status(404).json({ error: 'Introuvable' })
    res.json(report)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// PUT /api/reports/:id - Modifier un signalement
exports.update = async (req, res) => {
  try {
    const user = req.user
    const report = await Report.findById(req.params.id)
    if (!report) return res.status(404).json({ error: 'Introuvable' })
    // Option : vérifier droits (ex: propriétaire ou admin)
    // if (report.citizen.userId.toString() !== user._id.toString() && user.role !== 'admin') ...
    const updates = req.body
    updates['timestamps.updatedAt'] = new Date()
    const updated = await Report.findByIdAndUpdate(req.params.id, updates, { new: true })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// DELETE /api/reports/:id - Supprimer un signalement
exports.remove = async (req, res) => {
  try {
    const user = req.user
    const report = await Report.findById(req.params.id)
    if (!report) return res.status(404).json({ error: 'Introuvable' })
    // Option: Vérifier droits (auteur ou admin)
    await Report.findByIdAndDelete(req.params.id)
    res.json({ message: 'Signalement supprimé' })
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// POST /api/reports/:id/vote - Voter
const Vote = require('../../models/vote.model')
exports.vote = async (req, res) => {
  try {
    const { type, reason, evidence } = req.body // type: confirmation/contestation
    const user = req.user
    const reportId = req.params.id
    if (!['confirmation', 'contestation'].includes(type)) {
      return res.status(400).json({ error: 'Type de vote invalide' })
    }
    // Unique vote per user/report
    const already = await Vote.findOne({ reportId, userId: user._id })
    if (already) return res.status(409).json({ error: 'Vous avez déjà voté' })
    const vote = await Vote.create({
      reportId,
      userId: user._id,
      type,
      details: { reason, evidence },
      location: req.body.location,
      timestamps: { createdAt: new Date() }
    })
    // Mets à jour l'engagement dans Report
    await Report.findByIdAndUpdate(reportId, {
      $inc: { [`engagement.${type === 'confirmation' ? 'confirmations' : 'contestations'}`]: 1 }
    })
    res.status(201).json(vote)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// GET /api/reports/nearby?lat=6.37&lng=2.42&distance=2000
exports.getNearby = async (req, res) => {
  try {
    const { lat, lng, distance = 2000 } = req.query
    if (!lat || !lng) return res.status(400).json({ error: 'Latitude/longitude requises' })
    const reports = await Report.find({
      'location.coordinates': {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(distance)
        }
      }
    }).limit(50)
    res.json(reports)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
}
