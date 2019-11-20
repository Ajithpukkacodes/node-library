const mongoose = require('mongoose');

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
  }
},{
  timestamps: true
});

UserSchema.methods.updatesign = function() {
  console.log("dsafdsafsafsa daacsacsdacsac sacs sxcac s swacsw");
};

module.exports = mongoose.model('User', UserSchema);
