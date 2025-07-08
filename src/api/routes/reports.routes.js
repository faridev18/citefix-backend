const express = require('express')
const multer = require('multer')
const path = require('path')
const router = express.Router()

// Config Multer pour extensions correctes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext
    cb(null, uniqueName)
  }
})

const upload = multer({ storage: storage })

const reportsController = require('../controllers/reports.controller')
const { authRequired } = require('../middlewares/auth.middleware')

// CRUD
router.get('/public', reportsController.getAllPublic)
router.get('/', authRequired, reportsController.getAll)
router.post('/', authRequired, upload.array('media', 5), reportsController.create)
router.get('/nearby', reportsController.getNearby)
router.get('/:id', reportsController.getById)
router.put('/:id', authRequired, reportsController.update)
router.delete('/:id', authRequired, reportsController.remove)

// Vote
router.post('/:id/vote', authRequired, reportsController.vote)

module.exports = router
