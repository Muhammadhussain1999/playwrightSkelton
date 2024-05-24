#!/usr/bin/env bash

set -e

if [[ "$1" == "-v" ]]; then
    output=""
else
    output="> /dev/null"
fi

START=$(date +%s)

TRIMMED_BRANCH="$(echo $CIRCLE_BRANCH | tr '[A-Z]' '[a-z]')"

TRIMMED_BRANCH=${TRIMMED_BRANCH//\//''}
TRIMMED_BRANCH=${TRIMMED_BRANCH//\./''}
TRIMMED_BRANCH=${TRIMMED_BRANCH//\_/''}
TRIMMED_BRANCH=${TRIMMED_BRANCH:0:28}
echo "PARSED BRANCH: $TRIMMED_BRANCH"

BASE_URL="https://$TRIMMED_BRANCH.staging.datadesk.io"
status=$(curl -s --head -w %{http_code} $BASE_URL -o /dev/null)
echo "DATADESK STATUS ON PARSED BRANCH: $status"
if [ $status -ge 200 ]; then
    echo "Using BASE_URL=$BASE_URL"
else
    BASE_URL="https://staging.staging.datadesk.io"
    echo "Using BASE_URL=$BASE_URL"
fi

ENV_VARS="ENV=staging APPV2_URL=https://$TRIMMED_BRANCH.staging.connectedinteractive.com"
ENV_VARS="$ENV_VARS BASE_URL=$BASE_URL"

SHARD=""
if [ ! -z "$CIRCLE_NODE_INDEX" ]; then
    SHARD="$((${CIRCLE_NODE_INDEX}+1))"
    SHARD="--shard=${SHARD}/${CIRCLE_NODE_TOTAL}"
fi

EXEC_COMMAND="$ENV_VARS ./run.sh --workers=2 $SHARD"

echo -e "\nRunning $EXEC_COMMAND"
eval ${EXEC_COMMAND}

END=$(date +%s)
SECONDS=$(($END - $START))
echo "Tests ran in $SECONDS sec"
echo $b