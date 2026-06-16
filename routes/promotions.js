const Router = require('koa-router');
const promotionController = require('../controller/promotionController');

const router = new Router({
  prefix: '/api/promotions'
});

router.post('/', promotionController.createPromotion.bind(promotionController));
router.get('/', promotionController.getPromotions.bind(promotionController));
router.get('/active', promotionController.getActivePromotions.bind(promotionController));
router.get('/zone/:zoneId', promotionController.getPromotionsByZone.bind(promotionController));
router.get('/:id', promotionController.getPromotionById.bind(promotionController));
router.put('/:id', promotionController.updatePromotion.bind(promotionController));
router.delete('/:id', promotionController.deletePromotion.bind(promotionController));
router.patch('/:id/status', promotionController.updateStatus.bind(promotionController));

module.exports = router;
