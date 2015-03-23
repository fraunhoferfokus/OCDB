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
(Note: This step is only for your convenience and if you have unpacked the appropriate mongoDB package as described above. You might wish to skip this step, if you wish to use your own mongoDB installation.)

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

To check if everything has worked fine and your OCDB instance is up and running, navigate your browser to the address: https://localhost/v1/frontend/ 

Tests
-----

A CURL based [smoke test](tests/docker_smoketest.sh) is available.

Deployment (Docker)
-------------------

You may wish to deploy an instance of OCDB using docker. See [OCDB docker instructions](README.docker.md) for more information.
For impatient:

```
$ docker run -d -p 8080:443 fraunhoferfokus/ocdb:latest
$ docker ps # to get your $CONTAINER_ID
$ # after a while (initial city names import takes approx. 5 minutes) execute the following... 
$ docker exec $CONTAINER_ID sh tests/docker_smoketest.sh
```
You should see an output like this:

```
$ docker exec 36cea3499fbd sh tests/docker_smoketest.sh
Using host: https://localhost:443
Registering user...(user may already be registered)
{"name":"user"}Log in...
Got this access token: 796aa7a0-d171-11e4-95ab-77c3c5d38528
Sample request (Get 10 cities around given location)...
[{"_id":"55102d39c06ca52100dc385f","displayName":"Berlin","coords":[13.3888599,52.5170365]},{"_id":"55102d39c06ca52100dc385e","displayName":"Potsdam","coords":[13.0591397,52.4009309]},{"_id":"55102d39c06ca52100dc385d","displayName":"Dessau-Roßlau","coords":[12.2429261,51.8311104]},{"_id":"55102d39c06ca52100dc3857","displayName":"Leipzig","coords":[12.3810549,51.3391827]},{"_id":"55102d39c06ca52100dc3910","displayName":"Szczecin","coords":[14.5509784,53.4302122]},{"_id":"55102d39c06ca52100dc38ee","displayName":"Dresden","coords":[13.7381437,51.0493286]},{"_id":"55102d39c06ca52100dc3856","displayName":"Halle (Saale)","coords":[11.9705452,51.4825041]},{"_id":"55102d39c06ca52100dc385c","displayName":"Magdeburg","coords":[11.6399609,52.1315889]},{"_id":"55102d39c06ca52100dc3858","displayName":"Chemnitz","coords":[12.9252977,50.8322608]},{"_id":"55102d39c06ca52100dc38f7","displayName":"Gorzów Wielkopolski","coords":[15.2400451,52.7309926]}]
OCDB: Smoke test ran successful.
```



API usage and JavaScript abstraction
------------------------------------

Once you OCDB instance is deployed you are ready to use the service within you Web based application. Simply add the JavaScript abstraction of the REST API into your HTML code:

```
<script type="text/javascript" src="https://domain.com/v1/frontend/ocdb-client.js"></script>
```

The available API calls can be viewed in the [OCDB client script](web_root/ocdb-client.js#L196)

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
