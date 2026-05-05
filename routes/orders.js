const Router = require('koa-router');
const orderController = require('../controller/orderController');
const { authorize, authorizeRole } = require('../middleware');

const router = new Router({
  prefix: '/api/orders'
});

// Create a new order
router.post('/', orderController.createOrder.bind(orderController));

// Get all orders with filters
router.get('/', orderController.getOrders.bind(orderController));

// Get orders by schedule
router.get('/schedule/:scheduleId', orderController.getOrdersBySchedule.bind(orderController));

// Get orders by session
router.get('/session/:sessionId', orderController.getOrdersBySession.bind(orderController));

// Get orders by user (with optional scheduleId)
router.get('/user/:userId', orderController.getOrdersByUser.bind(orderController));

router.get('/:orderId', orderController.getOrderDetail.bind(orderController));

// Update order status
router.patch('/:orderId/status', orderController.updateOrderStatus.bind(orderController));

module.exports = router;
