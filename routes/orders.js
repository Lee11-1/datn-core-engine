const Router = require('koa-router');
const orderController = require('../controller/orderController');
const { authorize, authorizeRole } = require('../middleware');

const router = new Router({
  prefix: '/api/orders'
});

router.post('/', orderController.createOrder.bind(orderController));

router.get('/', orderController.getOrders.bind(orderController));

router.get('/schedule/:scheduleId', orderController.getOrdersBySchedule.bind(orderController));

router.get('/session/:sessionId', orderController.getOrdersBySession.bind(orderController));

router.get('/user/:userId', orderController.getOrdersByUser.bind(orderController));

router.get('/:orderId', orderController.getOrderDetail.bind(orderController));

router.patch('/:orderId/status', orderController.updateOrderStatus.bind(orderController));

module.exports = router;
