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

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
    console.log("Nouveau joueur !"); 
    socket.on("ask-kill", function (killer) {
      socket.broadcast.emit("ask-kill", killer);
    });	
    socket.on("confirm-kill", function (victim) {
      socketCtrl.kill(victim, socket);
    });	
    socket.on("unconfirm-kill", function (victim) {
      console.log("kill non confirmé");
      socket.broadcast.emit("unconfirm-kill", victim);
    });

    socket.on("ask-unmask", function (options) {
      var agent = options.agent;
      var name = options.name;
      Agent.findOne({name: name}, (err, killer)=>{
        if(killer.target == agent._id){
          socket.broadcast.emit("ask-unmask", killer);
        }
      });
      
    });	
    socket.on("confirm-unmask", function (victim) {
      socketCtrl.unmask(victim, socket);
    });	
    socket.on("unconfirm-unmask", function (victim) {
      console.log("Unmask non confirmé");
      //TODO: gérer le cas d'une erreur d'unmask
      socket.broadcast.emit("unconfirm-unmask", victim);
    });
});


//server.listen(8080);

server.listen(port);

console.log('killer RESTful API server started on: ' + port);