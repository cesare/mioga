express    = require 'express';
everyauth  = require 'everyauth';
connect    = require 'connect';
RedisStore = (require 'connect-redis')(connect);

mioga = (require './mioga')[app.settings.env];

everyauth.everymodule.findUserById (userId, callback) ->
  User.find(userId, callback)

everyauth.twitter
  .consumerKey(mioga.twitter.consumerKey)
  .consumerSecret(mioga.twitter.consumerSecret)
  .findOrCreateUser (session, accessToken, accessTokenSecret, twitterUserMetadata) ->
    promise = new everyauth.Promise();
    promise.callback (user) ->
      return user;
    
    User.all { where: {provider: "twitter", providerUid: twitterUserMetadata.id_str}}, (err, data) ->
      if err
        promise.fail("finding user failed: " + err)
        return
      
      if data != null && data.length > 0
        promise.fulfill(data[0])
        return
      
      user = new User({provider: "twitter", "providerUid": twitterUserMetadata.id_str, "name": twitterUserMetadata.name});
      user.save (err) ->
        if err
          promise.fail("Failed to save new user: " + err)
          return
        
        promise.fulfill(user);
    
    return promise;
  
  .entryPath('/auth/twitter')
  .redirectPath('/');


app.configure ->
  cwd = process.cwd();
  app.use(express.static(cwd + '/public', {maxAge: 86400000}))
  app.set('views', cwd + '/app/views')
  app.set('view engine', 'ejs')
  app.set('jsDirectory', '/javascripts/')
  app.set('cssDirectory', '/stylesheets/')
  app.use(express.bodyParser())
  app.use(express.cookieParser())
  app.use(express.session({ secret: 'secret', store: new RedisStore }))
  app.use(express.methodOverride())
  app.use(everyauth.middleware())
  app.use(app.router)


everyauth.helpExpress(app);
