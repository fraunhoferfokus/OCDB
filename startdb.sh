#!/bin/sh

BASEDIR=$(dirname $0)
echo "DB PATH: $BASEDIR"
$BASEDIR/db/mongodb/bin/mongod --dbpath $BASEDIR/db --logpath $BASEDIR/db/ocdb.log &