var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express my app' });
  res.redirect('/catalog'); //redirects to new index page (catalog)
});

module.exports = router;
