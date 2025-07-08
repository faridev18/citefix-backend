const Intervention = require('../../models/intervention.model')

// GET /api/interventions - Liste (avec pagination, filtre)
exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, technicianId, reportId } = req.query
    const filter = {}
    if (status) filter.status = status
    if (technicianId) filter.technicianId = technicianId
    if (reportId) filter.reportId = reportId
    const interventions = await Intervention.find(filter)
      .sort({ 'timestamps.createdAt': -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
    res.json(interventions)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// POST /api/interventions - Créer
exports.create = async (req, res) => {
  try {
    const {
      reportId, technicianId, title, description, priority, scheduling,
      materials, progress, photos, costs, notes
    } = req.body
    if (!reportId || !title) return res.status(400).json({ error: 'Champs requis manquants' })

    const intervention = await Intervention.create({
      reportId, technicianId, title, description,
      priority, scheduling, materials, progress, photos, costs, notes,
      timestamps: { createdAt: new Date(), updatedAt: new Date() }
    })
    res.status(201).json(intervention)
  } catch (err) {
    console.error('Erreur create intervention:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// PUT /api/interventions/:id - Modifier
exports.update = async (req, res) => {
  try {
    const updates = req.body
    updates['timestamps.updatedAt'] = new Date()
    const updated = await Intervention.findByIdAndUpdate(req.params.id, updates, { new: true })
    if (!updated) return res.status(404).json({ error: 'Introuvable' })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// POST /api/interventions/:id/progress - Mise à jour du progrès (ex : étape suivante)
exports.updateProgress = async (req, res) => {
  try {
    const { percentage, currentStep, steps } = req.body
    const updates = {
      'progress.percentage': percentage,
      'progress.currentStep': currentStep,
      'progress.steps': steps,
      'timestamps.updatedAt': new Date()
    }
    const updated = await Intervention.findByIdAndUpdate(req.params.id, updates, { new: true })
    if (!updated) return res.status(404).json({ error: 'Introuvable' })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
}
