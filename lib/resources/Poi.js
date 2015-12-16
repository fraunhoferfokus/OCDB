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

var getResource = function(ep,params,query,body,cb,uid){
	//poi direct access
	if(params.poiid && ep.type==="instance"){
		var options={};
		if(ep.path.indexOf("comment")>=0){
			options.commentOffset=query.offset?query.offset:0;
			options.commentLimit=query.limit?query.limit:5;
		}
		if(query.expand){
			options.expand=query.expand;
		}
		getPoiById(params.poiid,function(c,r){cb(c,r)},uid,options);
		return;
	}

	//city attached pois
	if(params.cityid && ep.type==="collection"){
		if(typeof query.lon2!="undefined" && typeof query.lat2!="undefined" ){
			getPoisByBBAndCity(parseFloat(query.lon), parseFloat(query.lat), parseFloat(query.lon2), parseFloat(query.lat2), params.cityid, function(err,res){
				cb(err, res);
			},{limit: (parseInt(query.limit) || 20), offset: (parseInt(query.offset) || 0), uid:uid });
		} else {
			getPoisByLocationAndCity(parseFloat(query.lon), parseFloat(query.lat), params.cityid, function(err,res,meta){
				cb(err, res, meta);
			},{search: query.search||'', limit: (parseInt(query.limit) || 20), offset: (parseInt(query.offset) || 0), uid:uid });
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

		//do we have an id already, so only update...
		var poiid = body._id;
		delete body._id;

		if(poiid) {
			Poi.findById(poiid)
			.exec(function(e,product){
				if(!e){
						var conditions = { _id: poiid };
						// TODO(mla): temporary remove location update
						delete body.coords;
						var update = { $set: body };
						var options = { upsert: false };
						Poi.update(conditions, update, options, function(err, changesElements) {

						if(err && !changesElements) {
							console.log('error saving poi. ',err);
							cb(400,{});
						} else {
							//save attached media
							if (mediaTmp && mediaTmp._media && mediaTmp._media.length) {
								var mediaObjects = _.map(mediaTmp._media, function(v) { var m = new Media(v); m.save(); return m; } );
								Poi.update({_id: poiid},{$pushAll: { 'media._media': mediaObjects }, $inc: { 'media.mediaCount': mediaObjects.length } },
									{upsert: true},
									function(e,r){
										if(!e && r) {
											Poi.findById(r._id)
												.populate("socatt media._media")
												.exec(function(e,product){
													getPopulatedPoi(product, cb, uid);
												});
										} else {
											console.log(e);
											cb(500,{});
										}
									}
								);
							} else {
								console.log("no media to save");
								Poi.findById(poiid)
									.populate("socatt media._media")
									.exec(function(e,product){
										getPopulatedPoi(product, cb, uid);
									});
							}
						}

					});

				} else {
					cb(404,{});
				}
			} );

		} else {
			//post of a new poi
			var sa = new SocialAttributes();
			sa.save();
			body.socatt = sa._id;

			//assign the owner
			body.user = {
	    		refurl: "",
	    		"_user":uid
			};

			new Poi(body).save(function(e,r){
					if(!e && r) {
							if (mediaTmp && mediaTmp._media && mediaTmp._media.length) {
								var mediaObjects = _.map(mediaTmp._media, function(v) { var m = new Media(v); m.save(); return m; } );
								Poi.update({_id: r._id},{$pushAll: { 'media._media': mediaObjects }, $inc: { 'media.mediaCount': mediaObjects.length } },
									{upsert: true},
									function(e,updatedDocs){
										if(!e && r) {
											Poi.findById(r._id)
												.populate("socatt media._media")
												.exec(function(e,product){
													getPopulatedPoi(product, cb, uid);
												});
										} else {
											cb(500,{});
										}
									}
								);
							} else {
								console.log("no media to save");
								Poi.findById(r._id)
									.populate("socatt media._media")
									.exec(function(e,product){
										getPopulatedPoi(product, cb, uid);
									});
							}
					} else {
						cb(500,{});
					}
			});


		}
		return;
	}

	if(params.poiid && ep.type==="instance"){

		//update existing poi
		if(ep.path.indexOf("checkin")<0 &&
			 ep.path.indexOf("comment")<0 &&
			 ep.path.indexOf("like")<0 &&
			 ep.path.indexOf("rating")<0 ){
			delete body._id;
			delete body.media;
			var conditions = { _id: params.poiid };
			var update = { $set: body};
			var options = { upsert: false };

			Poi.update(conditions, update, options, function(e,r){
						if(!e && r) {
							cb(0,r);
						} else {
							cb(400,{});
						}
					});
			return;
		}


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

			if (!poi.socatt) {
				var sa = new SocialAttributes();
				sa.save(function(err){
					if (err) return console.log(err);
					console.log("added socatt to existing poi.");
					poi.socatt = sa._id;
					poi.save(function(err){
						if (err) return console.log(err);
						poiFoundCB(poi);
					});
				});
				return;
			}

			if(ep.path.indexOf("checkin")>=0){
				//input: -
				var ci = new Checkin(input);
				ci.save();
				SocialAttributes.update({_id: poi.socatt},{$push: { 'checkins.checkin': ci}, $inc: { 'checkins.count': 1 } },
					function(e,r){
						if(!e && r) {
							Poi.findById(poi._id)
								.populate("media._media socatt")
								.exec(function(e,product){
									getPopulatedPoi(product, cb, uid);
								});
						} else {
							console.log(e);
							cb(500,{});
						}
					}
				);
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
							Poi.findById(poi._id)
								.populate("media._media socatt")
								.exec(function(e,product){
									getPopulatedPoi(product, cb, uid);
								});
						} else {
							cb(500,{});
						}
					}
				);
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
				SocialAttributes.update({_id: poi.socatt},{$push: { 'likes.like': li}, $inc: { 'likes.count': input.like?1:-1 } },
					function(e,r){
						if(!e && r) {
							Poi.findById(poi._id)
								.populate("media._media socatt")
								.exec(function(e,product){
									getPopulatedPoi(product, cb, uid);
								});
						} else {
							cb(500,{});
						}
					}
				);
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
				input._socatt = poi.socatt;
				var ra = new Rating(input);
				ra.save();
				SocialAttributes.update({_id: poi.socatt},{$push: { 'ratings.rating': ra}, $inc: { 'ratings.count': 1 } },
					function(e,r){
						if(!e && r) {
							// TODO(mla): isnt there a better way to keep the avg value up to date?
							Rating.aggregate({ $match: {_socatt: poi.socatt._id || poi.socatt }})
							.group({_id: '$_socatt', rating: { $avg: '$rating'}})
							.exec(function(e,r){
								if(!e && r.length && typeof r[0].rating === "number" ){
									//store the average
									SocialAttributes.update({_id: poi.socatt},{$set: { 'ratings.average': r[0].rating} },
										function(e,r){
											if(!e && r){
												Poi.findById(poi._id)
													.populate("media._media socatt")
													.exec(function(e,product){
														getPopulatedPoi(product, cb, uid);
													});
										} else {
											cb(500,{});
										}
									});
								} else {
									cb(500,{});
								}
							});

						} else {
							cb(500,{});
						}
					}
				);
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
var getPoiById = function(id,cb,uid,options){
	Poi.findById(id)
	.populate('media._media socatt')
	.select(fieldsFilteredOut)
	.exec(function(e,product){
		if(!e){
				getPopulatedPoi(product, cb, uid, options);
		} else {
			cb(e,{});
		}
	} );
}

var getPopulatedPoi = function(product, cb, uid, options, cid){
	options=options||{commentLimit:5,commentOffset:0};
	var opts = [
		{path:"socatt.likes.like", model:"Like", match:{"user._user":uid}, options:{sort: { ts: -1 }, limit:1}},
		{path:"socatt.checkins.checkin", model:"Checkin", match:{"user._user":uid}, options:{sort: { ts: -1 }, limit:1}},
		{path:"socatt.ratings.rating", model:"Rating", match:{"user._user":uid}, options:{sort: { ts: -1 }, limit:1}},
		{path:"socatt.comments.comment", model:"Comment", options:{sort: { ts: -1 }, limit:options.commentLimit, skip: options.commentOffset}},
	];
	if(options.expand==="socatt"){
		opts = [
			{path:"socatt.likes.like", model:"Like", options:{sort: { ts: -1 }}},
			{path:"socatt.checkins.checkin", model:"Checkin", options:{sort: { ts: -1 }}},
			{path:"socatt.ratings.rating", model:"Rating", options:{sort: { ts: -1 }}},
			{path:"socatt.comments.comment", model:"Comment", options:{sort: { ts: -1 }}},
		];
	}
	Poi.populate(product,opts,function(err,res){
		if(err) return console.log(err) || cb(err);
		var opts = [
			{path:"socatt.comments.comment.user._user", model:"User", select: "name _id attributes"},
			{path:"socatt.checkins.checkin.user._user", model:"User", select: "name _id attributes"},
			{path:"socatt.ratings.rating.user._user", model:"User", select: "name _id attributes"},
			{path:"socatt.likes.like.user._user", model:"User", select: "name _id attributes"},
		];
		if(options.expand==="socatt"){
			opts = [
				{path:"socatt.comments.comment.user._user", model:"User", select: "name _id email"},
				{path:"socatt.checkins.checkin.user._user", model:"User", select: "name _id email"},
				{path:"socatt.ratings.rating.user._user", model:"User", select: "name _id email"},
				{path:"socatt.likes.like.user._user", model:"User", select: "name _id email"},
			];
		}
		Poi.populate(product,opts,function(err,res){
		if(err) console.log(err);
			Poi.count({"city._city": cid},function(err2,recordsTotal){
				if(err2) recordsTotal=-1;
				Poi.count({"user._user": uid, "city._city": cid},function(err3,recordsOwned){
					if(err3) recordsOwned=-1;
					cb(err,res,{recordsOwned:recordsOwned,recordsTotal:recordsTotal,recordsFiltered:recordsTotal});
				});
			});
		});
	});
}

var getPoisByLocationAndCity = function(lon, lat, cityid, cb, options){
	console.log("ll");
	var q = { coords : { $near : [ lon , lat ] }, "city._city": cityid };
	if(options.search){
		q.name=new RegExp(options.search, "i");
	}
	Poi.find(q)
		.or([{"public": true}, {"user._user": options.uid}])
		.skip(options.offset)
		.limit(options.offset+options.limit)
		.populate('media._media socatt')
		.select(fieldsFilteredOut)
		.exec(function(e,product){
			if(!e){
				getPopulatedPoi(product, function(err,res,meta){
					Poi.count({name: new RegExp(options.search, "i"), "city._city": cityid},function(err3,recordsFiltered){
						if(err3) recordsFiltered=-1;
						meta.recordsFiltered=recordsFiltered;
						cb(err,res,meta);
					});
				}, options.uid, null, cityid);
			} else {
				cb(e,{});
			}
		} );
}

var getPoisByBBAndCity = function(lon, lat, lon2, lat2, cityid, cb, options){
	console.log("bb");
	Poi.find({ coords : { $geoWithin : { $box: [ [ lon , lat ], [ lon2 , lat2 ] ] } }, "city._city": cityid })
		.or([{"public": true}, {"user._user": options.uid}])
		.skip(options.offset)
		.limit(options.offset+options.limit)
		.populate('media._media socatt')
		.select(fieldsFilteredOut)
		.exec(function(e,product){
			if(!e){
				getPopulatedPoi(product, cb, options.uid);
			} else {
				cb(e,{});
			}
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
