'use strict';

var mongoose = require('mongoose'),
  Agent = mongoose.model('Agent'),
  Game = mongoose.model('Game'),
  Action = mongoose.model('Action');

exports.list_all_agents = function(req, res) {
  Agent.find({}, function(err, agent) {
    if (err)
      res.send(err);
    res.json(agent);
  });
};

function makeid() {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

exports.create_an_agent = function(req, res) {
  var new_agent = new Agent(req.body);
  new_agent.code = makeid();
  new_agent.game = req.body.game._id;
  
  Agent.findOne({game: new_agent.game, name: { $regex : new RegExp(new_agent.name, "i") }},(err, a) => {
    if(a)
    {
      res.status(500).send({error: 'Ce pseudo est déjà pris'});
      //res.json(new Error("Ce pseudo est déjà pris."));
    }
    else{
      new_agent.save(function(err, agent) {
        if (err)
          res.send(err);
        res.json(agent);
      });
    }
  })
};


exports.read_an_agent = function(req, res) {
  Agent.findById({_id: req.params.agentId})
  .populate('game')
  .populate('target')
  .populate('mission')
  .exec(function(err, agent) {
    if (err)
      res.send(err);
    res.json(agent);
  });
};


exports.update_an_agent = function(req, res) {
  Agent.findOneAndUpdate({_id: req.params.agentId}, req.body, {new: true}, function(err, agent) {
    if (err)
      res.send(err);
    res.json(agent);
  });
};


exports.delete_an_agent = function(req, res) {
  Agent.remove({
    _id: req.params.agentId
  }, function(err, agent) {
    if (err)
      res.send(err);
    res.json({ message: 'Agent successfully deleted' });
  });
};