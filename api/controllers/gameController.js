'use strict';


var mongoose = require('mongoose'),
  Game = mongoose.model('Game'),
  Agent = mongoose.model('Agent'),
  Mission = mongoose.model('Mission'),
  Tribunal = mongoose.model('Tribunal'),
  Vote = mongoose.model('Vote'),
  Action = mongoose.model('Action');

exports.list_all_games = function(req, res) {
  Game.find({}, function(err, game) {
    if (err)
      res.send(err);
    res.json(game);
  });
};


exports.create_a_game = function(req, res) {
  var new_game = new Game(req.body);
  new_game.save(function(err, game) {
    if (err)
      res.send(err);
    res.json(game);
  });
};


exports.read_a_game = function(req, res) {
  Game.findById({_id: req.params.gameId})
  .populate('agents')
  .populate('missions')
  .populate('actions')
  .populate({
    path: 'actions',
    populate: {
      path: 'killer'
    }
  })
  .populate({
    path: 'actions',
    populate: {
      path: 'target'
    }
  })
  .populate({
    path: 'actions',
    populate: {
      path: 'mission'
    }
  })
  .exec(function(err, game) {
    if (err)
      res.send(err);
    res.json(game);
  });
};


exports.update_a_game = function(req, res) {
  Game.findOneAndUpdate({_id: req.params.gameId}, req.body, {new: true}, function(err, game) {
    if (err)
      res.send(err);
    res.json(game);
  });
};

function Shuffle(o) {
	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};

exports.start_a_game = function(req, res) {
  Game.findById({_id: req.params.gameId})
    .populate('agents')
    .populate('missions')
    .exec(function(err, game) 
  {
    if (err)
      res.send(err);
    var randomOrderedAgents = Shuffle(game.agents);
    var randomOrderedMissions = Shuffle(game.missions);

    for(var i = 0; i<randomOrderedAgents.length; i++){
      var sourceAgent = randomOrderedAgents[i];
      var targetAgent = randomOrderedAgents[ (i == (game.agents.length - 1))?0:(i+1)];

      var mission = randomOrderedMissions[i];
      
      sourceAgent.target = targetAgent._id;
      sourceAgent.mission = mission._id;

      Agent.update({_id: sourceAgent._id}, sourceAgent, function(err, a){
        if (err)
          res.send(err);
      });
      mission.agent = sourceAgent._id;
      mission.used = true;
      Mission.update({_id: mission._id}, mission, function(err, a){
        if (err)
          res.send(err);
      });
    }
    game.status = "started";
    Game.findOneAndUpdate({_id: req.params.gameId}, game, {new: true}, function(err, g) {
      if (err)
        res.send(err);
      res.json(game);
      var newAction = new Action();
      newAction.game = g._id;
      newAction.type = "game_started";
      newAction.save(function(err, a) {});
    });
  });
};

exports.reinit_a_game = function(req, res) {
  var gameId = req.params.gameId;
  Agent.update({game: gameId}, {status: 'alive', mission: null, target: null, life: 3}, {multi: true}, (err, raw)=>{
    
  });
  Game.findByIdAndUpdate(gameId, {status: "created"}, (err, g) => {
    res.json(g._doc);
  })
  Action.remove({game: gameId},(err, action)=>{});
  Tribunal.remove({game: gameId},(err, action)=>{});
  Vote.remove({game: gameId},(err, action)=>{});
  Mission.update({game: gameId}, {used: false}, {multi: true}, (err, raw)=>{});
}

exports.add_missions = function(req, res){
  var gameId = req.params.gameId;
  var missions = req.body.missions;
  missions.forEach(function(mission) {
    var new_mission = new Mission();
    new_mission.title = mission.title;
    new_mission.difficulty = mission.difficulty;
    new_mission.game = gameId;
    new_mission.save(function(err, game) {});
  }, this);
  exports.read_a_game(req, res);
}

exports.delete_a_game = function(req, res) {
  let gameId = req.params.gameId;
  Game.remove({
    _id: gameId
  }, function(err, game) {
    if (err)
      res.send(err);
    
    Action.remove({game: gameId},(err, action)=>{});
    Agent.remove({game: gameId},(err, action)=>{});
    Mission.remove({game: gameId},(err, action)=>{});
    Tribunal.remove({game: gameId},(err, action)=>{});
    Vote.remove({game: gameId},(err, action)=>{});
    res.json({ message: 'Game successfully deleted' });
  });
};