#!/bin/bash

BUILD_DIR=builds

mkdir -p "$BUILD_DIR"

for d in */; do
    APP_DIR="$d/kanban_app"
    if [ -d "$APP_DIR" ]; then
        pushd "$APP_DIR"
        echo "Copying $d"
        cp -rf build "../../$BUILD_DIR/$d"
        popd
    fi
done
