const Router = require('koa-router');
const sellingSessionController = require('../controller/sellingSessionController');
const { authorize, authorizeRole } = require('../middleware');

const router = new Router({
  prefix: '/api/selling-sessions'
});

router.post('/', sellingSessionController.createSellingSession.bind(sellingSessionController));

router.get('/customer/:customerId', sellingSessionController.getSellingSessionsByCustomer.bind(sellingSessionController));

router.get('/:sessionId', sellingSessionController.getSellingSessionDetail.bind(sellingSessionController));

router.patch('/:sessionId/checkout', sellingSessionController.checkoutSellingSession.bind(sellingSessionController));

router.patch('/:sessionId/cancel', sellingSessionController.cancelSellingSession.bind(sellingSessionController));

module.exports = router;
