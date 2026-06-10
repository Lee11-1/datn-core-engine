const Router = require('koa-router');
const inventoryController = require('../controller/inventoryController');

const router = new Router({ prefix: '/inventory' });

router.get('/', inventoryController.getInventory);

router.put('/:id', inventoryController.updateInventory);

router.delete('/', inventoryController.deleteInventory);

router.post('/reserve', inventoryController.reserveQuantity);

router.post('/', inventoryController.createQuantity);

module.exports = router;
