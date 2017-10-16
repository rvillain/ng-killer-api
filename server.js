// Get our dependencies
var express = require('express');
var app = express(),
  mongoose = require('mongoose'),
  Mission = require('./api/models/missionModel'),
  Game = require('./api/models/gameModel'),
  Agent = require('./api/models/agentModel'),
  Action = require('./api/models/actionModel'),
  bodyParser = require('body-parser');
var socketCtrl = require('./api/controllers/socketController');
  
var server = require('http').createServer(app);

port = process.env.PORT || 3000;

// mongoose instance connection url connection
//mongoose.Promise = global.Promise;
var promise = mongoose.connect('mongodb://ng-killer-user:nbvcxw1@ds040167.mlab.com:40167/ng-killer-db', {
  useMongoClient: true
  });
//mongoose.connect('mongodb://localhost/KillerDb'); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//cors
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  next();
});


var missionRoutes = require('./api/routes/missionRoutes'); 
var gameRoutes = require('./api/routes/gameRoutes'); 
var agentRoutes = require('./api/routes/agentRoutes'); 
missionRoutes(app);
gameRoutes(app);
agentRoutes(app);

var http = require('http');
var fs = require('fs');

// Chargement de socket.io
var io = require('socket.io').listen(server);

// Quand un client se connecte
io.sockets.on('connection', function (socket) {
    socket.on("new-agent", function (agent) {
      socket.in(agent.game).broadcast.emit("new-agent", agent);
      
    });	

    socket.on("ask-kill", function (killer) {
      socket.in(socket.rooms[1]).broadcast.emit("ask-kill", killer);
    });	
    socket.on("confirm-kill", function (victim) {
      socketCtrl.kill(victim, socket);
    });	
    socket.on("unconfirm-kill", function (victim) {
      console.log("kill non confirmé");
      socket.in(socket.rooms[1]).broadcast.emit("unconfirm-kill", victim);
    });

    socket.on("ask-unmask", function (options) {
      var agent = options.agent;
      var name = options.name;
      Agent.findOne({name: { $regex : new RegExp(name, "i") }}, (err, killer)=>{
        if(killer && killer.target == agent._id){
          socket.in(socket.rooms[1]).broadcast.emit("ask-unmask", killer);
        }
        else{
          socketCtrl.wrongKiller(agent, socket);
        }
      });
      
    });	
    socket.on("confirm-unmask", function (victim) {
      socketCtrl.unmask(victim, socket);
    });	
    socket.on("unconfirm-unmask", function (victim) {
      console.log("Unmask non confirmé");
      //TODO: gérer le cas d'une erreur d'unmask
      socket.in(socket.rooms[1]).broadcast.emit("unconfirm-unmask", victim);
    });
    socket.on("change-mission", function (agent) {
      socketCtrl.changeMission(agent, socket);
    });	
    socket.on("suicide", function (agent) {
      socketCtrl.suicide(agent, socket);
    });
    	
    socket.on("join-room", function (game) {
      if(socket.rooms)
          socket.leave(socket.rooms);
      var gameId = game._id;
      socket.join(gameId);
    });	
    socket.on("game-status", function (game) {
      socket.in(game._id).broadcast.emit("game-status", game);
    });	
});


//server.listen(8080);

server.listen(port);

console.log('killer RESTful API server started on: ' + port);