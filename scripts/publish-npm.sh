#!/bin/bash

# if [ $# -lt 1 ];then
# echo 'Your should input your version numver'
# exit
# fi

git add -A
git commit

cp -r README.md ./lib
cd lib
version=v$1
git tag $version
npm publish --access public --verbose
git push --tag
