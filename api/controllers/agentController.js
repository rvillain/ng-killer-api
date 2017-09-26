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
  console.log(new_agent);
  new_agent.save(function(err, agent) {
     if (err)
       res.send(err);
    res.json(agent);
  });
  
  // var new_agent = new Agent(req.body);
  // new_agent.save(function(err, agent) {
  //   if (err)
  //     res.send(err);
  //   res.json(agent);
  // });
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

var killAnAgent = function(agent){
  Agent.findOne({target : agent._id },function (err, killer){
    killer.target = agent.target._id;
    killer.mission = agent.mission._id;
    Agent.update({_id: killer._id}, killer)
    .populate('game')
    .populate('target')
    .populate('mission')
    .exec(function(err, res){
      //todo signalR stuff
      agent.status = "dead";
      agent.mission = null;
      agent.target = null;
      agent.life = 0;
      Agent.update({_id: agent._id}, agent,function(err, r){
        if(err)
          console.log(err);
        console.log(r);
      });
    });
  });
}

exports.kill_an_agent = function(req, res) {
  Agent.findById({_id: req.params.agentId})
  .populate('game')
  .populate('target')
  .populate('target.target')
  .populate('target.mission')
  .populate('mission')
  .exec(function(err, agent) {
    var agentToKill=null;
    if (err)
      res.send(err);
    var newAction = new Action();
    newAction.killer = agent._id;
    newAction.target = agent.target._id;
    newAction.game = agent.game._id;
    if(agent.target.code == req.body.code){
      console.log("kill");
      agentToKill = agent.target;
      newAction.type = "kill";
      if(agent.life < 5)
        agent.life ++;
      Agent.update({_id: agent._id}, agent);
    }
    else{
      console.log("target error");
      agent.life --;
      Agent.update({_id: agent._id}, agent, function(err, a){
        if(err)
          res.send(err);
      });
      newAction.type = "wrong_target";
      if(agent.life == 0){
        //Si l'agent n'a plus de point di vie, il faut le tuer et changer la cible de son killer
        agentToKill = agent;
      }
    }
      Action.create(newAction,function(err, action){
        if (err)
          res.send(err);
        Action.findById(action._id)
        .populate("killer")
        .populate("killer.target")
        .populate(
        {
          path: 'killer',
          populate: {
            path: 'game'
          }
        })
        .populate('killer.mission')
        .exec(function(err, action){
          if(err)
            res.send(err);
          console.log("new Action");
          if(agentToKill)
            killAnAgent(agentToKill);
          res.json(action);
        })
      });
    
  });
  
}

exports.unmask_an_agent = function(req, res) {
  Agent.findById({_id: req.params.agentId})
  .populate('game')
  .populate('target')
  .populate('target.target')
  .populate('target.mission')
  .populate('mission')
  .exec(function(err, agent) {
    if (err)
      res.send(err);

    var agentToKill=null;
    Agent.findOne({name: req.body.name})
    .exec(function(err, myKiller){
      if(err)
        res.send(err);
      if(myKiller == null){
        res.send({error: "Cet agent n'existe pas"});
        return;
      }

      var newAction = new Action();
      newAction.killer = agent._id;
      newAction.target = myKiller._id;
      newAction.game = agent.game._id;

      console.log(myKiller.target, agent._id);
      if(myKiller.target.equals(agent._id)){
        console.log("unmask");
        newAction.type = "unmask";
        agentToKill = myKiller;
        if(agent.life < 5)
          agent.life ++;
        Agent.update({_id: agent._id}, agent);
      }
      else{
        console.log("wrong killer");
        newAction.type = "wrong_killer";
        if(agent.life > 0)
          agent.life --;
        Agent.update({_id: agent._id}, agent);
        if(agent.life == 0){
          //Si l'agent n'a plus de point de vie, il faut le tuer et changer la cible de son killer
          agentToKill = agent;
        }
      }
      Action.create(newAction,function(err, action){
        if (err)
          res.send(err);
        Action.findById(action._id)
        .populate("killer")
        .populate("killer.target")
        .populate(
        {
          path: 'killer',
          populate: {
            path: 'game'
          }
        })
        .populate('killer.mission')
        .exec(function(err, action){
          if(err)
            res.send(err);
          console.log("new Action");
          if(agentToKill)
            killAnAgent(agentToKill);
          res.json(action);
        })
      });
      
    });
  });
  
}