#!/bin/bash

cd lib
version=`npm version patch`
npm publish --access public --verbose
cd -
git commit -a -m "release $verbose"
git push

git tag $version
git push --tag
