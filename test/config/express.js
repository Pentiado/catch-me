'use strict';

var server = require('../../server.js');
var request = require('supertest');
var expect = require('chai').expect;

describe('express', function() {
  describe('caching', function() {
    it('should disable caching of scripts when in development', function (done) {
      var prevEnv = process.env;
      process.env = 'development';
      request(server).get('/scripts/qwe.js').end(function (err, res) {
        process.env = prevEnv;
        expect(res.headers.pragma).to.equal('no-cache');
        done(err);
      });
    });
  });
});