'use strict';


var mongoose = require('mongoose'),
  Game = mongoose.model('Game'),
  Agent = mongoose.model('Agent'),
  Mission = mongoose.model('Mission');

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
      Mission.update({_id: mission._id}, mission, function(err, a){
        if (err)
          res.send(err);
      });
    }
    game.status = "started";
    Game.findOneAndUpdate({_id: req.params.gameId}, game, {new: false}, function(err, game) {
      if (err)
        res.send(err);
      res.json(game);
    });
  });
};


exports.delete_a_game = function(req, res) {
  Game.remove({
    _id: req.params.gameId
  }, function(err, game) {
    if (err)
      res.send(err);
    res.json({ message: 'Game successfully deleted' });
  });
};