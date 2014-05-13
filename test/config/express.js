'use strict';

var server = require('../../server.js');
var request = require('supertest');
var expect = require('chai').expect;

describe('express', function() {
  describe('caching', function() {
    it('should disable caching of scripts when in development', function (done) {
      var prevEnv = process.NODE_ENV;
      process.NODE_ENV = 'development';
      request(server).get('/scripts/qwe.js').end(function (err, res) {
        process.NODE_ENV = prevEnv;
        expect(res.headers.pragma).to.equal('no-cache');
        done(err);
      });
    });
  });
});