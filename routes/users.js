var express = require('express');
var router = express.Router();

var user_controller = require('../controllers/userController');

router.get('/sign_up', user_controller.sign_up_get);

router.post('/sign_up', user_controller.sign_up_post);

router.get('/login', user_controller.login_get);

router.post('/login', user_controller.login_post);

module.exports = router;
