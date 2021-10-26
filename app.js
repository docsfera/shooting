const express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const PORT = process.env.PORT || 5002

app.use(express.static(__dirname));
app.get('/',function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/about',function(req, res) {
    res.end('<h1> About Page </h1>');
});

guns = {}

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('newPlayer', data => {
        console.log("New client connected, with id: "+socket.id);
        guns[socket.id] = data;
        console.log("Current number of players: "+Object.keys(guns).length);
        console.log("players dictionary: ", guns);
        io.emit('updatePlayers', guns);
    })



  socket.on('disconnect', function(){
     delete guns[socket.id];
    console.log("Goodbye client with id " + socket.id);
    console.log("guns:", guns)
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });


  socket.on('positionUpdateOnServer', position => {
  	if(guns[socket.id]){
  		guns[socket.id].px = position.pxx
    	guns[socket.id].py = position.pyy
    	guns[socket.id].pz = position.pzz
    	console.log(guns[socket.id])
    	io.emit('updatePlayers', guns)
  	}
  })


});

http.listen(PORT, function(){
  console.log(`listening on ${PORT}`);
});