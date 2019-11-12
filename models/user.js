const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema ({
  user_name: {
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  }
});

module.exports = mongoose.model('User', UserSchema);
