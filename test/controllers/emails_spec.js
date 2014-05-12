'use strict';

var server = require('../../server.js');
var request = require('supertest');
var expect = require('chai').expect;
var sinon = require('sinon');

describe('emails controller', function() {
  describe('emails.details', function() {
    it('should return 500 when db error', function(done) {
      var dbStub = sinon.stub(db, 'find');
      var message = 'Error';
      dbStub.callsArgWith(1, message);
      request(server).get('/emails/123').end(function (err, res) {
        dbStub.restore();
        expect(res.status).to.equal(500);
        expect(res.text).to.equal(message);
        done(err);
      });
    });
    it('should return 404 when email not found', function(done) {
      request(server).get('/emails/111').end(function (err, res) {
        expect(res.status).to.equal(404);
        done(err);
      });
    });
    it('should return email html when found', function (done) {
      var html = '<div>works</div>';
      db.insert({html: html}, function (err, newDoc) {
        expect(err).to.be.not.ok;
        request(server).get('/emails/' + newDoc._id).end(function (err, res) {
          expect(res.status).to.equal(200);
          expect(res.text).to.equal(html);
          done(err);
        });
      });
    });
  });
  describe('emails.download', function() {
    it('should return 500 when db error', function(done) {
      var dbStub = sinon.stub(db, 'find');
      var message = 'Error';
      dbStub.callsArgWith(1, message);
      request(server).get('/emails/123/download').end(function (err, res) {
        dbStub.restore();
        expect(res.status).to.equal(500);
        expect(res.text).to.equal(message);
        done(err);
      });
    });
    it('should return 404 when email not found', function(done) {
      request(server).get('/emails/111').end(function (err, res) {
        expect(res.status).to.equal(404);
        done(err);
      });
    });
    it('should return email html for download', function (done) {
      var html = '<div>works</div>';
      db.insert({html: html}, function (err, newDoc) {
        expect(err).to.be.not.ok;
        request(server).get('/emails/' + newDoc._id + '/download').end(function (err, res) {
          expect(res.status).to.equal(200);
          expect(res.type).to.equal('application/octet-stream');
          done(err);
        });
      });
    });
  });
});