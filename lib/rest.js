/*******************************************************************************
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
 *
 * Copyright 2014 Fraunhofer FOKUS
 *******************************************************************************/
 
var fs = require('fs');
var path = require('path');
var https = require('https');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var constants = require('../constants');
var endpoints = require(constants.FILE_ENDPOINTS).endpoints;
var resources = {};

var makeEndpointCB = function(ep){
	return function(req,res){
		if(!checkRequest(req,res,ep)) return;
		process.nextTick(function(){
			resources[ep.resource][req.method](ep,req.params,req.query,req.body,function(err, result){
				res.send(result);
			});
		});
	}
}

var checkRequest = function(req,res,ep){
	if (!req.headers['accept'] || req.headers['accept'].toLowerCase()!==constants.REQUIRED_MIMETYPE) return sendError(req,res,400,constants.ERROR_WRONG_MIMETYPE);
	if (!resources[ep.resource] || !resources[ep.resource][req.method]) return sendError(req,res,405,constants.ERROR_METHOD_NOT_ALLOWED);
	if (req.method==="POST" || req.method==="PUT"){
		if(req.headers['content-type'].indexOf(constants.REQUIRED_MIMETYPE)===-1) return sendError(req,res,400,constants.ERROR_REQUEST_INVALID);
	}

	//check authorization
	var auth = (req.headers['authorization'] && req.headers['authorization'].split(" ")[0]==="token" && req.headers['authorization'].split(" ")[1]) || req.query['access_token'];
	var register = req.query['register']==="1";
	var login = req.query['login']==="1";
	if(!auth && !register && !login) return sendError(req,res,401,constants.ERROR_REQUEST_UNAUTHORIZED);
	

	if(auth){
		//todo check if auth token is valid
		return true;
	}

	if(login){

		//send response;
		return false;
	}

	if(register){

		//send response;
		return false;
	}

	return true;
}

var sendError = function(req,res,code,msg){
	res.set('Content-Type', constants.REQUIRED_MIMETYPE);
	switch(code){
		case 401:
		case 400:
		case 404:
		case 405:
			res.status(code);
			res.send({"errorType":msg});
			break;
		default:
			break;
	}
	return false;
}

var initializeRestInterface = function(){

	app.use(function(req, res, next) {
	  res.header("Access-Control-Allow-Origin", "*");
	  res.header("Access-Control-Allow-Headers", "X-Requested-With,Authorization,Content-type");
	  res.header("Access-Control-Allow-Methods", "GET,POST,DELETE");
	    // intercept OPTIONS method
	    if ('OPTIONS' == req.method) {
	      res.send(200);
	    }
	    else {
	      next();
	    }
	});

	app.use(bodyParser());
	//frontend route
	console.log(path.join(__dirname, '../web_root'));
	app.use(constants.BASEURL_PATH+constants.API_VERSION+"/frontend", express.static(path.join(__dirname, '../web_root')));


	//register HTTP actions for each resource 
	console.log("Registering routes...");
	for(var epx=0; epx<endpoints.length; epx++) {
		console.log(constants.BASEURL_PATH+constants.API_VERSION+endpoints[epx].path);
		app.all(constants.BASEURL_PATH+constants.API_VERSION+endpoints[epx].path, makeEndpointCB.call(app,endpoints[epx]));
		if(!resources[endpoints[epx].resource]){
			try{
				resources[endpoints[epx].resource] = require(constants.LOCATION_RESOURCES+endpoints[epx].resource);
			} catch (e) {console.error(e)}
		}
	}
	app.all(constants.BASEURL_PATH+constants.API_VERSION+"/*",function(req,res){sendError(req,res,404,constants.ERROR_NOT_FOUND)});


	try{
		var loc = constants.CERTIFICATE_LOCATION.replace("~",process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']);
		var key = fs.readFileSync(loc+'key.pem');
		var cert = fs.readFileSync(loc+'cert.pem');
	}catch(e){
		console.error(e);
		console.log("---> See how to create certificates at: http://nodejs.org/api/tls.html");
		process.exit(1);
	}
	var https_options = {
	    key: key,
	    cert: cert
	};
	https.createServer(https_options, app).listen(constants.SERVER_PORT);

}

initializeRestInterface();