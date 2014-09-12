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

//OCDB V1 Specification

exports.endpoints = [
 {
 	"path" : "/cities",
 	"type" : "collection",
 	"resource" : "City"
 },
 {
 	"path" : "/cities/:cityid",
 	"type" : "instance",
 	"resource" : "City"
 },
 {
 	"path" : "/cities/:cityid/checkin",
 	"type" : "instance",
 	"resource" : "City"
 },
 {
 	"path" : "/cities/:cityid/comment",
 	"type" : "instance",
 	"resource" : "City"
 },
 {
 	"path" : "/cities/:cityid/like",
 	"type" : "instance",
 	"resource" : "City"
 },
 {
 	"path" : "/cities/:cityid/rating",
 	"type" : "instance",
 	"resource" : "City"
 },



 {
 	"path" : "/cities/:cityid/pois",
 	"type" : "collection",
 	"resource" : "Poi"
 },
 {
 	"path" : "/pois",
 	"type" : "collection",
 	"resource" : "Poi"
 },
 {
 	"path" : "/pois/:poiid",
 	"type" : "instance",
 	"resource" : "Poi"
 },
 {
 	"path" : "/pois/:poiid/checkin",
 	"type" : "instance",
 	"resource" : "Poi"
 },
 {
 	"path" : "/pois/:poiid/comment",
 	"type" : "instance",
 	"resource" : "Poi"
 },
 {
 	"path" : "/pois/:poiid/like",
 	"type" : "instance",
 	"resource" : "Poi"
 },
 {
 	"path" : "/pois/:poiid/rating",
 	"type" : "instance",
 	"resource" : "Poi"
 },



 {
 	"path" : "/pois/:poiid/media",
 	"type" : "collection",
 	"resource" : "Media"
 },
 {
 	"path" : "/media/:mediaid",
 	"type" : "instance",
 	"resource" : "Media"
 },



 {
 	"path" : "/users",
 	"type" : "collection",
 	"resource" : "User"
 }
]