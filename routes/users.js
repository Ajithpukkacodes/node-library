var express = require('express');
var router = express.Router();

var user_controller = require('../controllers/userController');

router.get('/sign_up', user_controller.sign_up_get);

router.post('/sign_up', user_controller.sign_up_post);

router.get('/login', user_controller.login_get);

router.post('/login', user_controller.login_post);

router.get('/logout', user_controller.logout);

router.get('/facebook_login', user_controller.facebook_login );

router.get('/auth/facebook/callback', user_controller.facebook_callback);



module.exports = router;
