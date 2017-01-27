// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
//var express = require('parse-server/node_modules/express');
var ParseServer = require('parse-server').ParseServer;
// S3 Adapter
var S3Adapter = require('parse-server').S3Adapter;
var path = require('path');

var gcm = require('node-gcm');

var SERVER_KEY_FCM = 'AIzaSyDoTGDyXFzwdkNP09N7_aN7VUerbmxYwbE';
var FCM = require('fcm-node');
var fcm = new FCM(SERVER_KEY_FCM);

var sender = new gcm.Sender(SERVER_KEY_FCM);

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://admin:lakers1234@ds161028.mlab.com:61028/wnd-parse-new',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || '7IfmJE8zVqi6WkLgdku2wiw2JdaBa6qyBaExhTvt',
  applicationId: process.env.APP_ID || '7IfmJE8zVqi6WkLgdku2wiw2JdaBa6qyBaExhTvt',
  masterKey: process.env.MASTER_KEY || 'yFDKPty9Eob0j1jP1tf7Ln3ISnWP4pCI7G0MBcmh', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'https://wnd-parse-files.herokuapp.com:1337/parse',  // Don't forget to change to https if needed
  push: {
      android: {
        senderId: '620420937756',
        apiKey: 'AIzaSyDoTGDyXFzwdkNP09N7_aN7VUerbmxYwbE'
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
  filesAdapter: new S3Adapter(
    "AKIAIJRIGNXA2BOCWIGA",
    "IfTGFjY2XtAKe8mopz7Bbfk30YtlF8cnlXGhD1ub",
    "wnd-files-test",
    {directAccess: true}
  ),
  liveQuery: {
    classNames: ["Posts", "Comments", "Conversation", "Message", "Fcm"] // List of classes to support for query subscriptions
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

//app.use();

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
