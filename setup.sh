#npm --registry http://registry.npmjs.org/ install
#npm --registry http://registry.npmjs.au/ install
#npm --registry http://registry.npmjs.eu/ install
npm --registry https://registry.nodejitsu.com/ install
#npm --registry https://npm.strongloop.com/ install
#npm install

curl -s https://raw.githubusercontent.com/karuru6225/ievms/patch-1/ievms.sh | env IEVMS_VERSIONS="10 11 EDGE" bash
find ~/.ievms -type f ! -name "*.vmdk" -exec rm {} \;
