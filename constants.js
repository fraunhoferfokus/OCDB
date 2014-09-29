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

module.exports = {
	CERTIFICATE_LOCATION : "~/.ocdb/",
	REQUIRED_MIMETYPE : "application/json",
	FILE_ENDPOINTS : "./endpoints",
	LOCATION_RESOURCES : "./resources/",
	SERVER_PORT : 443,
	BASEURL_PATH : "/",
	API_VERSION : "v1",
	SESSION_LEASE : 43200000,
	ERROR_OK : "ok",
	ERROR_WRONG_MIMETYPE : "wrong_mimetype",
	ERROR_METHOD_NOT_ALLOWED : "method_not_allowed",
	ERROR_NOT_FOUND : "resource_not_found",
	ERROR_CONFLICT : "resource_conflict",
	ERROR_REQUEST_INVALID : "request_invalid",
	ERROR_REQUEST_UNAUTHORIZED : "request_unauthorized",
	ERROR_INTERNAL : "internal_server_error"
}
