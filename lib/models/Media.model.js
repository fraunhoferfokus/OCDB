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
 
//Media schema
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
exports.model = {
  title: String,
  url: [ String ] ,
  type: String,
  user: {
    refurl: String,
    "_user":{ type: ObjectId, ref: 'User' },
  },
  timestamp: String,
  featured: Boolean,
  coords: { type: [], index: '2d' },
  poi: {
    refurl: String,
    "_poi":{ type: ObjectId, ref: 'Poi' }
  },
  attributes: mongoose.Schema.Types.Mixed,
  socatt: { type: ObjectId, ref: 'SocialAttributes' }
}
