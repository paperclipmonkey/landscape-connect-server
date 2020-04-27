var eventServer = require('../eventemitter')
var common = require('../common')

eventServer.on('view:create', function (view) {
    common.emailAdmins(view)
})

if (process.env.LOGGING === 'true') {
    // eventServer.on('user:login', function (a, b) {
    //   console.log('Logged in')
    // })

    // eventServer.on('Response:creating', function (view) {
    //   console.log('New response being created')
    // })

    // eventServer.on('Response:error', function (err) {
    //   console.error(err)
    // })

    // eventServer.on('Response:*', function (data) {
    //   console.log(data)
    // })

    // // Catch all email events
    // eventServer.on('email:*', function (info) {
    //   console.log('email event recieved: ', info)
    // })
    eventServer.on('*', function (a, b) {
        console.log(a, b)
    })
}