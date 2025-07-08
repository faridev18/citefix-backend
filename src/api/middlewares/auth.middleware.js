const { verifyToken } = require('../../utils/jwt')
const User = require('../../models/user.model')

exports.authRequired = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requis' })
  }
  const token = header.split(' ')[1]
  try {
    const decoded = verifyToken(token)
    const user = await User.findById(decoded.id)
    if (!user) return res.status(401).json({ error: 'Utilisateur introuvable' })
    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide ou expiré' })
  }
}
