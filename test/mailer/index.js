'use strict';

var server = require('../../server.js');
var request = require('supertest');
var expect = require('chai').expect;
var sinon = require('sinon');
var mailer = require('../../lib/mailer/');
var nodemailer = require('nodemailer');
var fs = require('fs');
var emailHTML = fs.readFileSync(__dirname + '/../email_example.html');
var smtpTransport = nodemailer.createTransport('SMTP',{
  host: '127.0.0.1',
  port: 1025
});

describe('mailer index', function() {
  it('should catch email', function(done) {
    var mailOptions = {
      from: 'Pawel Wszola ✔ <wszola.p@gmail.com>',
      to: 'wszola.p@gmail.com',
      subject: 'Hello ✔',
      text: 'Hello world ✔',
      html: emailHTML
    };
    smtpTransport.sendMail(mailOptions, function (err, response) {
      expect(response.messageId).to.be.ok;
      done(err);
    });
  });
});