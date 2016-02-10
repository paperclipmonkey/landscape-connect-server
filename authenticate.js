module.exports = (function () {
  var passport = require('passport') // Authentication
  var mongoose = require('mongoose')
  var fs = require('fs')
  var crypto = require('crypto')
  var LocalStrategy = require('passport-local').Strategy

  var modelFiles = fs.readdirSync(__dirname + '/models/')
  modelFiles.forEach(function (file) {
    require(__dirname + '/models/' + file)
  })

  var userModel = mongoose.model('user')

  passport.use(new LocalStrategy({usernameField: "email" },
    function (email, password, done) {
      var shasum = crypto.createHash('sha1')
      // Need to find user object to grab salt
      userModel.findOne({email: email}, function (err, user1) {
        if (err) {
          return done(err, false) // done(err)
        }
        if (!user1) {
          return done(null, false, "No email");
        }
        shasum.update(user1.salt + '>><<' + password) // Salt + >><< + pw = salting
        var toQuery = {
          'email': email,
          'password': shasum.digest('hex')
        }
        userModel.findOne(toQuery, function (err, user2) {
          if(!user2){
            return done(null, false);
          }
          if (err) {
            return done(err, false) // done(err)
          }
          user2.lastLogin = new Date() // Update last logged in time
          user2.save()
          done(null, user2)
        })
      })
    }
  ))

  passport.serializeUser(function (user, done) {
    done(null, user['_id'])
  })

  passport.deserializeUser(function (id, done) {
    userModel.findOne({'_id': id}, function (err, user) {
      done(err, user)
    })
  })

  return passport
})()
