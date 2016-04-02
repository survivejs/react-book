#!/bin/bash
set -e # exit with nonzero exit code if anything fails

cd project_source
npm i
npm run lint
cd ..
