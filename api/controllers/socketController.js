'use strict';

var mongoose = require('mongoose'),
Agent = mongoose.model('Agent'),
Game = mongoose.model('Game'),
Action = mongoose.model('Action'),
Mission = mongoose.model('Mission');

exports.changeMission = function (agent, socket){
  Mission.find({game: agent.game._id, used: false}, (err, missions) => {
    if(missions && missions.length > 0){
      let mission = missions[0];
      mission.used = true;
      Mission.update({_id: mission._id}, mission, (err, m)=>{
        if(err)
          console.log(err);
      });
      agent.mission = mission._id;
      agent.life --;
    }
    updateAgent(socket, agent, null, {broadcast: false});
  })
}
exports.suicide = function (agent, socket){
  Agent.findOne({target: agent._id}, (err, killer) => {
    killer = killer.toObject();
    killer.target = agent.target._id;
    updateAgent(socket, killer, null);
    agent.life = 0;
    agent.status = 'dead';
    updateAgent(socket, agent, null, {broadcast: false});
    var newAction = new Action();
    newAction.game = agent.game._id;
    newAction.killer = agent._id;
    newAction.type = "suicide";
    addAction(socket, newAction);
    console.log(socket.room);
    socket.broadcast.emit("suicide", agent);
  })
}

exports.kill = function(victim, socket) {
    Agent.findOne({target: victim._id}).exec(function(err, agent){
      
        let currentMission = agent.mission;
        agent = agent.toObject();
        agent.mission = victim.mission._id;
        agent.target = victim.target._id;
        agent.life = ((agent.life >= 5) ? 5 : (agent.life + 1));
        victim.life = 0;
        victim.status = 'dead';
        victim.mission = null;
        victim.target = null;

        console.log("kill");

        updateAgent(socket, agent, function(a){
          var newAction = new Action();
          newAction.game = victim.game._id;
          newAction.target = victim._id;
          newAction.killer = agent._id;
          newAction.type = "kill";
          newAction.mission = currentMission;
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
          t.life = ((t.life >= 5) ? 5 : (t.life + 1));
          updateAgent(socket, t);
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
  socket.emit("wrong-killer", agent);
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

var updateAgent = function(socket, agent, callback, options){
  Agent.findByIdAndUpdate(agent._id, agent, {new: true})
  .populate('game')
  .populate('target')
  .populate('mission')
  .exec((err, a) => {
    a = a.toObject();
    if(options && options.broadcast == false){
      socket.emit("agent-update", a);
    }
    else{
      socket.broadcast.emit("agent-update", a);
    }
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