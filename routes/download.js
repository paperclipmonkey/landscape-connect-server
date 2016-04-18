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
          var fields = ['media', 'date', 'time', 'lat', 'lng'].concat(dataFields)

          //Flatten the responses as well
          for(mDoc in docs){
            for(x in mDoc.data){
              for(y in mDoc.data[x]){
                mDoc[x + '/' + y] = mDoc.data[x][y]
              }
            }
            delete mDoc.data
          }
          console.log(docs)
          try {
            json2csv({data: cDocs, fields: fields}, function (err, csv) {
              if (err) return next(new Error('Failed to encode CSV'))
              var filename = 'Landscape Connect.csv'
              res.attachment(filename)
              res.end(csv)
            })
          } catch (err) {
            next(err)
          }
        })
        // for (var doc in docs) {
        //   cDocs.push(docs[doc].toCsv())
        // }
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

  var download_images = function (req, res) {
    try {
      var ids = req.params.id
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

  var download_kmz = function (req, res) {
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

  var download_image = function (req, res) {
    mongoose.model('feedback').findOne({_id: req.params.id}).exec(function (err, doc) {
      if (err) {
        return res.sendStatus(500)
      }
      res.setHeader('Content-Disposition', 'attachment; filename=' + req.params.file)
      common.downloadFromS3('uploads/' + doc.photo).pipe(res)
    })
  }

  return {
    download_kmz: download_kmz,
    download_image: download_image,
    download_docs: download_docs,
    download_csv: download_csv,
    download_images: download_images,
  }
}
