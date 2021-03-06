#!/bin/bash

set -ex

docker pull popcodeorg/popcode:latest
docker build \
    --pull \
    --force-rm \
    --cache-from popcodeorg/popcode:latest \
    --tag popcodeorg/popcode:$CIRCLE_BRANCH \
    .
