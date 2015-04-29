#!/bin/sh

BASEDIR=$(dirname $0)
echo "DB PATH: $BASEDIR"
$BASEDIR/db/mongodb/bin/mongod --dbpath $BASEDIR/db --logpath $BASEDIR/db/ocdb.log &
echo "DB startup done. Everything fine so far, if no errors appeared. You might want to check ./db/ocdb.log"
