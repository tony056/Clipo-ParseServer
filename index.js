// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('clipo-parse').ParseServer;
var dbURI = /*'mongodb://localhost:27017/local';*/'mongodb://tonytung:theclipo@ds013848.mongolab.com:13848/clipo-test';
var MongoOpLog = require('mongo-oplog');
var oplog = MongoOpLog(dbURI, {ns:'local.tasks', database:'local'}).tail(function(){
  console.log('tailing started');
});
oplog.on('op', function(data){
	console.log('oplog: ' + data);
});
oplog.on('insert', function (doc) {
  console.log(doc.op);
});

var databaseUri = process.env.DATABASE_URI || process.env.MONGOLAB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || dbURI,
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || 'myMasterKey'
  // restAPIKey: process.env. //Add your master key here. Keep it secret!
});

// console.log('final db: ' + api.databaseURI);
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a web site.');
});

var port = process.env.PORT || 5566;
app.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});
