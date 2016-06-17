var mongoose = require('mongoose')
var fs = require('fs')
var archiver = require('archiver')
var json2csv = require('json2csv')
var common = require('../common')

module.exports = function (app) {
  var download_csv = function (req, res, next) {
    download_docs(req.params.id, function (docs) {
        if (docs.length === 0) {
          return next(new Error('Empty result'))
        }
        var cDocs = docs

        mongoose.model('questionnaire').findOne({serverId: req.params.id}, function (err, doc) {
          //Get the section and questions names in to a useable format
          var dataFields = []
          for(x in doc.sections){
            for(y in doc.sections[x].questions){
              dataFields.push(doc.sections[x].title + '/' + doc.sections[x].questions[y].title)
            }
          }
          var fields = ['media', 'timestamp', 'lat', 'lng', 'locAcc'].concat(dataFields)

          docs2 = []

          for(var i = 0; i < docs.length; i++){
           //TODO
           // docs2.push(docs[i].dataToAttrs())
          }
          try {
            json2csv({data: docs2, fields: fields}, function (err, csv) {
              if (err) return next(new Error('Failed to encode CSV'))
              var filename = 'Landscape Connect.csv'
              res.attachment(filename)
              res.end(csv)
            })
          } catch (err) {
            next(err)
          }
        })
    })
  }

  var download_kmz = function (req, res) {
    download_docs([req.params.id], packageKML, res)
  }

  function download_docs (id, fun, res) {
    mongoose.model('response').find({questionnaire: id}, function (err, docs) {
      if (err) {
        // next(err)
        console.log(new Error('Could not find docs'))
      }
      fun(docs, res)
    })
  }

  function add_images (docs, zip) {
    var i = 0
    var x = 0
    while (i < docs.length) {
      while (x < docs[i].media.length) {
        try {
          zip.append(common.downloadFromS3('uploads/' + docs[i].media[x]), {name: docs[i].media[x]})
        } catch (err) {
          console.log(err)
        }
        x++
      }
      x = 0
      i++
    }
    return zip
  }

  var download_media = function (req, res) {
    try {
      var ids = req.params.id
    } catch (e) {
      return res.sendStatus(400)
    }
    download_docs(ids, function (docs) {
      var zip = archiver.create('zip')
      res.attachment('media.zip')
      zip.pipe(res)
      zip.addListener('fail', function (err) {
        console.log("Zip failed")
        console.log(err)
      })

      add_images(docs, zip)
      zip.finalize()
    })
  }

  var download_kmz = function (req, res) {
    var ids = [req.body.id]
    download_docs(ids, packageKML, res)
  }

  function packageKML (docs, res) {
    var zip = archiver.create('zip')
    res.attachment('earth.kmz')
    zip.pipe(res)

    add_images(docs, zip)
    createKML(docs, function (err, kmlString) {
      if (err) {
        console.log(err)
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

  var download_image = function (req, res) {
    mongoose.model('feedback').findOne({_id: req.params.id}).exec(function (err, doc) {
      if (err) {
        return res.sendStatus(500)
      }
      res.setHeader('Content-Disposition', 'attachment; filename=' + req.params.file)
      try{
        common.downloadFromS3('uploads/' + doc.photo).pipe(res)
      } catch(err){
        console.log(err)
        res.end()
      }
    })
  }

  return {
    download_kmz: download_kmz,
    download_image: download_image,
    download_docs: download_docs,
    download_csv: download_csv,
    download_media: download_media,
  }
}
