const Router = require('koa-router');
const inventoryController = require('../controller/inventoryController');

const router = new Router({ prefix: '/inventory' });

router.get('/', inventoryController.getInventory);

router.get('/:id', inventoryController.getInventoryById);

router.put('/:id', inventoryController.updateInventory);

router.delete('/', inventoryController.deleteInventory);

router.post('/check-availability', inventoryController.checkAvailableQuantity);

router.post('/reserve', inventoryController.reserveQuantity);

router.post('/deduct', inventoryController.deductQuantity);

router.post('/', inventoryController.createQuantity);

router.post('/release', inventoryController.releaseReservedQuantity);

router.post('/transfer', inventoryController.transferInventory);

router.get('/history/movements', inventoryController.getMovementHistory);

router.get('/low-stock', inventoryController.getLowStockProducts);

router.get('/warehouse/:warehouseId/summary', inventoryController.getWarehouseSummary);

module.exports = router;
