Parse.serverURL = 'http://weightsndates-server-dev.herokuapp.com:1337/parse';


Parse.appId = '7IfmJE8zVqi6WkLgdku2wiw2JdaBa6qyBaExhTvt';
Parse.applicationId = '7IfmJE8zVqi6WkLgdku2wiw2JdaBa6qyBaExhTvt';
Parse.masterKey = 'yFDKPty9Eob0j1jP1tf7Ln3ISnWP4pCI7G0MBcmh';

var CleverTap = require("clevertap");
var clevertap = CleverTap.init('8W8-Z9Z-584Z', 'SCE-ZUD-UIAL');


Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});


Parse.Cloud.define('clevertaptest', function(req, res) {
    clevertap.profile({objectId:"_p4939050e69e5495b813c839e3f48a7e8", debug:1}).then((r) => {
        res.success(r);
    });
});


Parse.Cloud.define('push', function(req, res) {
    
    /**
     * Send an immediate push to users subscribed to the specified channels
     *
     */

    const channels = req.params.channels;

    if (!channels) {
        res.error("channels not present");
        return;
    }

    const payload = {
        "name": "test push " + Math.round(new Date().getTime()/1000),
        "when": "now",
        "where": {
            "common_profile_prop": {
                "profile_fields": [{"name": "channels", "value": channels}]
            }
        },
        "content": {
            "title":"Hello!",
            "body":"Just testing"
        },
        "devices": ["ios", "android"]
    }

    clevertap.targets(clevertap.TARGET_CREATE, payload, {"debug":1}).then((r) => {
        res.success(r);
    });
});

Parse.Cloud.afterSave('GameScore', function(req) {
    /**
     * Send all users an immediate push notifiying them of a new Game Score. 
     *
     */

    const gameScore = req.object;
    const body = (gameScore) ? `New Game Score: ${gameScore.get("playerName")} ${gameScore.get("score")}` : "New Game Score";
    const payload = {
        "name": "test push " + Math.round(new Date().getTime()/1000),
        "when": "now",
        "segment":"all",
        "content": {
            "title": "Hey There!",
            "body": body,
        },
        "devices": ["ios", "android"]
    }

    clevertap.targets(clevertap.TARGET_CREATE, payload, {"debug":1}).then((r) => {
        console.log(r);
    });
});
