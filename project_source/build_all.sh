#!/bin/bash

for d in */; do
    pushd "$d/kanban_app"
    echo "Building $d"
    npm run build
    popd
done
