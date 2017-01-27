var app = require('express')();             //Express initializes 'app' (=Express App) to be function for http server
var http = require('http').Server(app);     //app is put into a server using http
var io = require('socket.io')(http);        //socket IO http server
var path = require('path');                 //path module
var fs = require('fs');                     //filesystem module

app.get('/', function(req, res){                    //get(path, middleware), req = obj w/http request info, res = http response
    res.sendFile(__dirname + '/index.html');       //sendFile(__dirname + 'filename') = sends http response
});

var chatlog = function(room, timestamp, user, msg, chatmsg){    
    var filename = "logs/"+room + ".txt";           //filename for chat logs
    var name = "["+timestamp+"] "+user+": "+msg;     //message used for 

    if (user == null){
        name = "["+timestamp+"]"+" "+msg;     //message used for 
    }

    fs.appendFile(filename, name+"\n", function(e){  
            console.log(name);
    });
    if(chatmsg != null){
        io.to(room).emit('chat message', chatmsg);
    }
};

io.on('connection', function(socket){       //occurs when a socket is opened

    //Timestamp construction
    var time = new Date();                  
    var now = ('0'+time.getMonth()+1).slice(-2)+"/"+('0'+time.getDate()).slice(-2)+"/"+time.getFullYear().toString()+" "+('0'+time.getHours()).slice(-2)+":"+('0'+time.getMinutes()).slice(-2)+":"+('0'+time.getSeconds()).slice(-2) + ":" +('00'+time.getMilliseconds()).slice(-3);

    //Room and Username Setup
    socket.on('room name', function(rmnm, user){
        socket.join(rmnm);
        socket.rooms = rmnm;
        socket.id = user;
        console.log("["+now+"] " + socket.id + " connecting to "+ socket.rooms + "...");            
        // io.to(socket.rooms).emit('chat message', "["+now+"]"+socket.id + " has connected");
        chatlog(socket.rooms, now, socket.id, socket.id+ ' has connected.', "["+now+"] "+ socket.id + " has connected");
    });

    //When message is sent
    socket.on('chat message', function(msg){    //adds a listener to websocket to listen for 'chat message'
        chatlog(socket.rooms, now, socket.id, msg, "["+now+"] " + socket.id +": " + msg);
        // io.to(socket.rooms).emit('chat message', "["+now+"] " + socket.id +": " + msg);           //broadcasts message 'chat message'/msg to default room/namespace 
    });


    socket.on('disconnecting', function(){
        console.log("["+now+"] " + socket.id + " is disconnecting from "+ socket.rooms + "...");            
        chatlog(socket.rooms, now, null, socket.id+ " has disconnected from " +socket.rooms, "["+now+"] "+socket.id + ' has disconnected.');
        // io.to(socket.rooms).emit('chat message', "["+now+"]"+socket.id + ' has disconnected.');           //broadcasts message 'chat message'/msg to default socket.rooms/namespace 
        socket.leave(socket.rooms);
    });

});


http.listen(3000, function(){               //listen(port, [hostname], [backlog], callback) = binds and listens to connections on specified host and port, identical to Node's http.Server.listen()'
    console.log('listening on *:3000');     //displays action in console
});

