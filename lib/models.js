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
 
var mongoose = require('mongoose');
if(!mongoose.connection.readyState){
	mongoose.connect('localhost', 'ocdb');
}

var UserModel = require('./models/User.model.js').model;
var User = mongoose.model('User', new mongoose.Schema(UserModel));

var CityModel = require('./models/City.model.js').model;
var City = mongoose.model('Cities', new mongoose.Schema(CityModel));

var PoiModel = require('./models/Poi.model.js').model;
var Poi = mongoose.model('Pois', new mongoose.Schema(PoiModel));

var MediaModel = require('./models/Media.model.js').model;
var Media = mongoose.model('Media', new mongoose.Schema(MediaModel));

var SocialAttributesModel = require('./models/SocialAttributes.model.js').model;
var SocialAttributes = mongoose.model('SocialAttributes', new mongoose.Schema(SocialAttributesModel));

var CheckinModel = require('./models/Checkin.model.js').model;
var Checkin = mongoose.model('Checkin', new mongoose.Schema(CheckinModel));

var CommentModel = require('./models/Comment.model.js').model;
var Comment = mongoose.model('Comment', new mongoose.Schema(CommentModel));

var LikeModel = require('./models/Like.model.js').model;
var Like = mongoose.model('Like', new mongoose.Schema(LikeModel));

var RatingModel = require('./models/Rating.model.js').model;
var Rating = mongoose.model('Rating', new mongoose.Schema(RatingModel));

module.exports = {
	model : {
		"User" : User,
		"City" : City,
		"Poi" : Poi,
		"Media" : Media,
		"SocialAttributes" : SocialAttributes,
		"Checkin" : Checkin,
		"Comment" : Comment,
		"Like" : Like,
		"Rating" : Rating
	}
}