const Router = require('koa-router');
const warehouseController = require('../controller/warehouseController');
const { authorize, authorizeRole } = require('../middleware');

const router = new Router({
  prefix: '/api/warehouses'
});

router.post('/', warehouseController.createWarehouse.bind(warehouseController));

router.post('/bulk/create', warehouseController.bulkCreateWarehouses.bind(warehouseController));

router.get('/search', warehouseController.searchWarehouses.bind(warehouseController));

router.get('/stats/overview', warehouseController.getWarehouseStatistics.bind(warehouseController));

router.get('/', warehouseController.getWarehouses.bind(warehouseController));

router.get('/code/:code', warehouseController.getWarehouseByCode.bind(warehouseController));

router.get('/zone/:zoneId', warehouseController.getWarehousesByZone.bind(warehouseController));

router.get('/manager/:managerId', warehouseController.getWarehousesByManager.bind(warehouseController));

router.get('/:id', warehouseController.getWarehouseById.bind(warehouseController));

router.put('/:id', warehouseController.updateWarehouse.bind(warehouseController));

router.patch('/:id/status', warehouseController.toggleWarehouseStatus.bind(warehouseController));

router.patch('/:id/manager/assign', warehouseController.assignManager.bind(warehouseController));

router.patch('/:id/manager/remove', warehouseController.removeManager.bind(warehouseController));

router.patch('/:id/zone/assign', warehouseController.assignZone.bind(warehouseController));

router.patch('/:id/zone/remove', warehouseController.removeZone.bind(warehouseController));

router.delete('/:id', warehouseController.deleteWarehouse.bind(warehouseController));

module.exports = router;
