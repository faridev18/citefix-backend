const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const { authRequired } = require('../middlewares/auth.middleware')

router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/me', authRequired, authController.me)
router.post('/logout', authRequired, authController.logout)

module.exports = router
