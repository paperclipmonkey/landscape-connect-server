var mongoose = require('mongoose')
var fs = require('fs')
var archiver = require('archiver')
var json2csv = require('json2csv')
var common = require('../common')

module.exports = function (app) {
  var views_download_csv = function (req, res, next) {
    try {
      var ids = JSON.parse(req.body.ids)
    } catch (e) {
      return res.sendStatus(400)
    }
    download_docs(ids, function (docs) {
      try {
        if (docs.length === 0) {
          return next(new Error('Empty result'))
        }
        var cDocs = []
        for (var doc in docs) {
          cDocs.push(docs[doc].toCsv())
        }
        json2csv({data: cDocs, fields: ['photo', 'comments', 'age', 'heading', 'knowarea', 'words', 'date', 'time', 'lat', 'lng', 'rating']}, function (err, csv) {
          if (err) return res.sendStatus(500)
          var filename = 'RateMyView.csv'
          res.attachment(filename)
          res.end(csv)
        })
      } catch (err) {
        next(err)
      }
    })
  }

  var view_download_kmz = function (req, res) {
    download_docs([req.params.id], packageKML, res)
  }

  function download_docs (ids, fun, res) {
    mongoose.model('feedback').find({_id: {$in: ids}}, function (err, docs) {
      if (err) {
        // next(err)
        console.log(new Error('Could not find docs'))
      }
      fun(docs, res)
    })
  }

  function add_images (docs, zip) {
    var i = 0
    while (i < docs.length) {
      try {
        zip.append(common.downloadFromS3('uploads/' + docs[i].photo), {name: docs[i].photo})
      } catch (err) {
        console.log(err)
      }
      i++
    }
    return zip
  }

  var views_download_images = function (req, res) {
    try {
      var ids = JSON.parse(req.body.ids)
    } catch (e) {
      return res.sendStatus(400)
    }
    download_docs(ids, function (docs) {
      var zip = archiver.create('zip')
      res.attachment('images.zip')
      zip.pipe(res)
      zip.addListener('fail', function (err) {
        console.log(err)
      })

      add_images(docs, zip)
      zip.finalize()
    })
  }

  var views_download_kmz = function (req, res) {
    try {
      var ids = JSON.parse(req.body.ids)
    } catch (e) {
      return res.sendStatus(400)
    }
    download_docs(ids, packageKML, res)
  }

  function packageKML (docs, res) {
    var zip = archiver.create('zip')
    res.attachment('earth.kmz')
    zip.pipe(res)

    add_images(docs, zip)
    createKML(docs, function (err, kmlString) {
      if (err) {
        console.log(new Error('Could not package KML'))
      // next(err)
      }
      zip.append(
        kmlString,
        {name: 'doc.kml'}
      )
      zip.finalize()
    })
  }

  var createKML = function (docs, fun) {
    var handlebars = require('hbs').handlebars
    fs.readFile('views/kml.kml', {encoding: 'utf8'}, function (err, templateCode) {
      if (err) { return fun(err) }
      var template = handlebars.compile(templateCode)
      var finishedKML = template({docs: docs})
      fun(err, finishedKML)
    })
  }

  var view_download_image = function (req, res) {
    mongoose.model('feedback').findOne({_id: req.params.id}).exec(function (err, doc) {
      if (err) {
        return res.sendStatus(500)
      }
      res.setHeader('Content-Disposition', 'attachment; filename=' + req.params.file)
      common.downloadFromS3('uploads/' + doc.photo).pipe(res)
    })
  }

  return {
    view_download_kmz: view_download_kmz,
    view_download_image: view_download_image,
    download_docs: download_docs,
    views_download_csv: views_download_csv,
    views_download_images: views_download_images,
    views_download_kmz: views_download_kmz
  }
}
