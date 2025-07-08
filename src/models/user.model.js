const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  avatar: String,
  role: { type: String, enum: ['citizen', 'technician', 'admin', 'super_admin'], default: 'citizen' },
  status: { type: String, enum: ['active', 'inactive', 'suspended', 'pending'], default: 'active' },
}, { timestamps: true })

module.exports = mongoose.model('User', UserSchema)
