// Get our dependencies
var express = require('express');
var app = express(),
  mongoose = require('mongoose'),
  Mission = require('./api/models/missionModel'),
  Game = require('./api/models/gameModel'),
  Agent = require('./api/models/agentModel'),
  Action = require('./api/models/actionModel'),
  bodyParser = require('body-parser');
  
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
      Agent.findOne({target: victim._id}, function(err, agent){
        agent.mission = victim.mission._id;
        agent.target = victim.target._id;
        agent.life = ((agent.life >= 5) ? 5 : (agent.life + 1));
        victim.life = 0;
        victim.status = 'dead';
        victim.mission = null;
        victim.target = null;

        console.log("kill");

        Agent.findByIdAndUpdate({_id: agent._id}, agent)
        .exec(function(){
          Agent.findOne({_id: agent._id})
          .populate('game')
          .populate('target')
          .populate('mission')
          .exec((err, a)=>{
            socket.broadcast.emit("agent-update", a);
          })
        });
        Agent.update({_id: victim._id}, victim).exec(function(err, res){});
      });
      socket.broadcast.emit("confirm-kill", victim);
    });	
    socket.on("unconfirm-kill", function (victim) {
      console.log("kill non confirmé");
      socket.broadcast.emit("unconfirm-kill", victim);
    });
});


//server.listen(8080);

server.listen(port);

console.log('killer RESTful API server started on: ' + port);