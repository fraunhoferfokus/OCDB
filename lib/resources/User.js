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

var uuid = require('node-uuid');

var User = require('../models.js').model.User;
var constants = require('../../constants.js');

var getResource = function(ep,params,query,body,cb){
	//user login
	var a = query.a || '', b = query.b || '';

	//logoff
	if(!a && !b && query['access_token']){

		User.find({"access.token": query['access_token']  }).limit(1).exec(function(e,r){
			if(e || !r.length) {
				cb(401,{});
			} else {
				for (var i = r[0].access.length - 1; i >= 0; i--) {
					if (r[0].access[i].lease != -1 && r[0].access[i].token === query['access_token']) {
						r[0].access.remove(r[0].access[i]._id);	
						r[0].save();
						cb(0,{"msg":"logoff"});
						break;
					}
				};
			}
		});

	} else {

		//check existance
		User.find({emailsha1:a}).limit(1).exec(function(e,r){
			if(e || !r.length) {
				cb(404,{});
			} else {

				var authN = false, authZ = "", toBePurge = [];
				for (var i = r[0].access.length - 1; i >= 0; i--) {
					if (r[0].access[i].lease === -1 && r[0].access[i].token === b) {
						authN = true;
					}

					if (r[0].access[i].lease != -1) {
						if(Date.now()-constants.SESSION_LEASE>r[0].access[i].lease){
							toBePurge.push(r[0].access[i]._id);
						}
					}
				};

				//clear old tokens
				for (var i = toBePurge.length - 1; i >= 0; i--) {
					r[0].access.remove(toBePurge[i]);	
				}

				if(authN){
					authZ = uuid.v1();
					var ak = {
						"token": authZ,
						"lease": Date.now()
					};
					r[0].access.push(ak);
					r[0].save();
					//update user
					cb(0,{"access_token": authZ, "uid": r[0]._id});
				} else {
					r[0].save();
					cb(401,{});
				}
			}
		});
	}
}

var postResource = function(ep,params,query,body,cb){
	//user registration
	var a = body.a, b = body.b, n = body.n;

	if(!a && !b && !n) {
		//request invalid
		cb(400,{});
		return;
	}

	//deferred registration
	if(query['access_token']){

		User.find({"access.token": query['access_token']  }).limit(1).exec(function(e,r){
			if(e || !r.length) {
				cb(401,{});
			} else {
				createUser(a, b, n, r[0]._id, cb);
			}
		});
	} else {
		//self registration
		createUser(a, b, n, null, cb);
	}
}

var createUser = function(a, b, n, p, cb){

	User.find({email:a}).limit(1).exec(function(e,r){
		if(r.length) {

			// TODO(mla): pw forgotten functionality

			cb(409,{});
		} else {

			// TODO(mla): send mail with verification link, save then user in db
			var u = {
				"name": n,
				"email": a,
				"emailsha1": SHA1(a),
				"access": [ {"token": b, "lease":-1} ]
			};
			if(p) {
				u.parents = p;
				console.log("creating deferred user...parent:",p);
			}

			new User(u).save(function(err) {
				if(err) console.log('error saving #' + u.name);// TODO(mla): send error code 
				else console.log("saved #" + u.name);
				cb(0,{name:n});
			});
		}
	});
}

var putResource = function(ep,params,query,body,cb){
	cb(0,{resource:"user-resource-put",ep:ep,params:params,body:body,query:query});
}

var deleteResource = function(ep,params,query,body,cb){
	cb(0,{resource:"user-resource-delete",ep:ep,params:params,body:body,query:query});
}

var getUserid = function(auth,cb){
	User.find({"access.token": auth  }).limit(1).exec(function(e,r){
		if(e || !r.length) {
			cb(false);
		} else {
			var authFound=false, toBePurge = [];
			for (var i = r[0].access.length - 1; i >= 0; i--) {
				//ok and refresh lease?
				if (r[0].access[i].lease != -1 && r[0].access[i].token === auth) {
					authFound = true;
					if(Date.now()-constants.SESSION_LEASE<r[0].access[i].lease){
						r[0].access[i].lease = Date.now();
						r[0].save();
						cb(r[0]._id);
					} else {
						cb(false);
					}
				}

				if(!authFound){
					cb(false);
				}
			}
		}
	});
}

module.exports = {
	"GET" : getResource,
	"POST" : postResource,
	"PUT" : putResource,
	"DELETE" : deleteResource,
	"AUTH" : getUserid 
};

//Tiny SHA1, from https://code.google.com/p/tiny-sha1/, Code license: MIT License
function SHA1(s){function U(a,b,c){while(0<c--)a.push(b)}function L(a,b){return(a<<b)|(a>>>(32-b))}function P(a,b,c){return a^b^c}function A(a,b){var c=(b&0xFFFF)+(a&0xFFFF),d=(b>>>16)+(a>>>16)+(c>>>16);return((d&0xFFFF)<<16)|(c&0xFFFF)}var B="0123456789abcdef";return(function(a){var c=[],d=a.length*4,e;for(var i=0;i<d;i++){e=a[i>>2]>>((3-(i%4))*8);c.push(B.charAt((e>>4)&0xF)+B.charAt(e&0xF))}return c.join('')}((function(a,b){var c,d,e,f,g,h=a.length,v=0x67452301,w=0xefcdab89,x=0x98badcfe,y=0x10325476,z=0xc3d2e1f0,M=[];U(M,0x5a827999,20);U(M,0x6ed9eba1,20);U(M,0x8f1bbcdc,20);U(M,0xca62c1d6,20);a[b>>5]|=0x80<<(24-(b%32));a[(((b+65)>>9)<<4)+15]=b;for(var i=0;i<h;i+=16){c=v;d=w;e=x;f=y;g=z;for(var j=0,O=[];j<80;j++){O[j]=j<16?a[j+i]:L(O[j-3]^O[j-8]^O[j-14]^O[j-16],1);var k=(function(a,b,c,d,e){var f=(e&0xFFFF)+(a&0xFFFF)+(b&0xFFFF)+(c&0xFFFF)+(d&0xFFFF),g=(e>>>16)+(a>>>16)+(b>>>16)+(c>>>16)+(d>>>16)+(f>>>16);return((g&0xFFFF)<<16)|(f&0xFFFF)})(j<20?(function(t,a,b){return(t&a)^(~t&b)}(d,e,f)):j<40?P(d,e,f):j<60?(function(t,a,b){return(t&a)^(t&b)^(a&b)}(d,e,f)):P(d,e,f),g,M[j],O[j],L(c,5));g=f;f=e;e=L(d,30);d=c;c=k}v=A(v,c);w=A(w,d);x=A(x,e);y=A(y,f);z=A(z,g)}return[v,w,x,y,z]}((function(t){var a=[],b=255,c=t.length*8;for(var i=0;i<c;i+=8){a[i>>5]|=(t.charCodeAt(i/8)&b)<<(24-(i%32))}return a}(s)).slice(),s.length*8))))}