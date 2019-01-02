var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var Twitter = require('dvp-mongomodels/model/Twitter').Twitter;
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var TwitterClient = require('twitter');
var CreateComment = require('../Workers/common').CreateComment;
var CreateEngagement = require('../Workers/common').CreateEngagement;
var CreateTicket = require('../Workers/common').CreateTicket;
var util = require('util');
var validator = require('validator');
var async = require("async");
const config = require('config');
var jsonwebtoken = require('jsonwebtoken');


var _twitterConsumerKey = config.TwitterConnector.Consumer_Key;
var _twitterConsumerSecret = config.TwitterConnector.Consumer_Secret;

var sockets = {};

var messengerURL = util.format("http://%s", config.Services.messengerhost);
if (validator.isIP(config.Services.messengerhost))
    messengerURL = util.format("http://%s:%d", config.Services.messengerhost, config.Services.messengerport);


function loadTweets(twittreid, tweets) {

    logger.debug("DVP-TwitterReceiver.LoadTweets Internal method ");
    var jsonString;

    return new Promise((resolve, reject) => {

        Twitter.findOne({ _id: twittreid}, function (err, twitter) {
            if (err) {

                jsonString = messageFormatter.FormatMessage(err, "Get Twitter Failed", false, undefined);
                reject(jsonString);

            } else {
                if (twitter) {

                    var company = twitter.company;
                    var tenant = twitter.tenant;

                    var ticket_type = 'question';
                    var ticket_tags = [];
                    var ticket_priority = 'low';

                    if (twitter.ticket_type) {
                        ticket_type = ticket_type;
                    }

                    if (twitter.ticket_tags) {
                        ticket_tags = ticket_tags;
                    }

                    if (twitter.ticket_priority) {
                        ticket_priority = ticket_priority;
                    }

                    var client = new TwitterClient({
                        consumer_key: _twitterConsumerKey,
                        consumer_secret: _twitterConsumerSecret,
                        access_token_key: twitter.access_token_key,
                        access_token_secret: twitter.access_token_secret
                    });

                    if (util.isArray(tweets) && tweets.length > 0) {

                        var ticketList = [];
                        var commentList = [];


                        tweets.forEach(function (item) {
                            if (item.in_reply_to_status_id_str) {
                                commentList.push(item);
                            }
                            else {
                                ticketList.push(item);
                            }
                        });


                        var TicketTask = [];
                        ticketList.forEach(function (item) {
                            TicketTask.push(function createContact(callback) {

                                CreateEngagement("twitter", company, tenant, item.user.screen_name, item.in_reply_to_screen_name, "inbound", item.id_str, item.text, undefined, item.user.id_str, item.user, function (isSuccess, result) {
                                    if (isSuccess) {

                                        CreateTicket("twitter", item.id_str, result.profile_id, company, tenant, ticket_type, item.text, item.text, ticket_priority, ticket_tags, function (done) {
                                            if (done) {


                                                logger.info("Twitter Ticket Added successfully " + item.id_str);


                                            } else {

                                                logger.error("Add Request failed " + item.id);

                                            }
                                            callback(null, item.id_str);
                                        });

                                    } else {
                                        logger.error("Create engagement failed " + item.id);
                                        callback(null, item.id_str);
                                    }
                                });
                            });
                        });

                        var CommentTask = [];
                        commentList.forEach(function (item) {
                            CommentTask.push(function createContact(callback) {

                                CreateEngagement("twitter", company, tenant, item.user.screen_name, item.in_reply_to_screen_name, "inbound", item.id_str, item.text, undefined, item.user.id_str, item.user, function (isSuccess, result) {
                                    if (isSuccess) {
                                        CreateComment('twitter', 'tweets', company, tenant, item.in_reply_to_status_id_str, undefined, result, function (done) {
                                            if (!done) {

                                                CreateTicket("twitter", item.id_str, result.profile_id, company, tenant, ticket_type, item.text, item.text, ticket_priority, ticket_tags, function (done) {
                                                    if (done) {
                                                        logger.info("Twitter Ticket Added successfully " + item.id_str);

                                                    } else {

                                                        logger.error("Create Ticket failed " + item.id);

                                                    }
                                                    callback(null, item.id_str);
                                                });
                                            } else {

                                                logger.info("Twitter Comment Added successfully " + item.id_str);
                                                callback(null, item.id_str);
                                            }

                                        })
                                    } else {

                                        logger.error("Create engagement failed " + item.id);
                                        callback(null, item.id_str);
                                    }
                                })
                            });
                        });

                        async.parallel(TicketTask, function (err, result) {
                            async.parallel(CommentTask, function (err, result) {
                                console.log("done..................");
                                var since_id = tweets[0].id_str;
                                twitter.tweet_since = since_id;
                                Twitter.findOneAndUpdate({
                                    company: company,
                                    tenant: tenant,
                                    _id: twittreid
                                }, {$set: {tweet_since: since_id}}, function (err, doc) {
                                    if (err) {
                                        logger.error("Update since id failed" + err);
                                        jsonString = messageFormatter.FormatMessage(undefined, "Update Since Id Failed", true, err);
                                        resolve(jsonString);
                                    } else {
                                        logger.debug("Update since id successfully");
                                        jsonString = messageFormatter.FormatMessage(undefined, "Twitter process done ", true, undefined);
                                        resolve(jsonString);
                                    }
                                });
                            });
                        });

                    } else {
                        jsonString = messageFormatter.FormatMessage(undefined, "No Tweets Found", false, undefined);
                        reject(jsonString);
                    }

                } else {

                    jsonString = messageFormatter.FormatMessage(undefined, "No Twitter Found", false, undefined);
                    reject(jsonString);

                }
            }
        });
    });
};


function directMessages(twittreid, message) {

    console.log("Message data: ", message);

    if(!sockets[event.sender.id]) {
        var socket = require('socket.io-client')(messengerURL, {forceNew: true});
        sockets[event.sender.id] = socket;
        socket.on('connect', function () {

            var session_id = uuid.v1();

            var channel = "TWITTERMESSENGER";

            var jwt = jsonwebtoken.sign({
                session_id: session_id,
                iss: config.Host.iss,
                iat: moment().add(1, 'days').unix(),
                company: config.Host.company,
                tenant: config.Host.tenant,
                contact: event.sender.id,
                channel: channel,
                jti: event.sender.id,
                attributes: ["60"],
                priority: "0",
                name: event.sender.id

            }, config.Host.secret);

            socket
                .emit('authenticate', {token: jwt}) //send the jwt
                .on('authenticated', function () {
                    //do other things

                    fb.SendTextMessage(event.sender.id,"Please waiting for human agent to take over");

                    socket.emit("message", {
                        message: event.message.text,
                        type:"text"
                    });


                    function retryAgent () {
                        socket.emit("retryagent");
                    }
                    var retryObj = setInterval(retryAgent, 30000);

                    socket.on('agent', function(data){
                        if(retryObj) {
                            clearInterval(retryObj);
                        }
                        console.log(data);
                        var card = createAnimationCard(session,data.name, data.avatar);

                        session.userData.agent = data;

                        var msg = new builder.Message(session).addAttachment(card);
                        session.send(msg);
                    });



                    socket.on('typing', function (data) {

                        session.sendTyping();
                    });

                    socket.on('typingstoped', function (data) {

                    });

                    socket.on('seen', function (data) {

                    });

                    socket.on("message", function(data){

                        session.send(data.message);
                    });

                    socket.on('existingagent', function(data){

                        if(retryObj){

                            clearInterval(retryObj);
                        }

                        if(data && data.name && data.avatar) {
                            console.log(data);
                            var card = createAnimationCard(session, data.name, data.avatar);
                            var msg = new builder.Message(session).addAttachment(card);
                            session.send(msg);
                        }

                    });


                    socket.on('left', function(data){

                        session.send("Agent left the chat");


                        if(sockets[event.sender.id]) {
                            session.beginDialog('/csat');
                            delete sockets[event.sender.id];
                        }
                        if(retryObj){

                            clearInterval(retryObj);
                        }
                        socket.disconnect();

                    });

                    socket.on('disconnect', function () {

                        //session.send("Agent left the chat due to technical issue...");

                        if(sockets[event.sender.id]) {
                            //session.endConversation();
                            delete sockets[event.sender.id];
                        }
                        if(retryObj){

                            clearInterval(retryObj);
                        }

                    });

                })
                .on('unauthorized', function (msg) {
                    console.log("unauthorized: " + JSON.stringify(msg.data));
                    delete sockets[event.sender.id];
                    //throw new Error(msg.data.type);
                })

        });

    }else{

        //session.send("Please waiting for human agent to take over  !!!!!");

        sockets[event.sender.id].emit("message", {
            message: session.message.text,
            type:"text" ,
        });

        //console.log("Another user interacted "+session.message.text);

    }

}



module.exports.LoadTweets = loadTweets;
module.exports.DirectMessages = directMessages;

