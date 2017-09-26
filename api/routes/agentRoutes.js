'use strict';
module.exports = function(app) {
  var agentCtrl = require('../controllers/agentController');
  // todoList Routes
  app.route('/agents')
    .get(agentCtrl.list_all_agents)
    .post(agentCtrl.create_an_agent);


  app.route('/agents/:agentId')
    .get(agentCtrl.read_an_agent)
    .put(agentCtrl.update_an_agent)
    .delete(agentCtrl.delete_an_agent);

  app.route('/agents/:agentId/kill')
    .post(agentCtrl.kill_an_agent);
    
  app.route('/agents/:agentId/unmask')
    .post(agentCtrl.unmask_an_agent);
};