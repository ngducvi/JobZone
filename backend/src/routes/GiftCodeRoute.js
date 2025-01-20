const giftCodeController = require('../controllers/GiftCodeController');
const express = require('express');
const router = express.Router();
const jwtMiddleware = require('../middleware/JWTMiddleware');
router.use(jwtMiddleware(["user", "admin"]));
router.post('/check-giftcode', giftCodeController.checkGiftCode.bind(giftCodeController));
module.exports = router;