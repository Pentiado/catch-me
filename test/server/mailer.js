'use strict';

var should = require('should');
var app = require('../../server');
var request = require('supertest');
var nodemailer = require('nodemailer');

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport('SMTP',{
  host: '127.0.0.1',
  port: 1025
});

// setup e-mail data with unicode symbols
var mailOptions = {
  from: 'Pawel Wszola ✔ <wszola.p@gmail.com>', // sender address
  to: 'wszola.p@gmail.com', // list of receivers
  subject: 'Hello ✔', // Subject line
  text: 'Hello world ✔', // plaintext body
  html: '<b>Hello world ✔</b>' // html body
};

// send mail with defined transport object
function sendEmail(cb){
  smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
      console.log(error);
    }else{
      console.log('Message sent: ' + response.message);
    }
    cb();
  });
}

describe('Sending emails', function() {
  it('should send email', function(done) {
    sendEmail(function(){
      done();
    });
  });
});