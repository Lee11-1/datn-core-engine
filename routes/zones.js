const Router = require('koa-router');
const zoneController = require('../controller/zoneController');

const router = new Router({
  prefix: '/api/zones'
});

router.post('/', zoneController.createZone.bind(zoneController));
router.get('/', zoneController.getZones.bind(zoneController));
router.get('/:id', zoneController.getZoneById.bind(zoneController));
router.put('/:id', zoneController.updateZone.bind(zoneController));
router.delete('/:id', zoneController.deleteZone.bind(zoneController));

router.post('/sync', zoneController.syncZones.bind(zoneController));
module.exports = router;
