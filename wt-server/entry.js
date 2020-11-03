var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
const port = 8019;

var api = new ParseServer({
  databaseURI: 'mongodb://localhost:27017/dev',
  cloud: __dirname + '/cloud/main.js',
  appId: 'wt-app',
  masterKey: '', //Add your master key here. Keep it secret!
  serverURL: `http://localhost:${port}/wt`,  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});

var app = express();

// Serve the wt API on the /wt URL prefix
var mountPath = '/wt';
app.use(mountPath, api);

var httpServer = require('http').createServer(app);

httpServer.listen(port, function() {
  console.log('parse-server-example running on port ' + port + '.');
});

ParseServer.createLiveQueryServer(httpServer);