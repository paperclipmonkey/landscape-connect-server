module.exports = function () {
  // var pass = require('./authenticate')

  // var login = 

  var logout = function (req, res) {
    req.session = null
    res.sendStatus(200)
  }

  return {
    // login: login,
    logout: logout
  }
}
