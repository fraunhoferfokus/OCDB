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

var errors = {
	200: constants.ERROR_OK,
	400: constants.ERROR_REQUEST_INVALID,
	401: constants.ERROR_REQUEST_UNAUTHORIZED,
	404: constants.ERROR_NOT_FOUND,
	405: constants.ERROR_METHOD_NOT_ALLOWED,
	409: constants.ERROR_CONFLICT,
	415: constants.ERROR_WRONG_MIMETYPE,
	500: constants.ERROR_INTERNAL
};

var makeEndpointCB = function(ep){
	return function(req,res){
		var cb = function(uid){
			//uid == false-> no auth, otherwise known user/anonymous access
			if(!uid) return;
			process.nextTick(function(){
				resources[ep.resource][req.method](ep,req.params,req.query,req.body,function(err, result){
					if(err){
						sendError(req,res,err);
					} else {
						if(!res.issent) {
							res.issent = true;
							res.send(result);
						}
					}
				},uid);
			});
		}
		checkRequest(req,res,ep,cb);
	}
}

var checkRequest = function(req,res,ep,cb){
	if (!req.headers['accept'] || req.headers['accept'].toLowerCase()!==constants.REQUIRED_MIMETYPE) return cb( sendError(req,res,400) );
	if (!resources[ep.resource] || !resources[ep.resource][req.method]) return cb( sendError(req,res,405) );
	if (req.method==="POST" || req.method==="PUT"){
		if(!req.headers['content-type'] || req.headers['content-type'].indexOf(constants.REQUIRED_MIMETYPE)===-1) return cb( sendError(req,res,400) );
	}

	var regOrLogin = false, auth = (req.headers['authorization'] && req.headers['authorization'].split(" ")[0]==="token" && req.headers['authorization'].split(" ")[1]) || req.query['access_token'];
	req.query['access_token'] = auth;

	//allow users to login
	if (req.method==="GET" && ep.resource==="User" && req.query && req.query['a'] && req.query['b']) {
		regOrLogin = true;
	}

	//allow users to register
	if (req.method==="POST" && ep.resource==="User" && req.body && req.body.a && req.body.b && req.body.n) {
		regOrLogin = true;
	}

	//check if immediate not auth should be send
	if(!auth && !regOrLogin) return cb( sendError(req,res,401) );

	if(auth){
		resources["User"]["AUTH"](auth,function(uid){
			if(!uid) sendError(req,res,401);
			cb(uid);
		});
	} else {
		if(regOrLogin) cb( true );
	}
}

var sendError = function(req,res,code){
	if (res.issent) return;
	res.set('Content-Type', constants.REQUIRED_MIMETYPE);
	switch(code){
		case 200:
		case 401:
		case 400:
		case 404:
		case 405:
		case 409:
		case 415:
			res.status(code);
			res.send({"errorType": errors[code]});
			break;
		default:
			res.status(500);
			res.send({"errorType": errors[code]});
			break;
	}
	res.issent = true;
	return false;
}

var initializeRestInterface = function(){

	app.use(function(req, res, next) {
	  res.header("Access-Control-Allow-Origin", "*");
	  res.header("Access-Control-Allow-Headers", "X-Requested-With,Authorization,Content-type");
	  res.header("Access-Control-Allow-Methods", "GET,POST,DELETE");
	    // intercept OPTIONS method
	    if ('OPTIONS' == req.method) {
	      res.status(200).end();
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
