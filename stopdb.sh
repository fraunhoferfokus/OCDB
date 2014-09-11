#!/bin/sh

BASEDIR=$(dirname $0)
echo "shutting down..."
$BASEDIR/db/mongodb/bin/mongod --dbpath $BASEDIR/db --shutdown