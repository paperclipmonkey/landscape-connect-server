var mongoose = require('mongoose')
var common = require('../common')

require('date-utils')

module.exports = function (app) {
  var resModel = mongoose.model('response')
  var qreModel = mongoose.model('questionnaire')

  var rating_average = function (req, res, next) {
    var cback = function (err, results) {
      if (err) {
        return next(new Error('Rating Average Error', err))
      }
      var total = 0
      for (var i = results.length - 1; i >= 0; i--) {
        var cur = results[i]
        total += cur.rating
      }
      var average = Math.round((total / results.length) * 10) / 10
      average = average ? average : 0
      res.json({'result': average})
    }

    if (req.user.isSuper) {
      mongoose.model('response').find({}, cback)
    } else {
      common.getQueryLocations(req.user.areas, function (err, q) {
        if (err) { return cback(err) }
        mongoose.model('response').find({
          'loc': q
        }, cback)
      })
    }
  }

  var questionnaires_total = function (req, res, next) {
      var cback = function(err, results){
       if(err){
       }
       res.json({"result": results})
      }

    if(req.user.isSuper){
      qreModel.where({}).count(cback)
    } else {
       qreModel.where('owner',req.user._id).count(cback)
    }
  }

  var responses_total = function (req, res, next) {
    var cback = function(err, results){
      if(err){
      }
      res.json({"result": results})
    }

    if(req.user.isSuper){
     resModel.where({}).count(cback)
    } else {
      qreModel.find({owner: req.user._id}, 'serverId', function (err, questionnaires) {
        var k = questionnaires.map(function(o){return o.serverId})
        resModel.where('questionnaire').in(k).count(cback)
     })
    }
  }

  var events = function (req, res, next) {
    var cback = function(err, results){
      if(err){
        console.log(err)
        return res.sendStatus(400)
      }
      res.json({"result": results})
    }

    // if(req.user.isSuper){
    //  resModel.find({},'', cback)
    // } else {
      qreModel.find({owner: req.user._id}, 'serverId', function (err, questionnaires) {
        var k = questionnaires.map(function(o){return o.serverId})
        resModel.where('questionnaire').in(k).sort({'timestamp': 'desc'}).limit(100)
.exec(cback)
     })
    // }
  }

  var responses_latest = function (req, res, next) {
    var limit = 10
    var cback = function(err, results){
      if(err){
      }
      res.json({"result": results})
    }

    if(req.user.isSuper){
     resModel.where({}).limit(limit).exec(cback)
    } else {
      qreModel.find({owner: req.user._id}, '_id', function (err, questionnaires) {
        var k = questionnaires.map(function(o){return o._id.toString()})
        resModel.where('questionnaire').in(k).limit(limit).exec(cback)
     })
    }
  }


  var words = function (req, res, next) {
    return next(new Error('Not implemented'))
    // var cback = function(err, results){
    // 	if(err){
    // 	}
    // 	var total = 0
    // 	for (var i = results.length - 1; i >= 0; i--) {
    // 		var cur = results[i]
    // 		total += cur.rating
    // 	}
    // 	res.json({"result": Math.round((total / results.length)*10)/10})
    // }

  // if(req.user.isSuper){
  // 	mongoose.model("response").find(['words'],{},cback)
  // } else {
  // 	common.getQueryLocations(req.user.areas, function(err, q){
  // 		mongoose.model("response").find(['words'],{
  // 			'loc' : q
  // 		}, cback)
  // 	})
  // }
  }

  var views_by_month = function (req, res, next) {
    var cback = function (err, results) {
      if (err) {
        return next(new Error('Views by Month Error', err))
      }
      /* Format we want to send data in
      	{
          result: [
            {
              "month": "Jan",
              value: 5
            }
          ]
        }
      */
      var altFormat = {}
      for (var i = results.length - 1; i >= 0; i--) {
        altFormat[results[i]._id] = {
          value: results[i].usage[0].count
        }
      }

      var monthsAgo = new Date()
      // Add in the additional months and data
      for (i = 0; i <= 12; i++) {
        var name = monthsAgo.getMonth() + 1 + ''

        if (!altFormat[name]) {
          altFormat[name] = {value: 0}
        }

        altFormat[name].name = monthsAgo.getMonthAbbr() // Append to object date name
        monthsAgo.setMonth(monthsAgo.getMonth() - 1)
      }

      res.json({'result': altFormat})
    }

    var doQuery = function (filter) {
      mongoose.model('response').aggregate(
        filter,
        {
          $group: {
            _id: {month: {$month: '$ts'}},
            count: {$sum: 1}
          }
        },
        {
          $group: {
            _id: '$_id.month',
            usage: {$push: {count: '$count'}}
          }
        },
        cback
      )
    }

    var monthsAgo = new Date()
    monthsAgo.setMonth(monthsAgo.getMonth() - 12)
    var filterQ = {
      $match: {
        'ts': {'$gte': monthsAgo}
      }
    }

    if (req.user.isSuper) {
      doQuery(filterQ)
    } else {
      common.getQueryLocations(req.user.areas, function (err, q) {
        if (err) { return cback(err) }
        filterQ['$match']['loc'] = q
        doQuery(filterQ)
      })
    }
  }

  var rating_by_month = function (req, res, next) {
    var cback = function (err, results) {
      if (err) {
        return next(new Error('Rating by month Error', err))
      }
      var altFormat = {}
      for (var i = results.length - 1; i >= 0; i--) {
        altFormat[results[i]._id.month] = {
          value: results[i].monthlyusage[0].average
        }
      }

      var monthsAgo = new Date()
      // Add in the additional months and data
      for (i = 0; i <= 12; i++) {
        var name = monthsAgo.getMonth() + 1 + ''

        if (!altFormat[name]) {
          altFormat[name] = {value: 0}
        }

        altFormat[name].name = monthsAgo.getMonthAbbr() // Append to object date name
        monthsAgo.setMonth(monthsAgo.getMonth() - 1)
      }

      res.json({'result': altFormat})
    }

    var doQuery = function (filter) {
      mongoose.model('response').aggregate(
        filter,
        {
          $group: {
            _id: {year: {$year: '$ts'}, month: {$month: '$ts'}},
            average: {$avg: '$rating'}
          }
        },
        {
          $group: {
            _id: {month: '$_id.month'}, // year: "$_id.year",
            monthlyusage: {$push: {month: '$_id.month', average: '$average'}}
          }
        },
        cback
      )
    }

    var monthsAgo = new Date()
    monthsAgo.setMonth(monthsAgo.getMonth() - 12)
    var filterQ = {
      $match: {
        'ts': {'$gte': monthsAgo}
      }
    }

    if (req.user.isSuper) {
      doQuery(filterQ)
    } else {
      common.getQueryLocations(req.user.areas, function (err, q) {
        if (err) { return cback(err) }
        filterQ['$match']['loc'] = q
        doQuery(filterQ)
      })
    }
  }

  var views_total = function (req, res, next) {
    var cback = function (err, results) {
      if (err) {
        return next(new Error('Dashboard Views Total Error', err))
      }
      res.json({'result': results})
    }

    if (req.user.isSuper) {
      mongoose.model('response').count({}, cback)
    } else {
      common.getQueryLocations(req.user.areas, function (err, q) {
        if (err) { return cback(err) }
        mongoose.model('response').count({loc: q}, cback)
      })
    }
  }

  var views_week = function (req, res, next) {
    var cback = function (err, results) {
      if (err) {
        return next(new Error('Dashboard Views Week Error', err))
      }
      res.json({'result': results})
    }

    var weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    if (req.user.isSuper) {
      mongoose.model('response').count({'ts': {'$gte': weekAgo}}, cback)
    } else {
      common.getQueryLocations(req.user.areas, function (err, q) {
        if (err) { return cback(err) }
        mongoose.model('response').count({'ts': {'$gte': weekAgo}, loc: q}, cback)
      })
    }
  }

  return {
    questionnaires_total: questionnaires_total,
    responses_total: responses_total,
    responses_latest: responses_latest,
    events: events,
    dashboard_rating_average: rating_average,
    dashboard_views_by_month: views_by_month,
    dashboard_rating_by_month: rating_by_month,
    dashboard_words: words,
    dashboard_views_total: views_total,
    dashboard_views_week: views_week
  }
}
