## OCDB Dockerfile

This directory contains a Dockerfile of [OCDB](https://github.com/fraunhoferfokus/OCDB).


### Requirements

* Install [Docker](https://www.docker.com)


### Usage

The `ocdb` endpoint is exposed internally on the port 443.
The webservice can be launched and made accessible on e.g. the host's port 8080 with the command:

```
$ docker run -d -p 8080:443 fraunhoferfokus/ocdb:latest
```

You can now test the service by opening in your browser: [https://localhost:8080/v1/frontend/index.html](https://localhost:8080/v1/frontend/index.html)

The service API can be consumed with (where $at is your access token):

```
$ curl -s -k -X GET "https://$HOST:$PORT/v1/cities?lat=52.5258885&lon=13.3142135&offset=0&limit=10" -H "Accept: application/json" -H "Authorization: token "$at
```

#### Use specific ssl certificates

During the launch process, a random ssl certificate is created.
Overwriting the `/root/.ocdb` directory allows to inject private certificates:

```	
$ docker run -d -p 8080:443 -v "/tmp:/root/.ocdb" fraunhoferfokus/ocdb:latest
```

The directory must follow this naming convention:

```
$ ls /root/.ocdb/
cert.pem  csr.pem  key.pem
```

### Docker image build

* Use the following command inside the cloned repository:

```
$ docker build -t 'fraunhoferfokus/ocdb:latest' .
```
