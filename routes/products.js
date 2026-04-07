const Router = require('koa-router');
const productController = require('../controller/productControllers');

const router = new Router({
  prefix: '/api/products'
});

router.post('/', productController.createProduct.bind(productController));
router.get('/', productController.getProducts.bind(productController));
router.get('/:id', productController.getProductById.bind(productController));
router.put('/:id', productController.updateProduct.bind(productController));
router.delete('/:id', productController.deleteProduct.bind(productController));

router.post('/search/by-sku', productController.getProductsBySKU.bind(productController));
router.get('/category/:categoryId', productController.getProductsByCategory.bind(productController));
router.get('/search/query', productController.searchProducts.bind(productController));
router.patch('/:id/activate', productController.activateProduct.bind(productController));
router.patch('/:id/deactivate', productController.deactivateProduct.bind(productController));

module.exports = router;
