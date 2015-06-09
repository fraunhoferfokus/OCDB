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

# fix to convince docker where our home is
export HOME=/root
node . &
node_pid=$!

# wait for the service to be available
until nc -z localhost 443
do
    # check if there was a problem during service start already
    ps | grep $node_pid | grep -v grep
    ec=$?
    if [ $ec -ne 0 ]; then
        wait $node_pid
        node_status=$?
        echo "node/iojs process exited with return code: $node_status";
        exit 1;
    fi
    sleep 2s
done

# keep this container alive until service terminates 
while   ps | grep $node_pid | grep -v grep    
do
    sleep 60
done

wait $node_pid
node_status=$?
echo "node/iojs process exited with return code: $node_status";
exit $node_status;
