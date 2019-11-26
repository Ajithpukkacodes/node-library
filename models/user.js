const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

var Schema = mongoose.Schema;

var UserSchema = new Schema ({
  user_name: {
    type: String,
  },
  email:{
    type: String,
    required: true
  },
  password:{
    type: String
  },
  sign_in_count:{
    type: Number
  },
  facebook_uid:{
    type: String
  },
  avatar:{
    type: String
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
},{
  timestamps: true
});

UserSchema.methods.updatesign = function() {
  console.log("dsafdsafsafsa daacsacsdacsac sacs sxcac s swacsw");
};

UserSchema.pre('save', function save(next) {
  console.log("callback");
  var user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

//virtual url

UserSchema.virtual('url')
.get(function(){
  return '/users/' + this._id;
});


module.exports = mongoose.model('User', UserSchema);
