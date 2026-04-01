const Router = require('koa-router');
const authController = require('../controller/authController');

const router = new Router({ prefix: '/auth' });

router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

module.exports = router;
