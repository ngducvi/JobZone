const usageService  = require('../services/UsageService');
class UsageController {
    constructor() {
    }
    async getLanguages(req, res) {
        try {
            const languages = await usageService.getLanguages();
            res.status(200).json({ languages });
        } catch (error) {
            console.error("Error in getLanguages:", error);
            res.status(500).json({ message: "Không thể lấy ngôn ngữ" });
        }
    }
    async allVoices(req, res) {
        try {
            return res.json({
                voices: await usageService.getVoices()
            });
        } catch (error) {
            console.error('Error retrieving voices:', error);
            res.status(500).json({ message: 'Không thể lấy giọng nói.' });
        }
    }
    async allModelsNLP(req, res) {
        try {
            res.json({models: await usageService.getModelsNLP()});
        } catch (error) {
            console.error('Error retrieving models:', error);
            res.status(500).json({ message: 'Không thể lấy mô hình.' });
        }
    }
    async allModelsVoice(req, res) {
        try {
            res.json({models: await usageService.getModelsVoice()});
        } catch (error) {
            console.error('Error retrieving models:', error);
            res.status(500).json({ message: 'Không thể lấy mô hình.' });
        }
    }
    async allCategories(req, res) {
        try {
            res.json({categories: await usageService.getAllCategories()});
        } catch (error) {
            console.error('Error retrieving categories:', error);
            res.status(500).json({ message: 'Không thể lấy danh mục.' });
        }
    }
    async getByCategory(req, res) {
        try {
            const category = req.params.category;
            res.json({models: await usageService.getByCategory(category)});
        } catch (error) {
            console.error('Error retrieving models:', error);
            res.status(500).json({ message: 'Không thể lấy mô hình.' });
        }
    }
    async searchCategory(req, res) {
        const q = req.query.q;
        try {
            res.json({categories: await usageService.searchCategory(q)});
        } catch (error) {
            console.error('Error retrieving categories:', error);
            res.status(500).json({ message: 'Không thể tìm kiếm danh mục.' });
        }
    }
}
module.exports = new UsageController();