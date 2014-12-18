var express = require('express')
var app = express();
var fs = require('fs');
var cors = require('cors')
app.use(cors())

app.set('port', (process.env.PORT || 8080))

var request = require('request');

var messageTimer = null

console.log("app starting")

var util = require('util');
var os = require('os');
var sip = require('sip');

function rstring() { return Math.floor(Math.random()*1e6).toString(); }

var config = require('./configuration.json');

sip.start({}, function(rq) {});

messageTimer = setInterval(pollDevices, 10000);


function pollDevices(){
    for(var i=0; i< config.servers.length; i++){
        var server = config.servers[i];
        sendOptions(server.ip, server.name)
    }
}

function sendOptions(ip, name){

    ip = "sip:" + ip + ":5060";


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

        if(rs.status == 200){
            console.log(name + " UP")
        }
        else{
            //console.log(rs);
            console.log(name + " DOWN")

        }
    });
}


/*
app.listen(app.get('port'), function() {
    console.log("SIP Verification app is running at localhost:" + app.get('port'))

})


app.get('/workgroupstatistics', function(request, response){

    var workgroupStats = stats.getWorkgroupStatCatalog();

    if(request.query.workgroups == null || request.query.workgroups == 'null')
        {
            response.send(workgroupStats);
            return;
        }

        var workgroupFilter = request.query.workgroups.toLowerCase().split(',')
        var returnData = {};

        for(var workgroupKey in workgroupStats){
            if(workgroupFilter.indexOf(workgroupKey.toLowerCase()) > -1){
                returnData[workgroupKey] = workgroupStats[workgroupKey];
            }
        }
        response.send(returnData);
    })*/
