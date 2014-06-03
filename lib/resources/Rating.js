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
 
var getResource = function(ep,params,query,body,cb){
	cb(0,{resource:"rating-resource-get",ep:ep,params:params,body:body,query:query});
}

var postResource = function(ep,params,query,body,cb){
	cb(0,{resource:"rating-resource-post",ep:ep,params:params,body:body,query:query});
}

var putResource = function(ep,params,query,body,cb){
	cb(0,{resource:"rating-resource-put",ep:ep,params:params,body:body,query:query});
}

var deleteResource = function(ep,params,query,body,cb){
	cb(0,{resource:"rating-resource-delete",ep:ep,params:params,body:body,query:query});
}


module.exports = {
	"GET" : getResource,
	"POST" : postResource,
	"PUT" : putResource,
	"DELETE" : deleteResource 
};