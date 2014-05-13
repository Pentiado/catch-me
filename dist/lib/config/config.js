'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');

module.exports = {
  root: rootPath,
  port: process.env.PORT || 1080,
  mailPort: 1025
};
