#!/bin/sh

echo "Creating self-signed certificates in $HOME/.ocdb ..."

mkdir -p $HOME/.ocdb
command -v openssl >/dev/null 2>&1 || { echo >&2 "... requires openssl but it's not installed.  Aborting."; exit 1; }

openssl genrsa -out $HOME/.ocdb/key.pem 1024
openssl req -new -key $HOME/.ocdb/key.pem -out $HOME/.ocdb/csr.pem
openssl x509 -req -in $HOME/.ocdb/csr.pem -signkey $HOME/.ocdb/key.pem -out $HOME/.ocdb/cert.pem

echo "End."