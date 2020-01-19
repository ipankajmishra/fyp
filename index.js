var express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var app = express();
var session = require('express-session')
var a1 =0;
//var popup = require('popups');
//var one = require('./image_upload');
app.use(express.static('public'));
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var one;
var str="";
var name="";
var aadhar="";
var upload1 = multer({ dest: 'uploadss/' });
var path = require('path')
var fs = require('fs-extra');
var imp = require('./import');
var ident = require('./identify');
var config = require('./config')
var AWS = require('aws-sdk');
AWS.config.region = config.region;
var rekognition = new AWS.Rekognition({region: config.region});
var dateTime = require('node-datetime');
var dt = dateTime.create();
//app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
var Storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./Images");
    },
    filename: function (res, file, callback) {
		console.log(file.originalname);
		
		/*if(file.originalname == null)
		{
			a1=a1+1;
			
		}
		else{*/
		//callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
		callback(null,name + "_" + aadhar + "_" + file.originalname);
		str = file.originalname;
		//}
    }
});



var upload = multer({ storage: Storage }).array("dataStack", 3); //Field name and max count

app.get('/', (request, response) =>  response.sendFile(`${__dirname}/index.html`));




app.post('/api/Upload', (request, response) => 
{
	console.log(request.body);
	if(request.body.name == '' || request.body.aadhar == '')
	{
		console.log("NO NaME or AAdhar");
		return response.redirect('/error_mandatory_Blank.html');
	}
	else{
		console.log("Upload Image");
		name=request.body.name;
		aadhar=request.body.aadhar;
		console.log(name);
		console.log(aadhar);

		console.log("Most IMportant");
		console.log(response);
		//originalUrl = "/upload_image.html";
		//return response.redirect(originalUrl.split(".").shift());
		return response.redirect('/upload_image.html');
		
	}
	
	
	
	/*upload(request, response, function (err) {
        if (err) {
			return response.redirect('/error.html'); 
			//response.end("Something went wrong!");
		}
		else
		{
			return response.redirect('/thanks.html');
		}
        
    });*/
});


app.post('/image/Upload', (request, response) => 
{
	console.log("Uploading Image");
	console.log(str);
	
	//one.image_data();
	upload(request, response, function (err) {
        if (err) {
			return response.redirect('/error.html'); 
			//response.end("Something went wrong!");
		}
		else
		{
			//console.log(request.body);
			//if(o)
			if(str != ""){
				return response.redirect('/thanks.html');
			}
			else{
				return response.redirect('/image_error.html');
			}
			
			
		}
        
    });
	


		
	
	/*upload(request, response, function (err) {
        if (err) {
			return response.redirect('/error.html'); 
			//response.end("Something went wrong!");
		}
		else
		{
			return response.redirect('/thanks.html');
		}
        
    });*/
});



app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username != "" && password !="") {
		//connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (username == "a" && password == "b") {
				//request.session.loggedin = true;
				//request.session.username = username;
				//response.send("Welcome back");
				response.redirect('/import_data.html');
			} else {
				response.send("Incorrect Username and/or Password!")
				
				//response.send('');
			}			
			response.end();
		//});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});


app.post('/server/upload', function(request, response){
	console.log("Import");
	var totalFiles=0;
	
	fs.readdir( './Images', (error, files) => { 
		totalFiles = files.length; // return the number of files
		console.log(totalFiles); // print the total number of files
		if(totalFiles==0)
		{
			response.redirect('/importempty.html');
		}
	});
	//imp.dataloop();

	var klawSync = require('klaw-sync')
	var a=0;
	var paths = klawSync('./Images', { nodir: true, ignore: [ "*.json" ] });

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
				


				if(a==totalFiles)
				{
					console.log("Done Service");
					var dt = dateTime.create();
					var formatted = dt.format('Y_m_d_H_M_S');
					var s="uploads/" + formatted;
					fs.mkdir(s, { recursive: true }, (err) => { if (err) throw err; });
					//formatted=0;
					//var d= "uploads/" + s
					fs.move('Images/', s , function (err) {
						if (err) return console.error(err)
						console.log("success! file moved successfully.")
						fs.mkdir('Images', { recursive: true }, (err) => { if (err) throw err; });
					 })
					
					

					response.redirect('/importsuccess.html');
					console.log("test");
					//response.redirect('./login.html'); // IDHER REDIRECT KRNA HAI
					//impp.test();
					
				}
				else{
					response.redirect('/importempty.html');
				}
				


				
				
				
				
				
				
				
				
			}
			
		}

		
		
		
		);
		//response.redirect('/login.html');
	}
	//return 0;
	
	
	
	);


})

app.post('/logout', function(request, response){
	return response.redirect('/login.html');
})


/*app.post('/image/identify', (request, response) => 
{*/
	 
	app.post('/image/identify', upload1.single("image"), function (req, res, next) {
		var bitmap = fs.readFileSync(req.file.path);
		console.log("Identifying Image");
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
					//res.send(data.FaceMatches[0].Face.ExternalImageId);	
					console.log(data.FaceMatches[0].Face.ExternalImageId);
					var name= data.FaceMatches[0].Face.ExternalImageId;
					var checksum=name.indexOf("_");
					name=name.substr(0, checksum);
					des="We are pleased that you took your precious time to explore us.";
					//res.redirect('../sayhi.html?error=denied');
					res.render("../sayhi.ejs", {name: name, des: des});
					
				} else {
					name="Unknown";
					des="You have not submitted your photo. Kindly submit details and try again with any of your photo.";
					res.render("../sayhi.ejs", {name: name, des: des});
					console.log("Not Recognized");
				}
			}
		});
	});
/*});*/




/*app.post('/api/data', (request, response) => {
	const postBody = request.body;
	console.log(postBody);
  });*/

app.listen(2000, function (a) {
    console.log("Listening to port 2000");
});