const User = require('../../models/user.model')
const { hashPassword, comparePassword } = require('../../utils/password')
const { generateToken } = require('../../utils/jwt')

// Inscription
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body
        if (!name || !email || !password) return res.status(400).json({ error: 'Champs requis manquants' })
        if (await User.findOne({ email })) return res.status(409).json({ error: 'Email déjà utilisé' })
        const hashed = await hashPassword(password)
        const user = await User.create({ name, email, password: hashed, phone })
        const token = generateToken({ id: user._id, role: user.role })
        res.status(201).json({
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            token
        })
    } catch (err) {
        console.error('Erreur Register:', err)
        res.status(500).json({ error: 'Erreur serveur' })
    }
}

// Connexion
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) return res.status(400).json({ error: 'Champs requis manquants' })
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ error: 'Utilisateur ou mot de passe invalide' })
        const valid = await comparePassword(password, user.password)
        if (!valid) return res.status(401).json({ error: 'Utilisateur ou mot de passe invalide' })
        const token = generateToken({ id: user._id, role: user.role })
        res.json({
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            token
        })
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' })
    }
}

// Récupérer profil connecté
exports.me = async (req, res) => {
    const user = req.user
    res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        status: user.status
    })
}

// Déconnexion (optionnel, côté JWT)
exports.logout = (req, res) => {
    // En JWT stateless, logout côté front (supprimer le token)
    res.json({ message: 'Déconnexion réussie (supprime le token côté client)' })
}
