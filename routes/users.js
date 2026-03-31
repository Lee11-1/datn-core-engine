const Router = require('koa-router');
const userController = require('../controller/userController');

const router = new Router({
  prefix: '/api/users'
});

router.post('/', userController.createUser.bind(userController));

router.get('/', userController.getUsers.bind(userController));

router.get('/:id', userController.getUserById.bind(userController));

router.put('/:id', userController.updateUser.bind(userController));

router.delete('/:id', userController.deleteUser.bind(userController));

module.exports = router;
