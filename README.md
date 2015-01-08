A NodeJS application which can monitor SIP devices and notify if the SIP stack stops responding to SIP Options messages

Notifications
=============
When the status of a SIP options ping changes from up to down or down to up, an outbound notification can be sent either in the form of a web hook or an email.  

Web Hook
--------

For the web hooks, an external web service must be setup to handle the POST message.

The contents of the POST contain a JSON object similar to
```
{
    "ip": "172.19.34.93",
    "status": "down",
    "name": "integrations 1"
}
```

Email
-----
Outbound status can be send via email with an external SMTP web server.

Web Endpoints
=============
The server has a couple web endpoints available
**"/"** the root of the service hosts a web page with a table of all the servers and their status.
**"/devices"** returns a JSON object with all of the servers and their status.
**"/webhooktest"** is a sample web hook endpoint and simply logs out that the web hook was received.

Configuration
=============
The service is configured in the configuration.json file.

**servers** - a list of servers to poll each server should have a *name* and *ip* property
```
  "servers":[
  {
    "name":"Morbo",
    "ip":"172.19.34.165"
    },
    {
        "name":"integrations 1",
        "ip":"172.19.34.93"
  }],
```

**notifications** - configuration for the outbound notifications to report on sip status
**webhook** - Web hook configuration, requires a host name, port and relative path.  Web hooks are optional.
**email** - SMPT email configuration, can be anonymous or with credentials.  Email notifications are optional.

Full Example
------------
```
    {
        "pollInterval": 2000,
        "servers":[
        {
            "name":"Morbo",
            "ip":"172.19.34.165"
            },
            {
                "name":"integrations 1",
                "ip":"172.19.34.93"
            }
            ],
            "notifications":{
                "webhook":{
                    "host" : "localhost",
                    "port": 8080,
                    "path" : "/webhooktest"
                    },
                    "email":{
                        "configuration":{
                            "user": "",
                            "password":"",
                            "host":"morbo.dev2000.com",
                            "ssl": false
                            },
                            "message":{
                                "from":"kevin.glinski@dev2000.com",
                                "to":"kevin.glinski@dev2000.com"
                            }


                        }

                    }
                }
```
