 const server = require('../src/server').createServer();
const fs = require('fs');

/*
const io = require('socket.io').listen(httpServer);

io.on('connection',function(socket){
    console.log('We have user connected !');
    
    // This event will be emitted from Client when some one add comments.

    socket.on('comment added',function(data){
      console.log("data is " + data);
        socket.broadcast.emit("notify everyone", data);
    });

    socket.on('news',function(data){
      console.log("news is " + data);
    });
    
    socket.on('disconnect', function() {
      console.log('user disconnected');
    });
});

const chat = io
           .of('/chat')
           .on('connection', function (chatsocket) {
              console.log('chat room got a connection');

        chatsocket.on('chat', function (data) {
          console.log('chat message received: ' + JSON.stringify(data));
          chatsocket.send('chat response', "Thanks for " + JSON.stringify(data));
        });
        
        chatsocket.emit('chat response', "hey welcome to chat!");

           }); 

const news = io
           .of('/news')
           .on('connection', function (socket) {
              console.log('news room got a connection');
           }); 

news.emit ('a message', {everyone: 'in', '/news': 'will get' });
news.on('news', function (data) {
    console.log('news item received: ' + data);
});

*/


function getSecureContexts(certs) {

    if (!certs || Object.keys(certs).length === 0) {
      throw new Error("Any certificate wasn't found.");
    }

    const certsToReturn = {};

    for (const serverName of Object.keys(certs)) {
      const appCert = certs[serverName];

      certsToReturn[serverName] = require("tls").createSecureContext({
        key: appCert.key,
        cert: appCert.cert,
        // If the 'ca' option is not given, then node.js will use the default
        ca: appCert.ca ? sslCADecode(
          appCert.ca,
        ) : null,
      });
    }

    return certsToReturn;
}

// if CA contains more certificates it will be parsed to array
function sslCADecode(source) {

    if (!source || typeof (source) !== "string") {
        return [];
    }

    return source.split(/-----END CERTIFICATE-----[\s\n]+-----BEGIN CERTIFICATE-----/)
        .map((value, index, array) => {
        if (index) {
            value = "-----BEGIN CERTIFICATE-----" + value;
        }
        if (index !== array.length - 1) {
            value = value + "-----END CERTIFICATE-----";
        }
        value = value.replace(/^\n+/, "").replace(/\n+$/, "");
        return value;
    });

}


if (server.settings.env == "production") {

  const certs = {
      "simplytextile.com": {
        ca: fs.readFileSync("./certs/simplytextile/www.simplytextile.com.ca-bundle"),
        key: fs.readFileSync("./certs/simplytextile/www.simplytextile.com.key"),
        cert: fs.readFileSync("./certs/simplytextile/www.simplytextile.com.chained.crt")
      },
      "www.simplytextile.com": {
        ca: fs.readFileSync("./certs/simplytextile/www.simplytextile.com.ca-bundle"),
        key: fs.readFileSync("./certs/simplytextile/www.simplytextile.com.key"),
        cert: fs.readFileSync("./certs/simplytextile/www.simplytextile.com.chained.crt")
      },
      "simply-reminders.com": {
        ca: fs.readFileSync("./certs/simply-reminders/fullchain.pem"),
        key: fs.readFileSync("./certs/simply-reminders/privkey.pem"),
        cert: fs.readFileSync("./certs/simply-reminders/simply-reminders.com.chained.crt")    
      },
      "www.simply-reminders.com": {
        ca: fs.readFileSync("./certs/simply-reminders/fullchain.pem"),
        key: fs.readFileSync("./certs/simply-reminders/privkey.pem"),
        cert: fs.readFileSync("./certs/simply-reminders/simply-reminders.com.chained.crt")    
      },
      "simplyapp.in": {
        ca: fs.readFileSync("./certs/simplyapp/fullchain.pem"),
        key: fs.readFileSync("./certs/simplyapp/privkey.pem"),
        cert: fs.readFileSync("./certs/simplyapp/simplyapp.in.chained.crt")    
      },
      "www.simplyapp.in": {
        ca: fs.readFileSync("./certs/simplyapp/fullchain.pem"),
        key: fs.readFileSync("./certs/simplyapp/privkey.pem"),
        cert: fs.readFileSync("./certs/simplyapp/simplyapp.in.chained.crt")    
      }
  };

  const secureContexts = getSecureContexts(certs);

  const options = {
      // A function that will be called if the client supports SNI TLS extension.
      SNICallback: (servername, cb) => {

          const ctx = secureContexts[servername];

          if (!ctx) {
              console.error(`Not found SSL certificate for host: ${servername}`);
          }

          if (cb) {
              cb(null, ctx);
          } else {
              return ctx;
          }
      },
  };

  const httpsPortNumber = process.env.HTTPS_PORT || 443;
  const httpsServer = require('https').createServer(options, server);
  httpsServer.listen(httpsPortNumber, function () {
    console.log('Accepting incoming requests at: ' + Date() + ' with env: ' + server.settings.env);
  });

}

const httpPortNumber = process.env.PORT || 80;
const httpServer = require('http').createServer(server);
httpServer.listen(httpPortNumber, function () {
    console.log('Accepting incoming requests at: ' + Date() + ' with env: ' + server.settings.env);
});
