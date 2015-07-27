#!/bin/bash

for d in */; do
    APP_DIR="$d/kanban_app"
    if [ -d "$APP_DIR" ]; then
        pushd "$APP_DIR"
        echo "Installing dependencies for $d"
        npm install
        echo "Building $d"
        npm run build
        popd
    fi
done
