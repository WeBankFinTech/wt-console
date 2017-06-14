#!/bin/bash

cp README.md ./lib

cd lib
version=`npm version patch`
npm publish --access public --verbose
cd -

git tag $version
git push --tag
