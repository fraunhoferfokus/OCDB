/*******************************************************************************
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2014 Fraunhofer FOKUS
 *******************************************************************************/

//Poi schema
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
exports.model = {
  "name": String,
  "description": String,
  "contact": {
    "address": String,
    "phone": String,
    "link": String,
    "email": String
  },
  "openHours":[
    {
      "fromdow": Number,
      "fromtime": Number,
      "todow": Number,
      "totime": Number,
      "startdate": Number,
      "occurance": Number,
      "every": Number
    }
  ],
  "fee": [
    {
      "currency": String,
      "value": Number,
      "hint": String
    }
  ],
  "tags": [
    String
  ],
  "coords": { "type": [], "index": '2d' },
  "city": {
    "refurl": String,
    "_city":{ "type": ObjectId, "ref": 'City' }
  },
  "media": {
    "refurl": String,
    "mediaCount": Number,
    "_media": [ { "type": ObjectId, "ref": 'Media' } ]
  },
  "public": {type:Boolean, default: false},
  "user": {
    "refurl": String,
    "_user":{ "type": ObjectId, "ref": 'User' },
  },
  "socatt": { "type": ObjectId, "ref": 'SocialAttributes' },
  "source": { "type": String, "unique": true, "sparse": true}
}
