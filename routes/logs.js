const Router = require('koa-router');
const LogController = require('../controller/logController');

const router = new Router({
  prefix: '/logs'
});

router.post('/', LogController.createLog);

router.get('/', LogController.getLogs);

router.get('/entity/:entityType/:entityId', LogController.getLogsByEntity);

router.get('/:id', LogController.getLogById);

module.exports = router;
