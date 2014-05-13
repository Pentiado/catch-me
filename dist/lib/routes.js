'use strict';

var index = require('./controllers');
var emails = require('./controllers/emails.js');

module.exports = function(app) {
  app.route('/emails/:email/download')
    .get(emails.download);
  app.route('/emails/:email')
    .get(emails.details);
  app.route('/partials/*')
    .get(index.partials);
  app.route('/quit')
    .get(index.quit);
  app.route('/*')
    .get(index.index);
};