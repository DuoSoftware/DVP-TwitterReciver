const restify = require('restify');
const config = require('config');
const authorization = require('dvp-common/Authentication/Authorization.js');
const fs = require('fs');
const corsMiddleware = require('restify-cors-middleware');
const secure= require('./secure');
const tweets = require('./Actions/Twitter');
const mongomodels = require('dvp-mongomodels');
const twitter_amqp = require("./Actions/Twitter-amqp");
const logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;


var port = config.Host.port || 3000;
var host = config.Host.vdomain || 'localhost';
const _twitterConsumerKey = config.TwitterConnector.Consumer_Key;
const _twitterConsumerSecret = config.TwitterConnector.Consumer_Secret;


//restify.CORS.ALLOW_HEADERS.push('authorization');

var https_options = {
    /* ca: fs.readFileSync('/etc/ssl/fb/COMODORSADomainValidationSecureServerCA.crt'),
     key: fs.readFileSync('/etc/ssl/fb/SSL1.txt'),
     certificate: fs.readFileSync('/etc/ssl/fb/STAR_duoworld_com.crt')*/
};

var https_server = restify.createServer(https_options);
const cors = corsMiddleware({
    preflightMaxAge: 5, //Optional
    origins: ['*'],
    allowHeaders: [],
    exposeHeaders: []
})


var setup_server = function (server) {

    server.pre(restify.pre.userAgentConnection());
    server.use(restify.plugins.bodyParser({mapParams: false}));
    server.use(restify.plugins.queryParser());
    server.pre(cors.preflight)
    server.use(cors.actual)
    server.use(restify.plugins.fullResponse());

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    server.get('/', function(req, res) {
        console.log(req);
        res.send('It works!');
    });

    server.get('/twitter/feeds', function(req, res) {

        const crc_token = req.query.crc_token;
        const sha256_hash_digest  = secure.get_challenge_response(crc_token,_twitterConsumerSecret);
        var token_res = {

            'response_token': 'sha256=' + sha256_hash_digest
        }
        res.end(JSON.stringify(token_res) );


    });

    server.post('/twitter/feeds', function(req, res) {
        console.log('Twitter request body:');
        console.log(JSON.stringify(req.body));

        if(req.body && req.body.for_user_id){

            if(req.body.tweet_create_events){
                tweets.LoadTweets(req.body.for_user_id,req.body.tweet_create_events)
                    .then(function(message){

                        logger.info(message);

                    })
                    .catch(function(message){
                        logger.error(message);
                    });
            }else if(req.direct_message_events){


            }

        }

        res.end();

    });

};

setup_server(https_server);

https_server.listen(port, function () {
    console.log('%s listening at %s', https_server.name, https_server.url);
});