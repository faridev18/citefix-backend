const bcrypt = require('bcryptjs')

exports.hashPassword = async (plainPassword) => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(plainPassword, salt)
}

exports.comparePassword = (plainPassword, hash) => {
  return bcrypt.compare(plainPassword, hash)
}
