const Router = require('koa-router');
const LogController = require('../controller/logController');

const router = new Router({
  prefix: '/logs'
});

// Create log
router.post('/', LogController.createLog);

// Get all logs with filters
router.get('/', LogController.getLogs);

// Get logs by entity
router.get('/entity/:entityType/:entityId', LogController.getLogsByEntity);

// Get log by ID
router.get('/:id', LogController.getLogById);

module.exports = router;
