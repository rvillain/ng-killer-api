'use strict';

var mongoose = require('mongoose'),
Agent = mongoose.model('Agent'),
Game = mongoose.model('Game'),
Action = mongoose.model('Action');

exports.kill = function(victim, socket) {
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

            var newAction = new Action();
            newAction.game = victim.game._id;
            newAction.victim = victim._id;
            newAction.killer = agent._id;
            newAction.type = "kill";
            Action.create(newAction, (err, action) => {
              socket.broadcast.emit("new-action", a);
            });
          })
        });
        Agent.update({_id: victim._id}, victim).exec(function(err, res){});
    });
    socket.broadcast.emit("confirm-kill", victim);
};

exports.unmask = function(victim, socket) {
    var target = victim.target;
    // Killer => Victim => Target
    Agent.findOne({target: victim._id}, function(err, killer){

        killer.mission = victim.mission._id;
        killer.target = target._id;

        target.life = ((target.life >= 5) ? 5 : (target.life + 1));
        
        victim.life = 0;
        victim.status = 'dead';
        victim.mission = null;
        victim.target = null;

        console.log("unmask");

        Agent.findByIdAndUpdate({_id: killer._id}, killer)
        .exec(function(){
          Agent.findOne({_id: killer._id})
          .populate('game')
          .populate('target')
          .populate('mission')
          .exec((err, a)=>{
            socket.broadcast.emit("agent-update", a);

            var newAction = new Action();
            newAction.game = victim.game._id;
            newAction.victim = victim._id;
            newAction.killer = killer._id;
            newAction.type = "unmask";
            Action.create(newAction).exec((err, action) => {
              socket.broadcast.emit("new-action", a);
            });
          })
        });
        Agent.update({_id: victim._id}, victim).exec(function(err, res){});
        socket.broadcast.emit("confirm-unmask", victim);
    });
};