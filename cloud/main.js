//INIT CLOUD SERVER

Parse.initialize('7IfmJE8zVqi6WkLgdku2wiw2JdaBa6qyBaExhTvt');
Parse.serverURL = 'http://weightsndates-server-dev.herokuapp.com:1337/parse';
Parse.appId = '7IfmJE8zVqi6WkLgdku2wiw2JdaBa6qyBaExhTvt';
Parse.applicationId = '7IfmJE8zVqi6WkLgdku2wiw2JdaBa6qyBaExhTvt';
Parse.masterKey = 'yFDKPty9Eob0j1jP1tf7Ln3ISnWP4pCI7G0MBcmh';
Parse.facebookAppIds = '1014313108587926';
var SERVER_KEY_FCM = 'AIzaSyDoTGDyXFzwdkNP09N7_aN7VUerbmxYwbE';
var FCM = require('fcm-node');
var fcm = new FCM(SERVER_KEY_FCM);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

//DEFINE CLOUD FUNCTIONS

Parse.Cloud.define('CloudSendToDevice', function (request, response) {
    console.log('Run cloud function to forward message to user');
    // As with Parse-hosted Cloud Code, the user is available at: request.user
    // You can get the users session token with: request.user.getSessionToken()
    // Use the session token to run other Parse Query methods as that user, because
    //   the concept of a 'current' user does not fit in a Node environment.
    //   i.e.  query.find({ sessionToken: request.user.getSessionToken() })...

    var token = request.user.getSessionToken();
    //request.params.get
    //var testObjectId = request.user.getSess;

    //response.success("Hello world! " + (request.params.a + request.params.b));

    Parse.Push.send({
        where: query,
        data: {
            alert: 'Check Send',
            badge: 1,
            sound: 'default'
        }
    }, {
        useMasterKey: true,
        success: function () {
            // Push sent!
            response.success("OK");
        },
        error: function (error) {
            // There was a problem :(
            response.error(error);
        }
    });

});

Parse.Cloud.define('CloudMatchWithUser', function (request, response) {

    console.log('Run cloud function to match with user ' + request.likedUserId + ' fbId=' + request.fbId + ' like=' + request.params.like);

    var query = new Parse.Query(Parse.User);

    if (request.params.like) {
        //request.object.id
        query.contains("likedUsers", request.fbId).equalTo("objectId", request.likedUserId);

        var success = "success";
        var fail = "failure";
        var successTemporary = "Temporary success response on Like = False";
        var jsonSuccessObject = {
            "answer": success
        };
        var jsonSuccessTemporaryObject = {
            "answer": successTemporary
        };

        var jsonFailObject = {
            "answer": fail
        };

        console.log('Cloud Match Before Find');

        query.find({
            success: function (results) {
                console.log('Matched');

                response.success(jsonSuccessObject);

                //.then call CloudShowMatchWithUser
            },
            error: function () {
                console.log('No match');
                response.error(jsonFailObject);
            }, useMasterKey: true
        }, {useMasterKey: true});//,

    } else {
        //[[PFUser currentUser] addObject:user[@"fbid"] forKey:@"viewedUsers"];
        //query.insert
        console.log('Cloud Match: Temporary success response on Like = False');
        response.success(jsonSuccessTemporaryObject);
    }

});

Parse.Cloud.afterSave('CloudShowMatchWithUser', function (request, response) {

    //Create conversation with status active

    // For this user send push
    // NSDictionary *data=@{@"alert":[NSString stringWithFormat:@"You and %@ are a match!", [PFUser currentUser][@"firstName"]], @"badge":@"Increment", @"sound":@"default", @"WDPushType":@"WDPushTypeMatch"};

    var query = new Parse.Query(Parse.Conversation);

    var Conversation = Parse.Object.extend("Conversation");
    var conversationObject = new Conversation();
    conversationObject.save({fromUser: request.user});

    //conversation=[PFObject objectWithClassName:@"Conversation"];
    //[conversation setObject:[PFUser currentUser] forKey:@"fromUser"];
    //[conversation setObject:user forKey:@"toUser"];
    //[conversation setObject:@(WDConversationStatusActive) forKey:@"status"];

    //user == user.objectId

});

//fbid 598736206971991


/*
 * Method to
 *
 * Android usage:
 HashMap<String,String> map = new HashMap<String, String>();
 map.put("PARAM1KEY","PARAM1VALUE");
 // here you can send parameters to your cloud code functions
 ParseCloud.callFunctionInBackground("SendPush",map, new FunctionCallback<Object>() {
 @Override
 public void done(Object object, ParseException e) { // handle callback } });
 * */


//FCM integration
Parse.Cloud.define("CloudPushFCM", function (request, responseTotal) {

    var params = request.params;
    var gcmToken = params.gcmToken;

    var message = {
        to: gcmToken,
        //collapse_key: 'your_collapse_key', //for the same messages : chat group
        priority: "high",

        notification: {
            title: 'Title of your push notification',
            body: 'Body of your push notification',
            icon: 'ic_stat_utn',
            tag: 'tag text'
        },

        data: {  //you can send only notification or only data(or include both)
            my_key: 'my value',
            my_another_key: 'my another value'
        }
    };

    fcm.send(message, function(err, response){
        if(err) responseTotal.error("error with sendPush: " + err);
           else responseTotal.success("Push send");
    }, {useMasterKey: true});

});

/*
 * Method to send Message to all Android devices
 * Test from CURL
 * curl -X POST -H "X-Parse-Application-Id: 7IfmJE8zVqi6WkLgdku2wiw2JdaBa6qyBaExhTvt" -H "X-Parse-REST-API-Key: yFDKPty9Eob0j1jP1tf7Ln3ISnWP4pCI7G0MBcmh"  -H "Content-Type: application/json" -d "{}"  https://weightsndates-server-dev.herokuapp.com/parse/functions/Cloud
 * */

Parse.Cloud.define('CloudMatchWithUser', function (request, response) {

    var query = new Parse.Query(Parse.Installation);
    query.exists("deviceToken");
    //var itemQuery = new Parse.Query('Item');
    //itemQuery.equalTo('name', request.params.itemName);
    // here you can add other conditions e.g. to send a push to specific users or channel etc.

    var payload = {
        alert: "Message to device"
    };


    Parse.Push.send({
        data: payload,
        where: query
    }, {
        useMasterKey: true
    })
        .then(function () {
            response.success("Push Sent!");
        }, function (error) {
            response.error("Error while trying to send push " + error.message);
        });
});

Parse.Cloud.define('CloudUsersRequest', function (request, response) {

    var query = new Parse.Query(Parse.Installation);
    query.exists("deviceToken");
    //var itemQuery = new Parse.Query('Item');
    //itemQuery.equalTo('name', request.params.itemName);
    // here you can add other conditions e.g. to send a push to specific users or channel etc.

    var payload = {
        alert: "Message to device"
    };


    Parse.Push.send({
        data: payload,
        where: query
    }, {
        useMasterKey: true
    })
        .then(function () {
            response.success("Push Sent!");
        }, function (error) {
            response.error("Error while trying to send push " + error.message);
        });
});


//CHAT BLOCK

//chat message on conversation on before save. OR define
Parse.Cloud.beforeSave('CloudChatMessage', function (request, responseTotal) {

    //INPUT
    var params = request.params;

    var message = params.contentText;
    var fromId = params.fromUser;
    var toId = params.toUser;
    var conversationId = params.conversationId;

    //CAN BE RECEIVED FROM CLOUD CODE FUNCTION
    var fcmToken = params.receiverFcmToken;
    var fromName = params.senderName;

    //PROCESSING

    //CHECK SIZE AND SET MESSAGE SHORTER if it so big before SAVE
    if (message.length > 1000) {
        // Truncate and add a ...
        message = message.substring(0, 999) + "...";
    }

    //OUTPUT

    //NOTE: query.find({ sessionToken: request.user.getSessionToken() })...

    //ADD/PUT MESSAGE TO Message table
    var MessageClass = Parse.Object.extend("Message");
    var messageObj = new MessageClass();

    messageObj.set("conversationId", conversationId);
    messageObj.set("content", message);
    messageObj.set("read", false);
    messageObj.set("authorId", fromId);
    //MAYBE NEED TO ADD SOME DATA MORE

    messageObj.save(null,{
        success:function(messageObj) {
            //UPDATE CONVERSATION table with
            //THIS LAST MESSAGE ID
            var messageID = messageObj.objectId;

            var query = new Parse.Query('Conversation');
            query.equalTo('objectId', conversationId);

            //OR FIND
            query.first({
                success: function(results) {
                    var conversation = results[0];
                    conversation.set("lastMessage", messageID);
                    conversation.save(null,{
                        success:function(person) {
                            //response.success(person);

                            //SEND PUSH

                            if (message.length > 60) {
                                // Truncate and add a ...
                                message = message.substring(0, 58) + "...";
                            }

                            var messageFCM = {
                                to: fcmToken,
                                collapse_key: conversationId, //for the same messages : chat group
                                priority: "high",

                                notification: {
                                    title: 'Message from ' + fromName,
                                    body: message,
                                    icon: 'ic_message_chat',
                                    tag: 'WnD Chat'
                                },

                                data: {  //you can send only notification or only data(or include both)
                                    my_key: 'WnD Chat data',
                                    my_another_key: 'WnD Chat data additional'
                                }
                            };

                            fcm.send(messageFCM, function(err, response){
                                if(err) responseTotal.error("error with sendPush: " + err);
                                else responseTotal.success("Chat Push send successfully. All data stored.");
                            }, {useMasterKey: true});

                        },
                        error:function(error) {
                            responseTotal.error(error);
                        }
                    }, {useMasterKey: true});

                }, error: function() {
                    responseTotal.error("Conversation update failed");
                }
            }, {useMasterKey: true});
        }, error:function(error) {
            responseTotal.error(error);
        }
    }, {useMasterKey: true});

});


//BASIC TEST BLOCK

Parse.Cloud.beforeSave('CloudTestObject', function (request, response) {
    console.log('Ran beforeSave on objectId: ' + request.object.id);
    // if update the request object, we need to send it back with the response
    response.success(request.object);
});

Parse.Cloud.afterSave('CloudTestObjectAfter', function (request, response) {
    console.log('Ran afterSave on objectId: ' + request.object.id);
});

Parse.Cloud.beforeDelete('CloudTestObjectBefore', function (request, response) {
    console.log('Ran beforeDelete on objectId: ' + request.object.id);
    response.success();
});

Parse.Cloud.afterDelete('CloudTestObjectAfterDelete', function (request, response) {
    console.log('Ran afterDelete on objectId: ' + request.object.id);
});

Parse.Cloud.define('CloudHello', function (request, response) {
    console.log('Run cloud function.');
    // As with Parse-hosted Cloud Code, the user is available at: request.user
    // You can get the users session token with: request.user.getSessionToken()
    // Use the session token to run other Parse Query methods as that user, because
    //   the concept of a 'current' user does not fit in a Node environment.
    //   i.e.  query.find({ sessionToken: request.user.getSessionToken() })...
    response.success("Hello world! From Cloud");
});
