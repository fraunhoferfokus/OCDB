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
var Media = require('../models.js').model.Media;
var Poi = require('../models.js').model.Poi;

console.log("Loading media resources...");

var fieldsFilteredOut = { '__v': 0 };

var getResource = function(ep,params,query,body,cb){
	//city attached pois
	if(params.poiid && ep.type==="collection"){
			getMediaByPoiID(params.poiid, function(res){
				cb(0, res);
			},{limit: (parseInt(query.limit) || 20), offset: (parseInt(query.offset) || 0) });
		return;
	}

	//resource not matched/found
	cb(404,[]);
}

var postResource = function(ep,params,query,body,cb){
	if(params.poiid){
		saveMedia(params.poiid, body, cb);
		return;
	} 
	if(params.mediaid){
		console.log();
		delete body._id;
		Media.update({_id:params.mediaid}, { $set: body }, {}, function(err,affected,raw){
			if(err){
				cb(400,{});
			} else {
				cb(0,raw);
			}
		})
		return;
	} 
	cb(400,[]);
}

var putResource = function(ep,params,query,body,cb){
	cb(0,{resource:"media-resource-put",ep:ep,params:params,body:body,query:query});
}

var deleteResource = function(ep,params,query,body,cb){
	//media delete

	if(params.mediaid && ep.type==="instance"){
		console.log("Deleting media: ",params.mediaid);
		Media.find({ id:params.mediaid }).remove( function(err, res){
			console.log(err, res);
				if (err) {
					cb(404, res);
				};
				cb(0, res);
			} );
			
		return;
	}

	//resource not matched/found
	cb(404,[]);
}

var getPoiById = function(id,cb){
	Poi.findById(id)
	.populate('media._media')
	.select(fieldsFilteredOut)
	.exec(function(e,r){ 
		cb((!e)?r:{}); 
	} );	
}

var saveMedia = function(poiid, media, cb){
	getPoiById(poiid, function(poi){
		if(!poi._id){
			cb(404,{});
			return;
		}
		if(!media || !media.url || !media.url.length || !media.url[0]){
			cb(400,{});
			return;
		}
		var resultArray = [];
		if(media && media.length){
		var returnResult = _.after(media.length, function(){ 
			if(resultArray.length){
				cb(0,resultArray);
			} else {
				cb(400,[]);
			}
		});
		_.each(media, function(mediaItem) {
			mediaItem.poi = { refurl:"pois/"+poiid, "_poi": poiid};
			new Media(mediaItem).save(function(err,mediaProduct) {
			if(err) {
				console.log('error saving media: ',  err);
				returnResult();
			}
			else {
				delete mediaProduct.__v;
				resultArray.push(mediaProduct);
				if(!poi.media) poi.media = {refurl: "pois/"+poiid+"/media", "_media": [], "mediaCount": 0}
				poi.media["_media"].push(mediaProduct._id);
				poi.media["mediaCount"]=(poi.media["mediaCount"])?poi.media["mediaCount"]+1:1;
				poi.save(function(e,p) {
					if(e) {console.log("Error saving media to poi. ",e); }
					else console.log('saved media.');
					returnResult();
				});
			}
			})}		
		);
		} else {
		//single media save request
		media.poi = { refurl:"pois/"+poiid, "_poi": poiid};
		new Media(media).save(function(err,mediaProduct) {
		if(err) {
			console.log('error saving media: ',  err);
			cb(400,{});
		}
		else {
			delete mediaProduct.__v;
			if(!poi.media) poi.media = {refurl: "pois/"+poiid+"/media", "_media": [], "mediaCount": 0}
			poi.media["_media"].push(mediaProduct._id);
			poi.media["mediaCount"]=(poi.media["mediaCount"])?poi.media["mediaCount"]+1:1;
			poi.save(function(e,p) {
				if(e) {console.log("Error saving media to poi. ",e); }
				else console.log('saved media.');
				cb(0,mediaProduct);
			});
		}
		})
		}
	});
}


var getMediaByPoiID = function(poiid, cb, options){
	Media.find({ "poi._poi": poiid })
		.skip(options.offset)
		.limit(options.offset+options.limit)
		.select(fieldsFilteredOut)
		.exec(function(e,r){ 
				cb((!e)?r:[]); 
		} );
}

module.exports = {
	"GET" : getResource,
	"POST" : postResource,
	"PUT" : putResource,
	"DELETE" : deleteResource
};