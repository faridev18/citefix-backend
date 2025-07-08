const express = require('express')
const router = express.Router()
const adminController = require('../controllers/admin.controller')
const { authRequired } = require('../middlewares/auth.middleware')

// Optionnel : middleware isAdmin pour sécuriser les endpoints admin
const isAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
    return res.status(403).json({ error: 'Accès interdit' })
  }
  next()
}

// Statistiques globales
router.get('/stats', authRequired, isAdmin, adminController.getStats)

// Utilisateurs
router.get('/users', authRequired, isAdmin, adminController.getUsers)
router.put('/users/:id', authRequired, isAdmin, adminController.updateUser)

// Signalements
router.get('/reports', authRequired, isAdmin, adminController.getAllReports)
router.put('/reports/:id/status', authRequired, isAdmin, adminController.changeReportStatus)

module.exports = router
