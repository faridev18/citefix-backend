const express = require('express')
const router = express.Router()
const notificationsController = require('../controllers/notifications.controller')
const { authRequired } = require('../middlewares/auth.middleware')

// Récupérer toutes les notifications de l'utilisateur
router.get('/', authRequired, notificationsController.getAllForUser)

// Marquer comme lue
router.put('/:id/read', authRequired, notificationsController.markAsRead)

// Envoyer une notification (admin ou système)
router.post('/send', authRequired, notificationsController.sendNotification)

module.exports = router
