'use strict';

var emails = require('./controllers/emails');
var index = require('./controllers');

/**
 * Application routes
 */
module.exports = function(app) {

  // Server API Routes
  // app.route('/api/emails')
  //   .delete(emails.delete);

  // app.route('/api/emails/:id')
  //   .delete(emails.delete);

  app.route('/api/*')
    .get(function(req, res) {
      res.send(404);
    });

  app.route('/partials/*')
    .get(index.partials);
  app.route('/*')
    .get( index.index);

};