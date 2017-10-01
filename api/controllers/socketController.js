'use strict';

var mongoose = require('mongoose'),
Agent = mongoose.model('Agent'),
Game = mongoose.model('Game'),
Action = mongoose.model('Action');

exports.kill = function(victim, socket) {
    Agent.findOne({target: victim._id}).exec(function(err, agent){
        agent = agent.toObject();
        agent.mission = victim.mission._id;
        agent.target = victim.target._id;
        agent.life = ((agent.life >= 5) ? 5 : (agent.life + 1));
        victim.life = 0;
        victim.status = 'dead';
        let victimMission = victim.mission._id;
        victim.mission = null;
        victim.target = null;

        console.log("kill");

        updateAgent(socket, agent, function(a){
          var newAction = new Action();
          newAction.game = victim.game._id;
          newAction.target = victim._id;
          newAction.killer = agent._id;
          newAction.type = "kill";
          newAction.mission = victimMission;
          addAction(socket, newAction);
        })
        updateAgent(socket, victim);
    });
    socket.broadcast.emit("confirm-kill", victim);
};

exports.unmask = function(victim, socket) {
    var target = victim.target;
    // Killer => Victim => Target
    Agent.findOne({target: victim._id}, function(err, killer){
        killer = killer.toObject();
        killer.mission = victim.mission._id;
        killer.target = target._id;

        Agent.findById(target,(err, t) => {
          target.life = ((target.life >= 5) ? 5 : (target.life + 1));
          updateAgent(socket, target);
        });
        
        socket.broadcast.emit("confirm-unmask", victim);

        victim.life = 0;
        victim.status = 'dead';
        victim.mission = null;
        victim.target = null;

        console.log("unmask");
        
        updateAgent(socket, killer, function(k){
          var newAction = new Action();
          newAction.game = victim.game._id;
          newAction.target = victim._id;
          newAction.killer = target;
          newAction.type = "unmask";
          addAction(socket, newAction);
        });
        updateAgent(socket, victim);
    });
};

exports.wrongKiller = function(agent, socket){
  removeLifePoint(agent);
  if(agent.life == 0){
    agent.status = 'dead'
    //Il faut changer la target de son killer
    Agent.findOne({target: agent._id}, function(err, killer){
      killer = killer.toObject();
      killer.target = agent.target._id;
      updateAgent(socket, killer, function(k){
        agent.target = null;
        agent.mission = null;
        updateAgent(socket, agent, function(a){});
        var newAction = new Action();
        newAction.game = agent.game._id;
        newAction.killer = agent._id;
        newAction.type = "error_death";
        addAction(socket, newAction);
      });
    })
  }
  else{
    updateAgent(socket, agent, function(a){
      var newAction = new Action();
      newAction.game = agent.game._id;
      newAction.killer = a._id;
      newAction.type = "wrong_killer";
      addAction(socket, newAction);
    });
  }
}

var addAction = function(socket, newAction){
  Action.create(newAction, (err, action) => {
    Action.findOne({_id: action._id})
      .populate("killer")
      .populate("target")
      .populate('mission')
      .exec((err, a) => {
      socket.broadcast.emit("new-action", a);
    });
  });
}

var updateAgent = function(socket, agent, callback){
  Agent.findByIdAndUpdate(agent._id, agent, {new: true})
  .populate('game')
  .populate('target')
  .populate('mission')
  .exec((err, a) => {
    a = a.toObject();
    socket.broadcast.emit("agent-update", a);
    if(callback){
      callback(a);
    }
  });
}

var addLifePoint = function(agent){
  agent.life = ((agent.life >= 5) ? 5 : (agent.life + 1));

}
var removeLifePoint = function(agent){
  agent.life = ((agent.life <= 0) ? 0 : (agent.life - 1));

}