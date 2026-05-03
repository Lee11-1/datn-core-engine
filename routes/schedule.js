const Router = require('koa-router');
const scheduleController = require('../controller/scheduleController');
const { authorize, authorizeRole } = require('../middleware');

const router = new Router({
  prefix: '/api/schedules'
});

// Create a new schedule
router.post('/', scheduleController.createSchedule.bind(scheduleController));

router.post('/multiple/create', scheduleController.createMultiSchedules.bind(scheduleController));

// Get all schedules with filters
router.get('/', scheduleController.getSchedules.bind(scheduleController));

// Get schedule statistics
router.get('/stats/overview', scheduleController.getStatistics.bind(scheduleController));

// Get schedules by date
router.get('/date/:date', scheduleController.getSchedulesByDate.bind(scheduleController));

// Get schedules by zone
router.get('/zone/:zoneId', scheduleController.getSchedulesByZone.bind(scheduleController));

// Get schedules by user
router.get('/user', scheduleController.getSchedulesByUser.bind(scheduleController));

// Get schedule by ID
router.get('/:id', scheduleController.getScheduleById.bind(scheduleController));

// Update schedule
router.put('/:id', scheduleController.updateSchedule.bind(scheduleController));

// Change schedule status
router.patch('/:id/status', scheduleController.changeScheduleStatus.bind(scheduleController));

// Assign schedule to warehouse
router.patch('/:id/warehouse', scheduleController.assignScheduleToWarehouse.bind(scheduleController));

// Delete schedule
router.delete('/:id', scheduleController.deleteSchedule.bind(scheduleController));

module.exports = router;
