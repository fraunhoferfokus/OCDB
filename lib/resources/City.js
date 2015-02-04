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

var _ = require("underscore");
var http = require("http");
var City = require('../models.js').model.City;

console.log("Loading city resources...");

var fieldsFilteredOut = { '__v': 0 };

//check if we have all the cities ;)
City.find({}).limit(1).exec(function(e,r){
	if(e || !r.length){
		console.log("hold on, grab a coffee. going to import cities...");
		importCities(0,0,function(importResult){
			console.log("imported "+importResult.length+" cities.");
		});
	}
})

//Resources
var getResource = function(type,params,query,body,cb){
	if(typeof query.name!="undefined"){
		getCitiesByLocationAndName(parseFloat(query.lon), parseFloat(query.lat), query.name, function(res){
			cb(0, res);
		},{limit: (parseInt(query.limit) || 1), offset: (parseInt(query.offset) || 0) });
	} if(typeof query.search=="undefined") {
		getCitiesFromDB(parseFloat(query.lon), parseFloat(query.lat), function(res){
			cb(0, res);
		},{limit: (parseInt(query.limit) || 20), offset: (parseInt(query.offset) || 0) });
	} else {
		searchCities(query.search, function(res){
			cb(0, res);
		},{limit: (parseInt(query.limit) || 20), offset: (parseInt(query.offset) || 0) });
	}
}

var postResource = function(type,params,query,body,cb){
	cb(0,{resource:"City-resource-post",type:type,params:params,body:body,query:query});
}

var putResource = function(type,params,query,body,cb){
	cb(0,{resource:"City-resource-put",type:type,params:params,body:body,query:query});
}

var deleteResource = function(type,params,query,body,cb){
	cb(0,{resource:"City-resource-delete",type:type,params:params,body:body,query:query});
}

//DB
var getCitiesFromDB = function(lon, lat, cb, options){
	City.find({ coords : { $near : [ lon , lat ] }})
		.skip(options.offset)
		.limit(options.offset+options.limit)
		.select(fieldsFilteredOut)
		.exec(function(e,r){
				cb((!e)?r:[]);
		} );
}

var getCitiesByLocationAndName = function(lon, lat, name, cb, options){
	City.find({ coords : { $near : [ lon , lat ] },  displayName: new RegExp('^'+name+'$', "i") })
		.skip(options.offset)
		.limit(options.offset+options.limit)
		.select(fieldsFilteredOut)
		.exec(function(e,r){
				cb((!e)?r:[]);
		} );
}

var searchCities = function(search, cb, options){
	City.find({ displayName: new RegExp(search, "i") })
		.skip(options.offset)
		.limit(options.offset+options.limit)
		.select(fieldsFilteredOut)
		.exec(function(e,r){
				cb((!e)?r:[]);
		} );
}

// City functions
var importCities = function(lat, lon, cb){


	var cityNameProvider = "http://overpass-api.de/api/interpreter?data="+
						"[out:json][timeout:300];("+
						"node[%22place%22=%22city%22]("+(lat-90)+","+(lon-180)+","+(lat-(-90))+","+(lon-(-180))+");" +
						//smaller cities,towns:
						//"node[%22place%22=%22town%22]("+(lat-0.5)+","+(lon-0.5)+","+(lat-(-0.5))+","+(lon-(-0.5))+");" +
						");out%20body%20qt;";

    http.get(cityNameProvider, function(res) {
    var result = '', length=0;

    res.on('data', function(chunk) {
    	length += chunk.length;
    	process.stdout.write("Downloading " + length + " bytes\r");
        result += chunk;
    });

    res.on('end', function() {
        var datares = JSON.parse(result);
        console.log("end.");

        console.log(datares.elements?datares.elements.length:"");

		var formatted = _.compact(
			_.map(datares.elements, function(v) {
				if(!v.tags || !v.tags.name || !v.lon || !v.lat )
				return;
				return {
				displayName: v.tags.name,
				coords: [ parseFloat(v.lon), parseFloat(v.lat) ]
				}
			})
		);

		var storeCity = function(v) {
				new City(v).save(function(err) {
				if(err) console.log('error saving #' + v.displayName);
				else process.stdout.write("saved #" + v.displayName + " \r");
				})
		};

		_.each(formatted, storeCity);
        cb(formatted || []);
    });
	}).on('error', function(e) {
		console.log("provider error: ",e);
	     cb([]);
	});
};

module.exports = {
	"GET" : getResource,
	"POST" : postResource,
	"PUT" : putResource,
	"DELETE" : deleteResource
};
