var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy, FacebookStrategy = require('passport-facebook').Strategy;
  const User = require('../models/user');
  // const config = require('../config/database');
  const bcrypt = require('bcryptjs');


  module.exports = function(passport){
    // Local Strategy
    passport.use(new LocalStrategy(function(username, password, done){
      // Match Username
      let query = {user_name:username};
      User.findOne(query, function(err, user){
        if(err) throw err;
        if(!user){
          return done(null, false, {message: 'No user found'});
        }

        // Match Password
        bcrypt.compare(password, user.password, function(err, isMatch){
          if(err) throw err;
          if(isMatch){
            User.findById(user._id, function (err , user) {
              if(err) throw err;
              let a = user.sign_in_count == null ? 0 : user.sign_in_count;
              user.sign_in_count = a +=1;
              console.log(user.sign_in_count);
              user.updatesign();
              user.save(function (err) {
                if(err) throw err;
                return done(null, user);
              });
            });
          } else {
            return done(null, false, {message: 'Wrong password'});
          }
        });
      });
    }));

    passport.use(new FacebookStrategy({
    clientID: process.env.FCLIENTID,
    clientSecret: process.env.FCLIENTSECRET,
    callbackURL: process.env.FCALLBACK
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOne({email: profile.id}, function(err, user) {
        if (err) { return done(err); }
        console.log(profile);
        if (user) {
          done(null, user);
        }
        else {
          console.log(profile);
          var newUser = new User({
            email: profile.id,
            facebook_uid: profile.id,
            user_name: profile.displayName
          });
          newUser.save(function(err){
	    					if(err) throw err;
	    					return done(null, newUser);
	    				})
        }
      });
    }
  ));

    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
      User.findById(id, function(err, user) {
        done(err, user);
      });
    });
  }
