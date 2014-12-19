var express = require('express')
var app = express();
var fs = require('fs');
var cors = require('cors');
var path = require('path');
//var email = require('emailjs');
var request = require('request');
var util = require('util');
var os = require('os');
var sip = require('sip');
var http = require('http');
var bodyParser = require('body-parser');

app.use(express.static('public'));
app.use(cors())
app.set('port', (process.env.PORT || 8080))
app.use(bodyParser.json());

var messageTimer = null

console.log("app starting")


/*
var server  = email.server.connect({

    host:    "qs-domino8",
    ssl:     false
});

// send the message and get a callback with an error or details of the message that was sent
server.send({
    text:    "i hope this works",
    from:    "kevin.glinski@inin.com",
    to:      "kevin.glinski@inin.com",
    subject: "testing emailjs"
}, function(err, message) { console.log(err );
console.log('--');
console.log(message) });
*/


function rstring() { return Math.floor(Math.random()*1e6).toString(); }

var config = require('./configuration.json');
var devices = {};

sip.start({}, function(rq) {});

//timeout in the sip library is 120000 and is not configurable, lets set our poll higher than that so we don't have more than 1 ping at a time
pollDevices();
messageTimer = setInterval(pollDevices, 121000);

function pollDevices(){
    for(var i=0; i< config.servers.length; i++){
        var server = config.servers[i];
        sendOptions(server.ip, server.name)
    }
}



function sendWebHook(name, data) {

    if( config.notifications.webhook.host || config.notifications.webhook.host === ""){
    //    return;
    }

    data.name = name;

    // An object of options to indicate where to post to
    var post_options = {
        host: config.notifications.webhook.host,
        port: config.notifications.webhook.port,
        path: config.notifications.webhook.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(data).length
        }
    };

    // Set up the request
    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
    });

    // post the data
    console.log("calling webhook");
    post_req.write(JSON.stringify(data));
    post_req.end();

}

function sendOptions(baseIp, name){

    ip = "sip:" + baseIp + ":5060";


    sip.send({
        method: 'OPTIONS',
        uri: ip,
        headers: {
            to: {uri: ip},
            from: {uri: 'sip:test@test', params: {tag: rstring()}},
            'call-id': rstring(),
            cseq: {method: 'OPTIONS', seq: Math.floor(Math.random() * 1e5)},
            'content-type': 'application/sdp',
        }
    },
    function(rs) {

        var status = {
            ip: baseIp
        }

        if(rs.status == 200){
            status.status = "up"
            console.log(name + " UP")
        }
        else{
            //console.log(rs);
            status.status = "down"
            console.log(name + " DOWN")

        }
        //console.log(rs)

        var oldData = devices[name];

        if(oldData != null && oldData.status != status.status){
            sendWebHook(name, status);
        }else if(oldData == null){
            sendWebHook(name, status);
        }

        devices[name] = status;
    });
}



app.listen(app.get('port'), function() {
    console.log("SIP Verification app is running at localhost:" + app.get('port'))

})


app.get('/devices', function(request, response){
    response.send(devices);
})

app.get('/', function(request, response){

    response.sendFile(path.join(__dirname,"index.html"));
})

app.post('/webhooktest', function(req, res){
    console.log('webhook: ' + JSON.stringify(req.body));
    res.send();

})
