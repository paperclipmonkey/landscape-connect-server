var mongoose = require('mongoose')
var fs = require('fs')
var archiver = require('archiver')
var json2csv = require('json2csv')
var common = require('../common')

module.exports = function (app) {
  var download_csv = function (req, res, next) {
    download_docs_raw(req.params.id, function (docs) {
        if (docs.length === 0) {
          return next(new Error('Empty result'))
        }

        mongoose.model('questionnaire').findOne({serverId: req.params.id}, function (err, questionnaire) {
          //Get the section and questions names in to a useable format
          var dataFields = []
          for(x in questionnaire.sections){
            for(y in questionnaire.sections[x].questions){
              dataFields.push({
                label: questionnaire.sections[x].title + '/' + questionnaire.sections[x].questions[y].title,
                value: 'data.' + questionnaire.sections[x].sectionId + '.' + questionnaire.sections[x].questions[y].questionId
              })
            }
          }

          var basefields = [
            {
              label: 'media files',
              value: 'media' 
            },
            {
              label: 'date',
              value: function(row) {
                return new Date(row.timestamp).toLocaleString();
              },
            },
            {
              label: 'lat',
              value: 'lat' 
            },
            {
              label: 'lng',
              value: 'lng' 
            },
            {
              label: 'location accuracy',
              value: 'locAcc' 
            }
          ]

          var fields = basefields.concat(dataFields)

          try {
            json2csv({
              data: docs,
              fields: fields,
            }, function (err, csv) {
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
    download_docs_formatted([req.params.id], packageKML, res)
  }

  function download_docs_raw (id, fun, res) {
      mongoose.model('response').find({questionnaire: id}, function (err, responses) {
        if (err) {
          next(err)
          console.log(new Error('Could not find responses'))
        }
        fun(responses, res)
      })
  }

  function download_docs_formatted (id, fun, res) {
    mongoose.model('questionnaire').findOne({serverId: id}, function (err, questionnaire) {
      if (err) {
        next(err)
        console.log(new Error('Could not find questionnaire'))
      }
      mongoose.model('response').find({questionnaire: id}, function (err, responses) {
        if (err) {
          next(err)
          console.log(new Error('Could not find responses'))
        }

        for (var i = 0; i < responses.length; i++) {
          responses[i] = common.formatResponse(responses[i], JSON.parse(JSON.stringify(questionnaire)))
        }

        fun(responses, res)
      })
    })
  }

  function add_images (docs, zip) {
    var i = 0
    var x = 0
    while (i < docs.length) {
      while (x < docs[i].media.length) {
        //try {
          zip.append(common.downloadFromS3('uploads/' + docs[i].media[x]), {name: docs[i].media[x]})
        //} catch (err) {
        //  console.log(err)
        //}
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

  function packageKML (docs, res) {
    var zip = archiver.create('zip')
    res.attachment('earth.kmz')
    zip.pipe(res)

    zip.addListener('fail', function (err) {
      console.log("Zip failed")
      console.log(err)
    })

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
    download_csv: download_csv,
    download_media: download_media,
  }
}
