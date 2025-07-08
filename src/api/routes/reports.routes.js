const express = require('express')
const router = express.Router()
const reportsController = require('../controllers/reports.controller')
const { authRequired } = require('../middlewares/auth.middleware')

// CRUD
router.get('/', reportsController.getAll)
router.post('/', authRequired, reportsController.create)
router.get('/nearby', reportsController.getNearby)
router.get('/:id', reportsController.getById)
router.put('/:id', authRequired, reportsController.update)
router.delete('/:id', authRequired, reportsController.remove)

// Vote
router.post('/:id/vote', authRequired, reportsController.vote)

module.exports = router
