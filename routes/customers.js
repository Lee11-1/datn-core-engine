const Router = require('koa-router');
const customerController = require('../controller/customerController');

const router = new Router({
  prefix: '/api/customers'
});

router.post('/', customerController.createCustomer.bind(customerController));
router.get('/', customerController.getCustomers.bind(customerController));
router.get('/:id', customerController.getCustomerById.bind(customerController));
router.put('/:id', customerController.updateCustomer.bind(customerController));
router.delete('/:id', customerController.deleteCustomer.bind(customerController));

router.get('/search/query', customerController.searchCustomers.bind(customerController));
router.get('/zone/:zoneId', customerController.getCustomersByZone.bind(customerController));
router.get('/user/:userId', customerController.getCustomersByUser.bind(customerController));
router.get('/phone/search', customerController.getCustomerByPhone.bind(customerController));
router.get('/email/search', customerController.getCustomerByEmail.bind(customerController));

module.exports = router;
