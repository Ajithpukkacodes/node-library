const Author = require('../models/author');
const Book = require('../models/book');
const User = require('../models/user');
const passport = require('passport');

var BookInstance = require('../models/bookinstance');
const async = require('async');
const validator = require('express-validator');
const bcrypt = require('bcryptjs');

// Display list of all Authors.
exports.user_list = function(req, res, next) {

};

//sign_up
exports.sign_up_get = function (req, res, next) {
   res.render('users/sign_up_form',{ title: 'sign up'});
};


//sign_up
exports.sign_up_post = [
  validator.body('user_name', 'user name must not be empty.').isLength({ min: 1 }).trim(),
  validator.body('email', 'email is invalid.').isEmail().withMessage("email is blank").isLength({ min: 1 }).trim(),
  validator.body('password', 'Password must not be empty.').isLength({ min: 1 }).trim(),
  validator.body('confirm-password').custom((value, { req }) => {
  if (value !== req.body.password) {
    throw new Error('Password confirmation does not match password');
  }

  // Indicates the success of this synchronous custom validator
  return true;
}),
validator.sanitizeBody('confirm-password').escape(),
  // res.render('users/sign_up_form',{ title: 'sign up'});
 (req, res, next) => {
   var errors = validator.validationResult(req);

   if (!errors.isEmpty()){
     res.render('users/sign_up_form',{title: 'sign up', user: req.body, errors: errors.array()});
     return;
   }
   else {
     var user = new User({
       email: req.body.email,
       user_name: req.body.user_name,
       password: req.body.password
     });

     // bcryptjs.genSalt(10,function (err, salt) {
     //   bcryptjs.hash(user.password, salt ,function (err, hash) {
     //      if (err) {return next(err); }
     //      user.password = hash;
     //      user.save(function (err) {
     //        if (err) {
     //          console.log("unsuccessfull");
     //          return;
     //         }
     //         else {
     //           req.flash("success", "user created successful");
     //           res.redirect("/users");
     //         }
     //      });
     //   });
     // })
     bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(user.password, salt, function(err, hash){
        if(err){
          console.log(err);
        }
        user.password = hash;
        user.save(function(err){
          if(err){
            console.log(err);
            return;
          } else {
            req.flash('success','You are now registered and can log in');
            res.redirect('login');
          }
        });
      });
    });
     // res.send(req.body);
   }
 }
];

//login user
exports.login_get = function (req, res, next) {
  res.render('users/login_form',{title: "login form"});
};

exports.login_post = function (req, res, next) {
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/users/login',
                                   failureFlash: true })(req, res, next);
  // res.send('sdsadsdsad');
};
