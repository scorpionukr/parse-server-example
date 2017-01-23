// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://admin:lakers1234@ds145405.mlab.com:45405/weightsndates-dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || '7IfmJE8zVqi6WkLgdku2wiw2JdaBa6qyBaExhTvt',
  applicationId: process.env.APP_ID || '7IfmJE8zVqi6WkLgdku2wiw2JdaBa6qyBaExhTvt',
  masterKey: process.env.MASTER_KEY || 'yFDKPty9Eob0j1jP1tf7Ln3ISnWP4pCI7G0MBcmh', //Add your master key here. Keep it secret!
  fileKey: process.env.FILE_KEY || '86f11687-2383-4c75-8206-944901d1946d',
  serverURL: process.env.SERVER_URL || 'https://weightsndates-server-dev.herokuapp.com:1337/parse',  // Don't forget to change to https if needed
  push: {
      android: {
        senderId: '620420937756',
        apiKey: 'AAAAkHP4OBw:APA91bH8M4-AIlmNdlty1Wk4glio_3gByJpj5l8mYSIpNVM3FWrp6b6gHl8I7X-bdGykX-369gm3UOBpRZtbBcefrELUoVwPqkAhWmD-mGlAgFkxVdxa7EIfVQ2crRJhTbPSDZ5fkhR_'
      },
      ios: [
        {
          pfx: 'wnd.p12', // Dev PFX or P12
          passphrase: 'kosmos1960',
          bundleId: 'com.wnd',
          production: false // Dev
        },
        {
          pfx: 'apns_prod.p12', // Prod PFX or P12
          passphrase: 'kosmos1960',
          bundleId: 'com.wnd',  
          production: true // Prod
        }
      ]
  },
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
