const mongoose = require('mongoose')
const Schema = mongoose.Schema
const crypto = require('crypto')
const emailRegex = /\S+@\S+\.\S+/

module.exports = (function (app) {
  const UserSchema = new Schema({
    email: { type: String, required: true, unique: true, match: emailRegex },
    password: { type: String, required: true },
    salt: { type: String },
    username: { type: String },
    photo: { type: String },
    organisation: { type: String },
    phoneno: { type: String },
    isSuper: { type: Boolean, default: false, required: true },
    emailOn: { type: Boolean, default: false, required: true },
    lastLogin: { type: Date, required: true, default: Date.now }
  })

  UserSchema.pre('save', function (next) {
    const user = this
    if (!user.salt) {
      user.salt = user.email // Set it up as email on first usage
    }

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
      return next()
    }

    // Hash the Password
    const shasum = crypto.createHash('sha1')
    shasum.update(user.salt + '>><<' + user.password) // Email + >><< + pw = salting
    user.password = shasum.digest('hex')
    next()
  })
  return mongoose.model('user', UserSchema)
})()
