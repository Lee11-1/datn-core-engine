const Router = require('koa-router');
const scheduleController = require('../controller/scheduleController');
const { authorize, authorizeRole } = require('../middleware');

const router = new Router({
  prefix: '/api/schedules'
});

router.post('/', scheduleController.createSchedule.bind(scheduleController));

router.post('/multiple/create', scheduleController.createMultiSchedules.bind(scheduleController));

router.get('/', scheduleController.getSchedules.bind(scheduleController));

router.get('/zone/:zoneId', scheduleController.getSchedulesByZone.bind(scheduleController));

router.get('/user', scheduleController.getSchedulesByUser.bind(scheduleController));

router.get('/:id', scheduleController.getScheduleById.bind(scheduleController));

router.get('/detail/:id', scheduleController.getScheduleDetail.bind(scheduleController));

router.put('/:id', scheduleController.updateSchedule.bind(scheduleController));

router.delete('/:id', scheduleController.deleteSchedule.bind(scheduleController));

module.exports = router;
