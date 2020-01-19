/*
 * Copyright 2013. Amazon Web Services, Inc. All Rights Reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
**/
var express = require('express');
var router = express.Router();
var debug = require('debug')('node_blog:server');

var app = express();
app.use(express.static('public'));
// Load the SDK and UUID
var config = require('./config')
//var popup = require('popups');
var AWS = require('aws-sdk');
//var document = typeof document === 'undefined' ? '' : document;
var http = require('http');
var uuid = require('node-uuid');
var fs = require('fs-extra');
var path = require('path');
//var impp = require('./redirect');

AWS.config.region = config.region;
var rekognition = new AWS.Rekognition({region: config.region});

// AWS allows you to create separate collections of faces to search in. 
// This creates the collection we'll use.
/*function createCollection() {
	// Index a dir of faces
	rekognition.createCollection( { "CollectionId": config.collectionName }, function(err, data) {
	  if (err) {
		console.log(err, err.stack); // an error occurred
	  } else {
		console.log(data);           // successful response
	  }
	});
}*/


//var fs = require('fs'); 
fs.readdir( './Images', (error, files) => { 
   let totalFiles = files.length; // return the number of files
   console.log(totalFiles); // print the total number of files
});








// This loads a bunch of named faces into a db. It uses the name of the image as the 'externalId'
// Reads from a sub folder named 'faces'
function indexFaces() {
	var klawSync = require('klaw-sync')
	var a=0;
	var paths = klawSync('./faces', { nodir: true, ignore: [ "*.json" ] });

	paths.forEach((file) => {
	//	for(var p=0;p<2;p++){
		console.log("file Path" + " " +file.path);
		var p = path.parse(file.path);
		var name = p.name.replace(/\W/g, '');
		var bitmap = fs.readFileSync(file.path);

		rekognition.indexFaces({
		   "CollectionId": config.collectionName,
		   "DetectionAttributes": [ "ALL" ],
		   "ExternalImageId": name,
		   "Image": { 
			  "Bytes": bitmap
		   }
		}, function(err, data,req,res) {
			if (err) {
				console.log(err, err.stack); // an error occurred
			} else {
				console.log(data);  
				a=a+1;         // successful response
				fs.writeJson(file.path + ".json", data, err => {
					if (err) return console.error(err)
				});
				console.log("Success");
				console.log("a" + " "+ a);



				if(a==2)
				{
					console.log("Done Service");
					res.redirect('/');
					console.log("test");
					//response.redirect('./login.html'); // IDHER REDIRECT KRNA HAI
					//impp.test();
					
				}
				


				
				
				
				
				
				
				
				
			}
			
		}

		
		
		
		);
		//response.redirect('/login.html');
	}
	//return 0;
	
	
	
	);
	
	
}

// Once you've created your collection you can run this to test it out.
function FaceSearchTest(imagePath)
{
	var bitmap = fs.readFileSync(imagePath);

	rekognition.searchFacesByImage({
		"CollectionId": collectionName,
		"FaceMatchThreshold": 80,
		"Image": { 
			"Bytes": bitmap,
		},
		"MaxFaces": 1
	}, function(err, data) {
		if (err) {
			console.log(err, err.stack); // an error occurred
		} else {
			console.log(data);           // successful response
			console.log(data.FaceMatches[0].Face);
		}
	});
}


function glorify(request, response){
	
		console.log("Send back");
		response.send('https://google.com');
		
	}


// This uses the detect labels API call on a local image.
function DetectLabelsTest(imagePath)
{
	var bitmap = fs.readFileSync(imagePath);

	var params = {
		Image: { 
			Bytes: bitmap
		},
		MaxLabels: 10,
		MinConfidence: 50.0
	};

	rekognition.detectLabels(params, function(err, data) {
		if (err) {
			console.log(err, err.stack); // an error occurred
		} else {
			console.log(data);           // successful response
		}
	});
}

//createCollection();
//indexFaces();
exports.dataloop = indexFaces;