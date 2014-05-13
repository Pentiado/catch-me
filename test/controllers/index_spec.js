'use strict';

var server = require('../../server.js');
var request = require('supertest');
var expect = require('chai').expect;
var sinon = require('sinon');
var forever = require('forever');

describe('index controller', function () {
  describe('partials()', function () {
    it('should return 404 when no partial', function (done) {
      request(server).get('/partials/blah.html').end(function (err, res) {
        expect(res.status).to.equal(404);
        done(err);
      });
    });
    it('should return partial when exist', function (done) {
      request(server).get('/partials/details.html').end(function (err, res) {
        expect(res.status).to.equal(200);
        done(err);
      });
    });
  });
  describe('quit()', function () {
    it('should return error message when process not found', function (done) {
      request(server).get('/quit').end(function (err, res) {
        expect(res.status).to.equal(404);
        expect(res.text).to.be.ok;
        done(err);
      });
    });
    it('should return error forever returns error', function (done) {
      var listStub = sinon.stub(forever, 'list');
      var message = 'Error';
      listStub.callsArgWith(1, message);
      request(server).get('/quit').end(function (err, res) {
        listStub.restore();
        expect(res.status).to.equal(500);
        expect(res.text).to.equal(message);
        done(err);
      });
    });
    it('should stop process', function (done) {
      var previousEnv = process.NODE_ENV;
      process.NODE_ENV = 'production';
      var listStub = sinon.stub(forever, 'list');
      var stopStub = sinon.stub(forever, 'stop');
      listStub.callsArgWith(1, null, [{pid: process.pid}]);

      request(server).get('/quit').end(function (err, res) {
        listStub.restore();
        stopStub.restore();
        process.NODE_ENV = previousEnv;
        expect(listStub.calledOnce).to.be.ok;
        expect(stopStub.calledOnce).to.be.ok
        expect(res.status).to.equal(200);
        done(err);
      });
    });
  });
  describe('index()', function () {
    it('should return index page when not found url', function (done) {
      request(server).get('/qwe').end(function (err, res) {
        expect(res.status).to.equal(200);
        expect(res.text).to.be.ok;
        done(err);
      });
    });
  });
});