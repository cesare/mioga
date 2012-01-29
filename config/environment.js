var express    = require('express');
var everyauth  = require('everyauth');
var connect = require('connect');
var RedisStore = require('connect-redis')(connect);

var mioga      = require('./mioga')[app.settings.env];
var util = require("util");

everyauth.everymodule.findUserById(function (userId, callback) {
  User.find(userId, callback);
});

everyauth.twitter
  .consumerKey(mioga.twitter.consumerKey)
  .consumerSecret(mioga.twitter.consumerSecret)
  .findOrCreateUser( function (session, accessToken, accessTokenSecret, twitterUserMetadata) {
	  console.log(twitterUserMetadata);
	  var promise = new everyauth.Promise();
	  promise.callback(function(user) {
      console.log("returning user: " + util.inspect(user));
		  return user;
	  });
	  User.all({ where: {provider: "twitter", providerUid: twitterUserMetadata.id_str}}, function(err, data) {
		  if (err) {
        promise.fail("finding user failed: " + err);
        return;
		  }
      if (data != null && data.length > 0) {
  		  promise.fulfill(data[0]);
        return;
      }
      var user = new User({provider: "twitter", "providerUid": twitterUserMetadata.id_str, "name": twitterUserMetadata.name});
      user.save(function(err) {
        if (err) {
          promise.fail("Failed to save new user: " + err);
          return;
        }
        promise.fulfill(user);
      });
	  });
	  return promise;
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
    app.use(express.session({ secret: 'secret', store: new RedisStore }));
    app.use(express.methodOverride());
    app.use(everyauth.middleware());
    app.use(app.router);
});

everyauth.helpExpress(app);
