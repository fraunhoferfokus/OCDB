OCDB
====

This documentation provides information on how to setup one instance of the OCDB service. After setup, an RESTful API with JavaScript Object Notion (JSON) as data transport format will be available to be used within your native and web apps. The API provides access to the content made available in the OCDB and provides means to input user generated content (UCG). Using an API the data for different cities and their Points of Interests (POI) can be retrieved for a usage within your applications.

TL;DR
-----

```
$ # on a debian-based (# and osx) system. Notice: accatping PRs with instructions for your system!
$ git clone https://github.com/fraunhoferfokus/ocdb
$ cd ocdb
$ npm install

$ # db
$ mkdir -p db/mongodb/bin
$ curl -o /tmp/mongodb.tgz https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-3.0.2.tgz # osx: https://fastdl.mongodb.org/osx/mongodb-osx-x86_64-3.0.2.tgz
$ tar -xvf /tmp/mongodb.tgz --strip-components 2 -C db/mongodb/bin mongodb-linux-x86_64-3.0.2/bin # osx: mongodb-osx-x86_64-3.0.2/bin
$ ./startdb.sh

$ # certs
$ ./gencerts.sh

$ # start the service
$ sudo node .
$ # let it start until it says "Up and running ;)"

$ # on a second shell/terminal
$ curl -s -k -X POST "https://localhost/v1/users" -H "Accept: application/json" -H "Content-Type: application/json" -d "{\"n\":\"user\",\"a\":\"user@domain.com\",\"b\":\"441d05da1f570f55e0c8172787cdc1302ecad5db\"}"
$ at=`curl -s -k -X GET "https://localhost/v1/users?a=12dea96fec20593566ab75692c9949596833adc9&b=441d05da1f570f55e0c8172787cdc1302ecad5db" -H "Accept: application/json"  | cut -f 4 -d \" -`
$ curl -s -k -X GET "https://localhost/v1/cities?lat=52.5258885&lon=13.3142135&offset=0&limit=10" -H "Accept: application/json" -H "Authorization: token "$at
$ echo "Your token for the try out API console: "$at
```

Congrats. You did it! Want to explore the API? Try out the API console with [your private installation](http://fraunhoferfokus.github.io/OCDB/apiconsole/index.html?url=https://localhost/v1/frontend/api.json) (Notice: this will only work if you succeeded with the steps before) or try out [our public installation](http://fraunhoferfokus.github.io/OCDB/) (Notice: see the details there).


Installation
------------

Required software components for a successful installation and operation. Make sure the following components are available on the installation machine / server:
* git
* node.js
* mongoDB (see details below)

Execute the following steps to install a OCDB instance on your machine / server.

```
$ git clone https://github.com/fraunhoferfokus/ocdb
$ cd ocdb
$ npm install
```

Please consider a 64 bit host machine for mongoDB.
The underlying database is a document-oriented database, in particular mongoDB. Choose the appropriate binaries from the Mongo DB website (http://www.mongodb.org/downloads) and extract them into `` ocdb/db/mongodb ``. Afterwards the mongoDB deamon should be available at  `` ocdb/db/mongodb/bin/mongod ``

Important notice: remember to review the default configuration of mongoDB when going to deploy on a public machine!

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

Playground Example App
----------------------

Having got up to this point successfully you may now with to play around with the service.
Have a look at the [playground source code](web_root/playground) for a fully functional first example. At the [project's web page](http://fraunhoferfokus.github.io/OCDB/) a hosted version of this example is linked.


Deployment (Docker)
-------------------

You may wish to deploy an instance of OCDB using docker. See [OCDB docker instructions](README.docker.md) for more information. Using docker you can install an instance of the OCDB on a [broad range of systems](https://docs.docker.com/installation/#installation)


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

API authentication requirements
-------------------------------

Requests towards the OCDB API require an authentication. The required access token can be aquired with the following HTTP request:

```sh
curl -s -k -X GET "https://$HOST:$PORT/v1/users?a=$SHA1USEROREMAIL&b=$SHA1PASSWORD" -H "Accept: application/json
```

For more information see the [API documentation](http://fraunhoferfokus.github.io/OCDB/apiconsole/index.html).

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

FAQ?
--------

[Yes, of course](FAQ.md).

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
