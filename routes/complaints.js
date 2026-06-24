const Router = require('koa-router');
const complaintController = require('../controller/complaintController');

const router = new Router({
  prefix: '/api/complaints'
});

router.post('/', complaintController.createComplaint.bind(complaintController));
router.get('/', complaintController.getComplaints.bind(complaintController));
router.put('/status', complaintController.updateComplaintStatus.bind(complaintController));

router.put('/:id', complaintController.updateComplaint.bind(complaintController));
router.delete('/:id', complaintController.deleteComplaint.bind(complaintController));

router.get('/user/:userId', complaintController.getComplaintsByUser.bind(complaintController));
router.get('/customer/:customerId', complaintController.getComplaintsByCustomer.bind(complaintController));
router.get('/order/:orderId', complaintController.getComplaintsByOrder.bind(complaintController));
module.exports = router;
