const Router = require('koa-router');
const productController = require('../controller/productControllers');

const router = new Router({
  prefix: '/api/products'
});

router.post('/', productController.createProduct.bind(productController));
router.get('/', productController.getProducts.bind(productController));
router.get('/inventory', productController.getProductsInventory.bind(productController));
router.get('/:id', productController.getProductById.bind(productController));
router.put('/:id', productController.updateProduct.bind(productController));
router.delete('/:id', productController.deleteProduct.bind(productController));

router.patch('/:id/activate', productController.activateProduct.bind(productController));
router.patch('/:id/deactivate', productController.deactivateProduct.bind(productController));

module.exports = router;
