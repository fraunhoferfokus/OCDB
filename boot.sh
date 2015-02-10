#! /bin/bash -e

set -x

D=$(pwd)

if [ ! -d /root/.ocdb ]; then
    mkdir /root/.ocdb
    cd /root/.ocdb
    P=$(apg -n 1 -c "$RANDOM" -M SNCL -m 20 -x 22)
    echo -e "$P\n$P" | openssl genrsa -out key.pem 2048
    echo -e "\n\n\n\n\n\n\n\n\n" | openssl req -new -sha256 -key key.pem -out csr.pem
    openssl x509 -req -in csr.pem -signkey key.pem -out cert.pem
fi

cd $D
./startdb.sh
# wait for mongo to be available
until nc -z localhost 27017
do
    sleep 2s
done
node .