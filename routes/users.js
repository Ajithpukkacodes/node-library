var express = require('express');
var router = express.Router();
var  authentication = require('../lib/authentication');

var user_controller = require('../controllers/userController');

router.get('/sign_up', user_controller.sign_up_get);

router.post('/sign_up', user_controller.sign_up_post);

router.get('/login', user_controller.login_get);

router.post('/login', user_controller.login_post);

router.get('/forgot', user_controller.forgot_password_get);

router.post('/forgot', user_controller.forgot_password_post);

router.get('/reset/:token', user_controller.reset_password_get );

router.post('/reset/:token', user_controller.reset_password_post );

router.get('/logout', user_controller.logout);

router.get('/facebook_login', user_controller.facebook_login );

router.get('/auth/facebook/callback', user_controller.facebook_callback);

router.get('/:id/edit', authentication.authenticate, user_controller.user_update_get );

router.post('/:id/edit', authentication.authenticate, user_controller.user_update_post );

router.get('/:id', authentication.authenticate, user_controller.user_show );


module.exports = router;
