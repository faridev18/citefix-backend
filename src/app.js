const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const dotenv = require('dotenv')
const path = require('path');

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(morgan('dev'))

// Import routes
const authRoutes = require('./api/routes/auth.routes')
const reportsRoutes = require('./api/routes/reports.routes')
const interventionsRoutes = require('./api/routes/interventions.routes')
const notificationsRoutes = require('./api/routes/notifications.routes')
const adminRoutes = require('./api/routes/admin.routes')


app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/interventions', interventionsRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/users', require('./api/routes/users.routes'))

// Error handling middleware
const { errorHandler } = require('./api/middlewares/error.middleware')
app.use(errorHandler)

module.exports = app
