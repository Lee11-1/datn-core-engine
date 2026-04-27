const Router = require('koa-router');
const geoDataUpdateController = require('../controller/geoDataUpdateController');

const router = new Router({
  prefix: '/api/geo-data-updates'
});

router.post('/', geoDataUpdateController.createGeoDataUpdate.bind(geoDataUpdateController));
router.get('/', geoDataUpdateController.getGeoDataUpdates.bind(geoDataUpdateController));
router.get('/latest', geoDataUpdateController.getLatestGeoDataUpdate.bind(geoDataUpdateController));
router.get('/statistics', geoDataUpdateController.getGeoDataUpdateStatistics.bind(geoDataUpdateController));
router.get('/by-source/:source', geoDataUpdateController.getGeoDataUpdatesBySource.bind(geoDataUpdateController));
router.get('/by-status/:status', geoDataUpdateController.getGeoDataUpdatesByStatus.bind(geoDataUpdateController));
router.get('/by-user/:userId', geoDataUpdateController.getGeoDataUpdatesByUser.bind(geoDataUpdateController));
router.get('/:id', geoDataUpdateController.getGeoDataUpdateById.bind(geoDataUpdateController));
router.put('/:id', geoDataUpdateController.updateGeoDataUpdate.bind(geoDataUpdateController));
router.delete('/:id', geoDataUpdateController.deleteGeoDataUpdate.bind(geoDataUpdateController));

module.exports = router;
