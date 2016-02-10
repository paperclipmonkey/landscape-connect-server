var mongoose = require('mongoose')
var Schema = mongoose.Schema
var crypto = require('crypto')
var emailRegex = /^([\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+\.)*[\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+@((((([a-z0-9]{1}[a-z0-9\-]{0,62}[a-z0-9]{1})|[a-z])\.)+[a-z]{2,6})|(\d{1,3}\.){3}\d{1,3}(\:\d{1,5})?)$/i

module.exports = (function (app) {
  var UserSchema = new Schema({
    email: {type: String, required: true, unique: true, match: emailRegex},
    password: {type: String, required: true},
    salt: {type: String},
    fullname: {type: String},
    photo: {type: String},
    organisation: {type: String},
    phoneno: {type: String},
    isSuper: {type: Boolean, default: false, required: true},
    emailOn: {type: Boolean, default: false, required: true},
    lastLogin: {type: Date, required: true, default: Date.now}
  })

  UserSchema.pre('save', function (next) {
    var user = this
    if (!user.salt) {
      user.salt = user.email // Set it up as email on first usage
    }

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
      return next()
    }

    // Hash the Password
    var shasum = crypto.createHash('sha1')
    shasum.update(user.salt + '>><<' + user.password) // Email + >><< + pw = salting
    user.password = shasum.digest('hex')
    next()
  })
  return mongoose.model('user', UserSchema)
})()
