const express = require('express')
const router = express.Router()
const User = require('../../models/user.model')
const { authRequired } = require('../middlewares/auth.middleware')

// ✅ GET /api/users/me — Retourne l’utilisateur connecté
router.get('/me', authRequired, async (req, res) => {
  try {
    // req.user doit être injecté par ton middleware JWT
    const user = await User.findById(req.user._id).lean()
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" })
    // Supprime les infos sensibles (ex: mot de passe)
    delete user.password
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" })
  }
})

module.exports = router
