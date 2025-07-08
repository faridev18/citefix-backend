const app = require('./app')
const connectDB = require('./config/db')

const PORT = process.env.PORT || 3001

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server ready on http://localhost:${PORT}`)
  })
})
