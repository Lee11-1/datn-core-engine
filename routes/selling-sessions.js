const Router = require('koa-router');
const sellingSessionController = require('../controller/sellingSessionController');
const { authorize, authorizeRole } = require('../middleware');

const router = new Router({
  prefix: '/api/selling-sessions'
});

// Create a new selling session (check-in)
router.post('/', sellingSessionController.createSellingSession.bind(sellingSessionController));

// Get selling sessions by schedule
router.get('/schedule/:scheduleId', sellingSessionController.getSellingSessionsBySchedule.bind(sellingSessionController));

// Get selling sessions by customer
router.get('/customer/:customerId', sellingSessionController.getSellingSessionsByCustomer.bind(sellingSessionController));

// Get selling session detail
router.get('/:sessionId', sellingSessionController.getSellingSessionDetail.bind(sellingSessionController));

// Checkout selling session
router.patch('/:sessionId/checkout', sellingSessionController.checkoutSellingSession.bind(sellingSessionController));

// Cancel selling session
router.patch('/:sessionId/cancel', sellingSessionController.cancelSellingSession.bind(sellingSessionController));

module.exports = router;
