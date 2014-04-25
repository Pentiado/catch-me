'use strict';

var gulp = require('gulp');
var nodemailer = require('nodemailer');
var smtpTransport = nodemailer.createTransport('SMTP',{
  host: '127.0.0.1',
  port: 1025
});

var mailOptions = {
  from: 'Pawel Wszola ✔ <wszola.p@gmail.com>', // sender address
  to: 'wszola.p@gmail.com', // list of receivers
  subject: 'Hello ✔', // Subject line
  text: 'Hello world ✔', // plaintext body
  html: '<b>Hello world ✔</b>' // html body
};

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

gulp.task('email', function(){
  sendEmail();
});

// 