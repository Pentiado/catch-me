# CatchMe (work in progress)

CatchMe is a simple app inspired by mailcatcher but writen in NodeJS. When working on emails you no longer need to run Ruby!

CatchMe runs a simple SMTP server which catches any message sent to it to display in a web interface. Run CatchMe, set your app to deliver to smtp://127.0.0.1:1025 instead of your default SMTP server, then check out http://127.0.0.1:1080 to see the email that's arrived so far.

## Features

* Catches all mail and stores it for display
* Validate email with campaignmonitor - http://www.campaignmonitor.com/css/ (work in progress)
* Shows HTML, Plain Text and Source version of messages
* Download original email to view in your native mail client
* Command line options to override the default app and stmp port
* Mail appears instantly in your browser via Socket.io
* Runs as a daemon in the background

## How


## Credits
* [Samuel Cochran](https://github.com/sj26), the guy behind [mailcatcher](https://github.com/sj26/mailcatcher) who inspired me to implement a similar solution for the NodeJS world.

## Author

Copyright 2014, [Paweł Wszoła](https://github.com/Pentiado) (wszola.p@gmail.com)