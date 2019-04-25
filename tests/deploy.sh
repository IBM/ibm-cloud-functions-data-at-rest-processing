#!/bin/bash

# deploy in local openwhisk docker-compose deployment
source local.env
wsk -i project deploy
wsk -i list
