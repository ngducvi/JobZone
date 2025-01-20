const usageController = require('../controllers/UsageController');
const express = require('express');
const router = express.Router();

router.get('/languages', usageController.getLanguages.bind(usageController));
router.get("/all-voices", usageController.allVoices.bind(usageController));
router.get("/all-models-nlp", usageController.allModelsNLP.bind(usageController));
router.get("/all-models-voice", usageController.allModelsVoice.bind(usageController));
router.get("/all-categories", usageController.allCategories.bind(usageController));
router.get("/by-category/:category", usageController.getByCategory.bind(usageController));
router.get("/search-category", usageController.searchCategory.bind(usageController));
module.exports = router;