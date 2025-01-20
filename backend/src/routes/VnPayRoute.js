const express = require('express');
const jwtMiddleware = require('../middleware/JWTMiddleware');
const vnPayController = require('../controllers/VnPayController');
const router = express.Router();
router.get('/return', vnPayController.verifyVnpayReturn.bind(vnPayController));
router.use(jwtMiddleware(["user", "admin"]));
router.post('/create_payment_url', vnPayController.createPaymentUrl.bind(vnPayController));

module.exports = router;