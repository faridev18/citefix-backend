const express = require('express')
const router = express.Router()
const interventionsController = require('../controllers/interventions.controller')
const { authRequired } = require('../middlewares/auth.middleware')

// CRUD
router.get('/', interventionsController.getAll)
router.post('/', authRequired, interventionsController.create)
router.put('/:id', authRequired, interventionsController.update)
// Progress
router.post('/:id/progress', authRequired, interventionsController.updateProgress)

module.exports = router
