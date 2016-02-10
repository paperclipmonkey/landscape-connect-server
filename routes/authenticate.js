module.exports = function () {
  var login = function (req, res) {
    res.json(req.session.user)
  }

  var logout = function (req, res) {
    req.session = null
    res.sendStatus(200)
  }
  
  return {
    login: login,
    logout: logout
  }
}
