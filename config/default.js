module.exports = {

    "DB": {
        "Type": "postgres",
        "User": "",
        "Password": "",
        "Port": 5432,
        "Host": "",
        "Database": ""
    },


    "Redis": {
        "mode": "sentinel",//instance, cluster, sentinel
        "ip": "",
        "port": 6389,
        "user": "",
        "password": "",
        "sentinels": {
            "hosts": "",
            "port": 16389,
            "name": "redis-cluster"
        }

    },


    "Security": {

        "ip": "",
        "port": 6389,
        "user": "",
        "password": "",
        "mode": "sentinel",//instance, cluster, sentinel
        "sentinels": {
            "hosts": "",
            "port": 16389,
            "name": "redis-cluster"
        }
    },


    "Host": {
        "ServerType": "TWITTERLISTNER",
        "vdomain": "localhost",
        "domain": "localhost",
        "port": "4647",
        "twitterQueueName": "TWEETOUT",
        "version": "1.0.0.0"
    },


    "LBServer": {

        "ip": "",
        "port": "4647"

    },


    "Mongo":
        {
            "ip":"104.236.231.11",
            "port":"27017",
            "dbname":"dvpdb",
            "password":"DuoS123",
            "user":"duo",
            "replicaset" :"104.236.231.11"
        },


    "RabbitMQ":
        {
            "ip": "45.55.142.207",
            "port": 5672,
            "user": "admin",
            "password": "admin",
            "vhost":'/'
        },



    "Services": {
        "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdWtpdGhhIiwianRpIjoiYWEzOGRmZWYtNDFhOC00MWUyLTgwMzktOTJjZTY0YjM4ZDFmIiwic3ViIjoiNTZhOWU3NTlmYjA3MTkwN2EwMDAwMDAxMjVkOWU4MGI1YzdjNGY5ODQ2NmY5MjExNzk2ZWJmNDMiLCJleHAiOjE5MDIzODExMTgsInRlbmFudCI6LTEsImNvbXBhbnkiOi0xLCJzY29wZSI6W3sicmVzb3VyY2UiOiJhbGwiLCJhY3Rpb25zIjoiYWxsIn1dLCJpYXQiOjE0NzAzODExMTh9.Gmlu00Uj66Fzts-w6qEwNUz46XYGzE8wHUhAJOFtiRo",

        "resourceServiceHost": "resourceservice.app1.veery.cloud",
        "resourceServicePort": "8831",
        "resourceServiceVersion": "1.0.0.0",


        "interactionurl": "interactions.app1.veery.cloud",
        "interactionport": '3637',
        "interactionversion": "1.0",

        "ticketServiceHost": "liteticket.app1.veery.cloud",
        "ticketServicePort": "3636",
        "ticketServiceVersion": "1.0.0.0",

        "ardsServiceHost": "",
        "ardsServicePort": "8831",
        "ardsServiceVersion": "1.0.0.0",

        "ruleserviceurl": "",
        "ruleserviceport": "8888",
        "ruleserviceversion": "1.0.0.0",

        "fileServiceHost": "",
        "fileServicePort": 5645,
        "fileServiceVersion": "1.0.0.0",

        "messengerhost": "externalipmessagingservice.app1.veery.cloud",//ardsliteservice.app.veery.cloud
        "messengerport": "3334",
        "messengerversion": "1.0.0.0",
        //externalipmessagingservice.app.veery.cloud

    },

    "TwitterConnector": {
        "Consumer_Key":"",
        "Consumer_Secret": "",

    }

};
