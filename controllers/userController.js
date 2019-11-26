const Author = require('../models/author');
const Book = require('../models/book');
const User = require('../models/user');
const passport = require('passport');
var path = require('path');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
const mail = require('../lib/smtp-nodemailer');
const fs = require('fs-extra');
const sharp = require('sharp');
const multer = require('multer');

var BookInstance = require('../models/bookinstance');
const async = require('async');
const validator = require('express-validator');
const bcrypt = require('bcryptjs');

// Set The Storage Engine
const storage = multer.diskStorage({
  destination:(req, file, callback) => {
      let userId = req.user._id;
      let path = `./public/uploads/users/${userId}`;
      fs.mkdirsSync(path);
      callback(null, path);
    },
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('avatar');

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

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
   }
 }
];

//login user
exports.login_get = function (req, res, next) {
  res.render('users/login_form',{title: "login form"});
};

exports.login_post = function (req, res, next) {
  passport.authenticate('local', { successRedirect: '/catalog',
                                   failureRedirect: '/users/login',
                                   failureFlash: true })(req, res, next);
  // res.send('sdsadsdsad');
};

exports.facebook_login = function (req, res, next) {
  passport.authenticate('facebook')(req,res,next);
};
// app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
exports.facebook_callback = function (req,res, next) {
  passport.authenticate('facebook', { successRedirect: '/catalog',
                                        failureRedirect: '/users/login',failureFlash: true })(req, res, next);
};


exports.logout = function (req,res,next) {
  req.logout();
  req.flash('success',"successful logout");
  res.redirect('/users/login');
};

//user profile
exports.user_show = async function (req, res, next) {
  var user = await User.findById(req.params.id);
  res.render('users/user_profile', { title: 'Profile', user: user });

};

//user update get details
exports.user_update_get = async function(req, res, next) {
  // Get book, authors and genres for form.
  try {
    var user = await User.findById(req.params.id);
    if (user != null){
      res.render('users/user_form', { title: 'Update Book', user: user });
    }
  } catch (err) {
    next(err);
  }
};


//users update action
exports.user_update_post = [
  upload,
  validator.body('user_name', 'user name must not be empty.').isLength({ min: 1 }).trim(),
  validator.body('email', 'email is invalid.').isEmail().withMessage("email is blank").isLength({ min: 1 }).trim(),
  validator.body('confirm-password').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    // Indicates the success of this synchronous custom validator
    return true;
  }),
  async (req, res, next) => {
    try{
      var errors = validator.validationResult(req);
      console.log(errors);
      if (!errors.isEmpty()){
        res.render('users/user_form', {title: 'user', user: req.body, errors: errors.array()});
        return;
      }
      else {
        var user = await User.findById(req.params.id);
          user.user_name = req.body.user_name;
          user.email = req.body.email;
          const {filename: image} = req.file
          // user.password = req.body.password if (req.body.password != '');
          if (req.file) {
             var old_avatar = user.avatar;
             user.avatar = req.file.filename;
             await sharp(path.resolve(req.file.path))
             .resize(100)
             .jpeg({quality: 50})
             .toFile(req.file.destination + '/' + "thumb_" + req.file.filename)
          }
          // path.resolve(req.file.destination,'resized', image)
           user.save(function(err){
             if(err){
               console.log(err);
               return;
             } else {
               if (old_avatar){
                 fs.removeSync('./public/uploads/users/'+ user._id + '/' + old_avatar);
                 fs.removeSync('./public/uploads/users/'+ user._id + '/' + 'thumb_' + old_avatar);
               }
               req.flash('success','Profile details updated');
               res.redirect(user.url);
             }
           });
     }
      // res.send(req.body);
  }
  catch(err){
    next(err);
  }
}];

//Forgot password
exports.forgot_password_get = function (req, res, next) {
  res.render('users/forgot_password',{title: "forgot password"});
};

exports.forgot_password_post = async function (req, res, next) {
  try {
    var token = await crypto.randomBytes(20).toString('hex');
    console.log(token);
    var user = await User.findOne({email: req.body.email});
    if (!user)
    {
      req.flash("danger", "Email not found")
      res.redirect('/users/forgot');
    }
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000
    await user.save();
    var mailOptions = {
        to: user.email,
        from: process.env.SUPPORTEMAIL,
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      mail.smtpTransport.sendMail(mailOptions);
    req.flash("Success", "Email has been sent")
    res.redirect('/users/login');
  } catch (err) {
    next (err);
  }
};
