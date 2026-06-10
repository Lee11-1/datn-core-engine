const Router = require('koa-router');
const warehouseController = require('../controller/warehouseController');
const { authorize, authorizeRole } = require('../middleware');

const router = new Router({
  prefix: '/api/warehouses'
});

router.post('/', warehouseController.createWarehouse.bind(warehouseController));

router.get('/', warehouseController.getWarehouses.bind(warehouseController));

router.put('/:id', warehouseController.updateWarehouse.bind(warehouseController));

router.delete('/:id', warehouseController.deleteWarehouse.bind(warehouseController));

module.exports = router;
