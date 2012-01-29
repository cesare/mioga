var express    = require('express');
var everyauth  = require('everyauth');
var mioga      = require('./mioga')[app.settings.env];

everyauth.twitter
  .consumerKey(mioga.twitter.consumerKey)
  .consumerSecret(mioga.twitter.consumerSecret)
  .findOrCreateUser( function (session, accessToken, accessTokenSecret, twitterUserMetadata) {
	  return {name: "dummy"};
  })
  .entryPath('/auth/twitter')
  .redirectPath('/');

app.configure(function(){
    var cwd = process.cwd();
    app.use(express.static(cwd + '/public', {maxAge: 86400000}));
    app.set('views', cwd + '/app/views');
    app.set('view engine', 'ejs');
    app.set('jsDirectory', '/javascripts/');
    app.set('cssDirectory', '/stylesheets/');
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({secret: 'secret'}));
    app.use(express.methodOverride());
    app.use(everyauth.middleware());
    app.use(app.router);
});

everyauth.helpExpress(app);
