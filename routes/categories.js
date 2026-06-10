const Router = require('koa-router');
const categoryController = require('../controller/categoryController');

const router = new Router({
  prefix: '/api/categories'
});

// CRUD operations
router.post('/', categoryController.createCategory.bind(categoryController));
router.get('/', categoryController.getCategories.bind(categoryController));
router.put('/:id', categoryController.updateCategory.bind(categoryController));
router.delete('/:id', categoryController.deleteCategory.bind(categoryController));

module.exports = router;
