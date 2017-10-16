'use strict';


var mongoose = require('mongoose'),
  Mission = mongoose.model('Mission');

exports.list_all_missions = function(req, res) {
  Mission.find({}, function(err, mission) {
    if (err)
      res.send(err);
    res.json(mission);
  });
};

exports.list_all_generic_missions = function(req, res) {
  Mission.find({game: null}, function(err, mission) {
    if (err)
      res.send(err);
    res.json(mission);
  });
};


exports.create_a_mission = function(req, res) {
  var new_mission = new Mission(req.body);
  new_mission.save(function(err, mission) {
    if (err)
      res.send(err);
    res.json(mission);
  });
};


exports.read_a_mission = function(req, res) {
  Mission.findById({_id: req.params.missionId}, function(err, mission) {
    if (err)
      res.send(err);
    res.json(mission);
  });
};


exports.update_a_mission = function(req, res) {
  Mission.findOneAndUpdate({_id: req.params.missionId}, req.body, {new: true}, function(err, mission) {
    if (err)
      res.send(err);
    res.json(mission);
  });
};


exports.delete_a_mission = function(req, res) {


  Mission.remove({
    _id: req.params.missionId
  }, function(err, mission) {
    if (err)
      res.send(err);
    res.json({ message: 'Mission successfully deleted' });
  });
};