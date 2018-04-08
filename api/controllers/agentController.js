'use strict';

var mongoose = require('mongoose'),
  Agent = mongoose.model('Agent'),
  Game = mongoose.model('Game'),
  Action = mongoose.model('Action');

exports.list_all_agents = function (req, res) {
  Agent.find({}, function (err, agent) {
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

exports.create_an_agent = function (req, res) {
  var new_agent = new Agent(req.body);
  new_agent.code = makeid();
  new_agent.game = req.body.game._id;
  Game.findById(new_agent.game, (errGame, game) => {
    if (!game) {
      res.status(500).send({ error: 'Cette partie n\'existe pas' });
    }
    else if (game.status != 'created') {
      res.status(500).send({ error: 'Cette partie a déjà commencée' });
    }
    else {
      Agent.findOne({ game: new_agent.game, name: { $regex: new RegExp(new_agent.name, "i") } }, (err, a) => {
        if (a) {
          res.status(500).send({ error: 'Ce pseudo est déjà pris' });
          //res.json(new Error("Ce pseudo est déjà pris."));
        }
        else {
          new_agent.save(function (err, agent) {
            if (err)
              res.send(err);
            res.json(agent);
          });
        }
      })
    }
  })
};


exports.read_an_agent = function (req, res) {
  Agent.findById({ _id: req.params.agentId })
    .populate('game')
    .populate({
      path: 'game',
      populate: {
        path: 'actions',
        populate: {
          path: 'killer'
        }
      }
    })
    .populate({
      path: 'game',
      populate: {
        path: 'actions',
        populate: {
          path: 'target'
        }
      }
    })
    .populate({
      path: 'game',
      populate: {
        path: 'actions',
        populate: {
          path: 'mission'
        }
      }
    })
    .populate('target')
    .populate('mission')
    .exec(function (err, agent) {
      if (err)
        res.send(err);
      //filter actions for agent only

      //Todo: filtrer les actions du joueur
      //agent.game.actions = agent.game.actions.filter(a => (a.killer && (a.killer._id == agent._id) || a.target && (a.target._id == agent._id)) )
      res.json(agent);
    });
};

exports.get_for_unmask = function (req, res) {
  Agent.findById({ _id: req.params.agentId })
    .exec(function (err, agent) {
      if (err)
        res.send(err);
      Agent.find({ game: agent.game, _id: { $ne: agent._id } }, function (err, agents) {
        if (err)
          res.send(err);
        agents = agents.map(a => {
          var ag = new Agent();
          ag.name = a.name;
          return ag;
        });
        res.json(agents);
      });
    });


}


exports.update_an_agent = function (req, res) {
  Agent.findOneAndUpdate({ _id: req.params.agentId }, req.body, { new: true }, function (err, agent) {
    if (err)
      res.send(err);
    res.json(agent);
  });
};


exports.delete_an_agent = function (req, res) {
  Agent.remove({
    _id: req.params.agentId
  }, function (err, agent) {
    if (err)
      res.send(err);
    res.json({ message: 'Agent successfully deleted' });
  });
};