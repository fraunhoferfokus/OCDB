#!/bin/sh

echo "Registering user..."
curl -s -k -X POST 'https://localhost:8080/v1/users' -H 'Accept: application/json' -H 'Content-Type: application/json' -d '{"n":"user","a":"user@domain.com","b":"441d05da1f570f55e0c8172787cdc1302ecad5db"}'

echo "Log in..."
at=`curl -s -k -X GET 'https://localhost:8080/v1/users?a=12dea96fec20593566ab75692c9949596833adc9&b=441d05da1f570f55e0c8172787cdc1302ecad5db' -H 'Accept: application/json'  | cut -f 4 -d \" -`

echo "Sample request (Get 10 cities around given location)..."
curl -s  -k -X GET 'https://localhost:8080/v1/cities?lat=52.5258885&lon=13.3142135&offset=0&limit=10' -H 'Accept: application/json' -H 'Authorization:token '$ac
