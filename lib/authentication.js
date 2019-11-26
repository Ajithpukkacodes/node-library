

// Access Control
exports.authenticate = function(req, res, next){
  if(req.isAuthenticated()){
    console.log('dsd');
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
};
