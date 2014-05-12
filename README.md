# CatchMe [ ![Codeship Status for Pentiado/email-guide](https://www.codeship.io/projects/2a8b9360-ba90-0131-330f-0aa8124e7323/status?branch=master)](https://www.codeship.io/projects/20908) [![Coverage Status](https://coveralls.io/repos/Pentiado/email-guide/badge.png?branch=master)](https://coveralls.io/r/Pentiado/email-guide?branch=master)

> CatchMe runs a simple SMTP server which catches any message sent to it to display in a web interface. Run CatchMe, set your app to deliver to smtp://127.0.0.1:1025, then check out http://127.0.0.1:1080 to see the emails that arrived so far.

## Features

* Catches all mail and stores it for display
* Validate email with campaignmonitor - http://www.campaignmonitor.com/css/
* Download original email to view in your native mail client
* Command line options to override the default app and stmp port
* Email appears instantly in your browser via Socket.io
* Runs as a daemon in the background

## How

## Testing

Running `npm test` will run the unit tests with mocha.

## Credits
* [Samuel Cochran](https://github.com/sj26), the guy behind [mailcatcher](https://github.com/sj26/mailcatcher) who inspired me to implement a similar solution for the NodeJS world.

## Author

Copyright 2014, [Paweł Wszoła](https://github.com/Pentiado) (wszola.p@gmail.com)