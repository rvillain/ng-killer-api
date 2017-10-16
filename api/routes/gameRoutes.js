'use strict';
module.exports = function(app) {
  var gameCtrl = require('../controllers/gameController');
  // todoList Routes
  app.route('/games')
    .get(gameCtrl.list_all_games)
    .post(gameCtrl.create_a_game);


  app.route('/games/:gameId')
    .get(gameCtrl.read_a_game)
    .put(gameCtrl.update_a_game)
    .delete(gameCtrl.delete_a_game);
  
  app.route('/games/:gameId/missions')
    .post(gameCtrl.add_missions);

  app.route('/games/:gameId/start')
    .post(gameCtrl.start_a_game);

  app.route('/games/:gameId/reinit')
    .post(gameCtrl.reinit_a_game);
};