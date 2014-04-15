'use strict';

var simplesmtp = require('simplesmtp');

var smtp = simplesmtp.createServer();
smtp.listen(1025, function(err){
  if(!err){
    console.log('SMTP server listening on port 1025');
  }else{
    console.log(err.message);
  }
});

exports = module.exports = smtp;