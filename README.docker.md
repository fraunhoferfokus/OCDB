## OCDB Dockerfile

This directory contains a Dockerfile of [OCDB](https://github.com/fraunhoferfokus/OCDB).


### Requirements

* Install [Docker](https://www.docker.com)


### Usage

The `ocdb` endpoint is exposed internally on the port 443.
The webservice can be launched and made accessible on the host's port 8080 with the command:

    docker run -d -p 8080:443 fic2/ocdb:latest

You can now test the service by opening in your browser: [https://localhost:8080/v1/frontend/index.html](https://localhost:8080/v1/frontend/index.html)

The service API can be consumed with:

    curl -k -X GET 'https://localhost:8080/v1/cities' -H 'Accept: application/json'

#### Use specific ssl certificates

During the launch process, a random ssl certificate is created.
Overwriting the `/root/.ocdb` directory allows to inject private certificates:
	
    docker run -d -p 8080:443 -v  -v "/tmp:/root/.ocdb" fic2/ocdb:latest

The directory must follow this naming convention:

```
root@af8beaea4e69:~/ocdb# ls /root/.ocdb/
cert.pem  csr.pem  key.pem
```

### Docker image build

* Use the following command inside the cloned repository:

    ```
	docker build -t 'fic2/ocdb:latest' .
	```
