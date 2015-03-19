OCDB
====

This documentation provides information on how to setup one instance of the OCDB service. Once setup an RESTful API with JavaScript Object Notion (JSON) as data transport format will be available. The API provides access to the content available in the OCDB and provides means to input user generated content (UCG). Using this API data for different cities and their Points of Interests can be retrieved for a usage within Web applications. 

Installation
------------

Required software components for a successful installation and operation. Make sure the following components are available on the installation machine / server: 
* git
* node.js

Execute the following steps to install a OCDB instance on your machine / server.

```
$ git clone https://github.com/fraunhoferfokus/ocdb
$ cd ocdb
$ npm install 
```

The underlying database is a document-oriented database, in particular mongoDB. Choose the appropriate binaries from the Mongo DB website (http://www.mongodb.org/downloads) and extract them into `` ocdb/db/mongodb ``. Afterwards the mongoDB deamon should be available at  `` ocdb/db/mongodb/bin/mongod ``

Configuration
-------------

Check the configuration file at `` ocdb/constants.js `` and change if necessary. Place the SSL certificates at the location specified in the configuration file. See http://nodejs.org/api/tls.html on more inforamtion on how to generate certificates if none at hand.

For development purposes you might wish to use self-signed certificates. Just run the following script to accomplish this.

```
$ cd ocdb
$ ./gencerts.sh
```

Running
-------

Firstly, start mongoDB using the provided start script:

```
$ cd ocdb
$ ./startdb.sh
```

Secondly, start the service by executing the follwing command:

```
$ cd ocdb
$ node .
```

Hint: In case of a port below 1024 start the service using sudo.

Problems
--------

Please use the issue tracker to report any problems you might encounter.


License
-------
```
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
```
