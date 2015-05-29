#!/bin/sh

BASEDIR=$(dirname $0)
echo "shutting down..."
$BASEDIR/db/mongodb/bin/mongo --eval "db.getSiblingDB('min').shutdownServer()"
