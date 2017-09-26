// Get our dependencies
var express = require('express');
var app = express(),
  mongoose = require('mongoose'),
  Mission = require('./api/models/missionModel'),
  Game = require('./api/models/gameModel'),
  Agent = require('./api/models/agentModel'),
  Action = require('./api/models/actionModel'),
  bodyParser = require('body-parser');

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


app.listen(port);

console.log('killer RESTful API server started on: ' + port);