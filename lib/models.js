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

var CityModel = require('./models/City.model.js').model;
var City = mongoose.model('Cities', mongoose.Schema(CityModel));

var PoiModel = require('./models/Poi.model.js').model;
var Poi = mongoose.model('Pois', mongoose.Schema(PoiModel));

var MediaModel = require('./models/Media.model.js').model;
var Media = mongoose.model('Media', mongoose.Schema(MediaModel));

module.exports = {
	model : {
		City : City,
		Poi : Poi,
		Media : Media
	}
}