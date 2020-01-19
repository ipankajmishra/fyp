var express = require('express');
var app = express();

var config = require('./config.js')

var multer  = require('multer')
var upload = multer({ dest: 'uploads/' });

var AWS = require('aws-sdk');
AWS.config.region = config.region;

var uuid = require('node-uuid');
var fs = require('fs-extra');
var path = require('path');
var x;


app.use(express.static('public'));

var rekognition = new AWS.Rekognition({region: config.region});

function indentifyFaces(){
	app.post('/api/compare', upload.single("image"), function (req, res, next) {
		var bitmap = fs.readFileSync(req.file.path);
	
		rekognition.searchFacesByImage({
			 "CollectionId": config.collectionName,
			 "FaceMatchThreshold": 70,
			 "Image": { 
				 "Bytes": bitmap,
			 },
			 "MaxFaces": 1
		}, function(err, data) {
			 if (err) {
				 res.send(err);
			 } else {
				if(data.FaceMatches && data.FaceMatches.length > 0 && data.FaceMatches[0].Face)
				{
					x = data.FaceMatches[0].Face.ExternalImageId;
					res.send(data.FaceMatches[0].Face.ExternalImageId);	
					console.log(data.FaceMatches[0].Face.ExternalImageId);
					
				} else {
					res.send("Not recognized");
					console.log("Not Recognized");
				}
			}
		});
	});
}


exports.dataloop = indentifyFaces;