const Router = require('koa-router');
const zoneController = require('../controller/zoneController');

const router = new Router({
  prefix: '/api/zones'
});

router.post('/', zoneController.createZone.bind(zoneController));
router.get('/', zoneController.getZones.bind(zoneController));
router.get('/tree', zoneController.getZoneTree.bind(zoneController));
router.get('/by-code/:code', zoneController.getZoneByCode.bind(zoneController));
router.get('/by-level/:level', zoneController.getZonesByLevel.bind(zoneController));
router.get('/:id', zoneController.getZoneById.bind(zoneController));
router.put('/:id', zoneController.updateZone.bind(zoneController));
router.delete('/:id', zoneController.deleteZone.bind(zoneController));

router.get('/:parentId/children', zoneController.getChildZones.bind(zoneController));
router.patch('/:id/activate', zoneController.activateZone.bind(zoneController));
router.patch('/:id/deactivate', zoneController.deactivateZone.bind(zoneController));
router.post('/sync', zoneController.syncZones.bind(zoneController));

module.exports = router;
