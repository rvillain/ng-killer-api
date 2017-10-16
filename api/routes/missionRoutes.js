'use strict';
module.exports = function(app) {
  var missionCtrl = require('../controllers/missionController');
  // todoList Routes
  app.route('/missions')
    .get(missionCtrl.list_all_missions)
    .post(missionCtrl.create_a_mission);

  app.route('/missions/generics')
    .get(missionCtrl.list_all_generic_missions);

  app.route('/missions/:missionId')
    .get(missionCtrl.read_a_mission)
    .put(missionCtrl.update_a_mission)
    .delete(missionCtrl.delete_a_mission);
};