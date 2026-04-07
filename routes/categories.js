const Router = require('koa-router');
const categoryController = require('../controller/categoryController');

const router = new Router({
  prefix: '/api/categories'
});

// CRUD operations
router.post('/', categoryController.createCategory.bind(categoryController));
router.get('/', categoryController.getCategories.bind(categoryController));
router.get('/tree', categoryController.getCategoryTree.bind(categoryController));
router.get('/root', categoryController.getRootCategories.bind(categoryController));
router.get('/:id', categoryController.getCategoryById.bind(categoryController));
router.put('/:id', categoryController.updateCategory.bind(categoryController));
router.delete('/:id', categoryController.deleteCategory.bind(categoryController));

// Additional operations
router.get('/:parentId/children', categoryController.getChildCategories.bind(categoryController));
router.patch('/:id/activate', categoryController.activateCategory.bind(categoryController));
router.patch('/:id/deactivate', categoryController.deactivateCategory.bind(categoryController));
router.patch('/:id/reorder', categoryController.reorderCategories.bind(categoryController));

module.exports = router;
