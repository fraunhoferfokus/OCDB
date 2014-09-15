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
var Poi = require('../models.js').model.Poi;
var Media = require('../models.js').model.Media;
var SocialAttributes = require('../models.js').model.SocialAttributes;
var Checkin = require('../models.js').model.Checkin;
var Comment = require('../models.js').model.Comment;
var Like = require('../models.js').model.Like;
var Rating = require('../models.js').model.Rating;

console.log("Loading poi resources...");

var fieldsFilteredOut = { '__v': 0 };

var getResource = function(ep,params,query,body,cb){
	//poi direct access
	if(params.poiid && ep.type==="instance"){
		getPoiById(params.poiid,function(c,r){cb(c,r)});		
		return;
	}

	//city attached pois
	if(params.cityid && ep.type==="collection"){
		if(typeof query.lon2!="undefined" && typeof query.lat2!="undefined" ){
			getPoisByBBAndCity(parseFloat(query.lon), parseFloat(query.lat), parseFloat(query.lon2), parseFloat(query.lat2), params.cityid, function(res){
				cb(0, res);
			},{limit: (parseInt(query.limit) || 20), offset: (parseInt(query.offset) || 0) });
		} else {
			getPoisByLocationAndCity(parseFloat(query.lon), parseFloat(query.lat), params.cityid, function(res){
				cb(0, res);
			},{limit: (parseInt(query.limit) || 20), offset: (parseInt(query.offset) || 0) });
		}
		return;
	}

	//resource not matched/found
	cb(404,[]);
}

var postResource = function(ep,params,query,body,cb,uid){
	var mediaTmp = body.media;
	delete body.media;
	//city attached pois
	if(params.cityid && ep.type==="collection"){
		body.city = {"refurl": "cities/"+params.cityid, "_city":params.cityid};
		var sa = new SocialAttributes();
		sa.save();
		body.socatt = sa._id;
		new Poi(body).save(function(err, savedProduct) {

		if(err) {
			console.log('error saving poi. ',err);
			cb(400,{});
		} else {
			product=savedProduct.toObject();
			delete product.__v;
			if(mediaTmp && mediaTmp["_media"] && mediaTmp["_media"].length){
				product.media = { "_media": [] };
				var returnResult = _.after(mediaTmp["_media"].length, function(){ 
					product.media["refurl"]="/pois/"+product._id+"/media";
					product.media["mediaCount"]=product.media["_media"].length; 
					cb(0,product);
				});
				_.each(mediaTmp["_media"], function(media) {
					media.poi = { refurl:"pois/"+product._id, "_poi": product._id};
					new Media(media).save(function(err,mediaProduct) {
					if(err) {
						console.log('error saving media: ',  err);
						returnResult();
					}
					else {
						delete mediaProduct.__v;
						product.media["_media"].push(mediaProduct);
						console.log('saved media.', product.media["_media"].length);
						if(!savedProduct.media) savedProduct.media = { refurl: "pois/"+product._id+"/media", "_media": [], "mediaCount": 0};
						savedProduct.media["_media"].push(mediaProduct._id);
						savedProduct.media["mediaCount"]=(savedProduct.media["mediaCount"])?savedProduct.media["mediaCount"]+1:1;
						savedProduct.save(function(err, savedProduct) {

							if(err) {
								console.log('error saving poi. ',err);
								
							} else {
								console.log('success saving poi. ', savedProduct._id);
							}
							returnResult();
						});
						
					}
					})}		
				);
			} else {
				console.log("no media to save");
				cb(0,product);
			}
		}
		});
		return;
	}

	if(params.poiid && ep.type==="instance"){

		//check input: uid, pid, cid, lat, lon
		var input = {} , lon = body.coords && parseFloat(body.coords[0]), lat = body.coords && parseFloat(body.coords[1]);
		if (typeof lon != "number" || typeof lat != "number" || !uid) {
			cb(400,{});
			return;
		}
		input.coords = [lon,lat];
		input.user = {
    		refurl: "",
    		"_user":uid
		};
  		input.ts = Date.now();

  		var poiFoundCB = function(poi){

  			

			if(ep.path.indexOf("checkin")>=0){
				//input: - 
				var ci = new Checkin(input);
				ci.save();
				SocialAttributes.update({_id: poi.socatt},{$push: { 'checkins.checkin': ci}, $inc: { 'checkins.count': 1 } },
					function(e,r){
						if(!e && r) {
							cb(0,ci);
						} else {
							cb(500,{});
						}
					}
				);
				
				// TODO(mla): hook to raas
				return;
			}	
			if(ep.path.indexOf("comment")>=0){
				//input: comment
				console.log("comment",body);
				if (typeof body.comment != "string") {
					cb(400,{});
					return;
				}
				input.comment = body.comment;
				var co = new Comment(input);
				co.save();
				SocialAttributes.update({_id: poi.socatt},{$push: { 'comments.comment': co}, $inc: { 'comments.count': 1 } },
					function(e,r){
						if(!e && r) {
							cb(0,co);
						} else {
							cb(500,{});
						}
					}
				);

				// TODO(mla): hook to raas
				return;
			}

			if(ep.path.indexOf("like")>=0){
				//input: like
				console.log("like",body);
				if (typeof body.like != "boolean") {
					cb(400,{});
					return;
				}
				input.like = body.like;
				var li = new Like(input);
				li.save();
				SocialAttributes.update({_id: poi.socatt},{$push: { 'likes.like': li}, $inc: { 'likes.count': 1 } },
					function(e,r){
						if(!e && r) {
							cb(0,li);
						} else {
							cb(500,{});
						}
					}
				);
				// TODO(mla): hook to raas
				return;
			}
			if(ep.path.indexOf("rating")>=0){
				//input: rating
				console.log("rating",body);
				if (typeof body.rating != "number" && body.rating >= 0 && body.rating <= 5) {
					cb(400,{});
					return;
				}
				input.rating = body.rating;
				var ra = new Rating(input);
				ra.save();
				SocialAttributes.update({_id: poi.socatt},{$push: { 'ratings.rating': ra}, $inc: { 'ratings.count': 1 } },
					function(e,r){
						if(!e && r) {
							cb(0,ra);
						} else {
							cb(500,{});
						}
					}
				);
				// TODO(mla): hook to raas
				return;
			}
		}

		Poi.findById(params.poiid).populate("socatt").select({}).exec(function(e,r){
			if(!e && r){
				poiFoundCB(r);
			} else {
				cb(404,{});
			}
		} );
		
		return;
	}

	//resource not matched/found
	cb(404,{});
}

var putResource = function(ep,params,query,body,cb){
	cb(0,{resource:"poi-resource-put",ep:ep,params:params,body:body,query:query});
}

var deleteResource = function(ep,params,query,body,cb){
	cb(0,{resource:"poi-resource-delete",ep:ep,params:params,body:body,query:query});
}


//DB 
var getPoiById = function(id,cb){
	Poi.findById(id)
	.slice('socatt.checkins.checkin', 5)
	.populate('media._media socatt')
	.select(fieldsFilteredOut)
	.exec(function(e,r){
		if(!e){
			cb(0,r);
		} else {
			cb(e,{});
		}
	} );	
}

var getPoisByLocationAndCity = function(lon, lat, cityid, cb, options){
	console.log("ll");
	Poi.find({ coords : { $near : [ lon , lat ] }, "city._city": cityid })
		.skip(options.offset)
		.limit(options.offset+options.limit)
		.populate('media._media')
		.select(fieldsFilteredOut)
		.exec(function(e,r){ 
				cb((!e)?r:[]); 
		} );
}

var getPoisByBBAndCity = function(lon, lat, lon2, lat2, cityid, cb, options){
	console.log("bb");
	Poi.find({ coords : { $geoWithin : { $box: [ [ lon , lat ], [ lon2 , lat2 ] ] } }, "city._city": cityid })
		.skip(options.offset)
		.limit(options.offset+options.limit)
		.populate('media._media')
		.select(fieldsFilteredOut)
		.exec(function(e,r){ 
				cb((!e)?r:[]); 
		} );
}

// Poi functions
var importPois = function(cityid,inFile, cb){

		var input = require(inFile);

		var formatted = _.compact(
			_.map(input, function(v) {
				if(!v.name || !v.lon || !v.lat )
				return;
				return {
					"name": v.name,
					"description": v.description?v.description:"",
					"contact": {
					    "address": v.contact.address&&v.contact.address!="null"?v.contact.address:"",
					    "phone": v.contact.phone&&v.contact.phone.length&&v.contact.phone[0]!="null"?v.contact.phone[0]:"",
					    "link": v.contact.link&&v.contact.link!="null"?v.contact.link:"",
					    "email": v.contact.email&&v.contact.email!="null"?v.contact.email:""
					},
					"openHours":[],
					"fee": [],
					"tags": [
					    "city"
					],
					"coords": [parseFloat(v.lon), parseFloat(v.lat) ],
				    "city": {
				        "refurl": "cities/"+cityid,
				        "_city":cityid
				    },
				    "media": {
				    	"mediaCount": 0,
				    	"_media": []
				    }
				}
			})
		);
		var storePoi = function(v) {
				new Poi(v).save(function(err) {
				if(err) console.log('error saving #' + v.name);
				else console.log('saved #' + v.name);
				})
		};

		_.each(formatted, storePoi);
        cb(formatted || []);

};

//check if we have to import some pois
var args = {};
process.argv.forEach(function (val, index, array) {
		if(val.indexOf("=")!=-1){
			var arg = val.split("=");
			args[arg[0]]=arg[1];
		}
});
console.log(args);
if(args["cityid"] && args["infile"]){
	console.log("hold on, grab a coffee. going to import pois...");
	importPois(args["cityid"],args["infile"],function(importResult){
		console.log("imported/ing pois.");
	});
}



module.exports = {
	"GET" : getResource,
	"POST" : postResource,
	"PUT" : putResource,
	"DELETE" : deleteResource
};
