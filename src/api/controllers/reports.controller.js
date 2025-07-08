const Report = require('../../models/report.model')
const mongoose = require('mongoose')

// GET /api/reports - Liste paginée
exports.getAll = async (req, res) => {
  try {
    const { status, category, mine } = req.query
    const filter = {}
    if (status) filter.status = status
    if (category) filter.category = category

    if (mine === "true" && req.user) {
      // Vérifie bien le type utilisé dans ta BDD
      filter["citizen.userId"] = req.user._id.toString()
    }

    const reports = await Report.find(filter)
      .sort({ 'timestamps.createdAt': -1 })

    res.json(reports)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
}



// GET /api/reports/public - Liste publique des reports
exports.getAllPublic = async (req, res) => {
  try {
    const { status, category } = req.query
    const filter = {}
    if (status) filter.status = status
    if (category) filter.category = category

    // Affiche seulement les reports publics ou validés si besoin
    // ex : filter.status = 'validated'

    const reports = await Report.find(filter)
      .sort({ 'timestamps.createdAt': -1 })

    res.json(reports)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
}



// POST /api/reports - Créer un signalement
exports.create = async (req, res) => {
  try {
    const user = req.user

    // Parse champs classiques
    const {
      title,
      description,
      category,
      priority,
      anonymous = false
    } = req.body

    // Parse location, assure l’ordre GeoJSON : [lng, lat]
    let location
    try {
      location = req.body.location ? JSON.parse(req.body.location) : null
      // Ajoute ce bloc pour assurer la bonne structure :
      if (location && Array.isArray(location.coordinates)) {
        location = {
          type: "Point",
          coordinates: location.coordinates
        }
      }
    } catch (e) {
      return res.status(400).json({ error: "Location invalide" })
    }

    // Correction : accepte {coordinates: [lat, lng]} ou [lng, lat]
    if (location && Array.isArray(location.coordinates)) {
      let coords = location.coordinates
      // Si le front a envoyé [lat, lng] (fréquent) => inverse
      if (
        coords.length === 2 &&
        // Heuristique : si lat entre -90 et 90 et lng entre -180 et 180
        Math.abs(coords[0]) <= 90 &&
        Math.abs(coords[1]) <= 180
      ) {
        coords = [coords[1], coords[0]]
      }
      location = {
        type: "Point",
        coordinates: coords.map(Number),
      }
    } else {
      return res.status(400).json({ error: "Coordonnées manquantes ou invalides" })
    }

    // Parse tags (array)
    let tags = []
    try {
      tags = req.body.tags ? JSON.parse(req.body.tags) : []
    } catch (e) {
      tags = []
    }

    // Gère les fichiers
    let media = []
    if (req.files && req.files.length) {
      media = req.files.map(f => ({
        type: "image",
        url: `/uploads/${f.filename}`,
        originalName: f.originalname,
        uploadedAt: new Date()
      }))
    }

    // Vérif champs requis
    if (!title || !category || !location.coordinates) {
      return res.status(400).json({ error: 'Champs requis manquants' })
    }

    const report = await Report.create({
      title,
      description,
      category,
      priority,
      status: 'reported',
      location, // propre et validé !
      citizen: {
        userId: user._id,
        name: user.name,
        anonymous: anonymous === "true" || anonymous === true
      },
      media,
      tags,
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
    const { type, reason, evidence } = req.body // type: confirm/contest
    const user = req.user
    const reportId = req.params.id

    // Valide le type attendu côté API
    if (!["confirm", "contest"].includes(type)) {
      return res.status(400).json({ error: "Type de vote invalide" })
    }

    // Traduit pour le modèle Mongoose
    const typeForDb = type === "confirm" ? "confirmation" : "contestation"

    // Unique vote per user/report
    const already = await Vote.findOne({ reportId, userId: user._id })
    if (already) return res.status(409).json({ error: 'Vous avez déjà voté' })

    // Création du vote
    await Vote.create({
      reportId,
      userId: user._id,
      type: typeForDb,
      details: { reason, evidence },
      location: req.body.location,
      timestamps: { createdAt: new Date() }
    })

    // Mets à jour l'engagement dans Report
    await Report.findByIdAndUpdate(reportId, {
      $inc: { [`engagement.${type === 'confirm' ? 'confirmations' : 'contestations'}`]: 1 }
    })

    // Récupère le report à jour et retourne-le
    const updatedReport = await Report.findById(reportId)
    res.status(201).json(updatedReport)
  } catch (err) {
    console.error("Erreur vote report:", err)
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
