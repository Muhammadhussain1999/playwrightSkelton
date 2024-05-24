#!/usr/bin/env sh

# The following line happens to be required when running directly from datadesk or any other external repo where this test suite is imported
[ -d "./playwrite" ] && cd ./playwrite

FOLDER=node_modules
if [ ! -d "$FOLDER" ]; then
    echo "Folder '/node_modules' not found in the directory. Will run 'npm ci' to ensure modules are installed"
    npm ci
fi

if [ ! -z "$APPV2_URL" ]; then
    echo -e "\nLooking for url: $APPV2_URL"
    CURL_TEST=$(curl --output /dev/null --silent --fail --insecure $APPV2_URL) && CURL_RETURNCODE=$? || CURL_RETURNCODE=$?
    if [ $CURL_RETURNCODE -eq 0 ]; then
        echo -e "\nRETURN CODE: $CURL_RETURNCODE - Server found"
    else
        echo -e "\nRETURN CODE: $CURL_RETURNCODE - Server not found"
        unset APPV2_URL
    fi
else
    echo "APPV2_URL environment variable not set!"
fi

npx playwright test $@
