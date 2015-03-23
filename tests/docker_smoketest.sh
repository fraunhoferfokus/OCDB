#!/bin/sh

HOST=$1
PORT=$2

[ "$HOST" ] || HOST="localhost"
[ "$PORT" ] || PORT="443"

echo "Using host: https://$HOST:$PORT"

echo "Registering user...(user may already be registered)"
curl -s -k -X POST "https://$HOST:$PORT/v1/users" -H "Accept: application/json" -H "Content-Type: application/json" -d "{\"n\":\"user\",\"a\":\"user@domain.com\",\"b\":\"441d05da1f570f55e0c8172787cdc1302ecad5db\"}"
ec=$?
if [ $ec -ne 0 ]; then
  echo "Failed with cURL return code: $ec";
  exit 1;
fi

echo "Log in..."
at=`curl -s -k -X GET "https://$HOST:$PORT/v1/users?a=12dea96fec20593566ab75692c9949596833adc9&b=441d05da1f570f55e0c8172787cdc1302ecad5db" -H "Accept: application/json"  | cut -f 4 -d \" -`
ec=$?
if [ $ec -ne 0 ]; then
  echo "Failed with cURL return code: $ec";
  exit 1;
fi
echo "Got this access token: "$at

echo "Sample request (Get 10 cities around given location)..."
curl -s -k -X GET "https://$HOST:$PORT/v1/cities?lat=52.5258885&lon=13.3142135&offset=0&limit=10" -H "Accept: application/json" -H "Authorization: token "$at
ec=$?
if [ $ec -ne 0 ]; then
  echo "Failed with cURL return code: $ec";
  exit 1;
fi

echo "\nOCDB: Smoke test ran successful."
