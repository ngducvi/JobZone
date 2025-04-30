const { logger } = require("sequelize/lib/utils/logger");
const Bot = require("../models/Bot"); 
class UsageService {
  constructor() {
    this.languages = [
      { language: "Albanian", country: "Albania" },
      { language: "Arabic", country: "Arab World" },
      { language: "Armenian", country: "Armenia" },
      { language: "Awadhi", country: "India" },
      { language: "Azerbaijani", country: "Azerbaijan" },
      { language: "Bashkir", country: "Russia" },
      { language: "Basque", country: "Spain" },
      { language: "Belarusian", country: "Belarus" },
      { language: "Bengali", country: "Bangladesh" },
      { language: "Bhojpuri", country: "India" },
      { language: "Bosnian", country: "Bosnia and Herzegovina" },
      { language: "Brazilian Portuguese", country: "Brazil" },
      { language: "Bulgarian", country: "Bulgaria" },
      { language: "Cantonese (Yue)", country: "China" },
      { language: "Catalan", country: "Spain" },
      { language: "Chhattisgarhi", country: "India" },
      { language: "Chinese", country: "China" },
      { language: "Croatian", country: "Croatia" },
      { language: "Czech", country: "Czech Republic" },
      { language: "Danish", country: "Denmark" },
      { language: "Dogri", country: "India" },
      { language: "Dutch", country: "Netherlands" },
      { language: "English", country: "United Kingdom" },
      { language: "Estonian", country: "Estonia" },
      { language: "Faroese", country: "Faroe Islands" },
      { language: "Finnish", country: "Finland" },
      { language: "French", country: "France" },
      { language: "Galician", country: "Spain" },
      { language: "Georgian", country: "Georgia" },
      { language: "German", country: "Germany" },
      { language: "Greek", country: "Greece" },
      { language: "Gujarati", country: "India" },
      { language: "Haryanvi", country: "India" },
      { language: "Hindi", country: "India" },
      { language: "Hungarian", country: "Hungary" },
      { language: "Indonesian", country: "Indonesia" },
      { language: "Irish", country: "Ireland" },
      { language: "Italian", country: "Italy" },
      { language: "Japanese", country: "Japan" },
      { language: "Javanese", country: "Indonesia" },
      { language: "Kannada", country: "India" },
      { language: "Kashmiri", country: "India" },
      { language: "Kazakh", country: "Kazakhstan" },
      { language: "Konkani", country: "India" },
      { language: "Korean", country: "South Korea" },
      { language: "Kyrgyz", country: "Kyrgyzstan" },
      { language: "Latvian", country: "Latvia" },
      { language: "Lithuanian", country: "Lithuania" },
      { language: "Macedonian", country: "North Macedonia" },
      { language: "Maithili", country: "India" },
      { language: "Malay", country: "Malaysia" },
      { language: "Maltese", country: "Malta" },
      { language: "Mandarin", country: "China" },
      { language: "Mandarin Chinese", country: "China" },
      { language: "Marathi", country: "India" },
      { language: "Marwari", country: "India" },
      { language: "Min Nan", country: "China" },
      { language: "Moldovan", country: "Moldova" },
      { language: "Mongolian", country: "Mongolia" },
      { language: "Montenegrin", country: "Montenegro" },
      { language: "Nepali", country: "Nepal" },
      { language: "Norwegian", country: "Norway" },
      { language: "Oriya", country: "India" },
      { language: "Pashto", country: "Afghanistan" },
      { language: "Persian (Farsi)", country: "Iran" },
      { language: "Polish", country: "Poland" },
      { language: "Portuguese", country: "Portugal" },
      { language: "Punjabi", country: "India" },
      { language: "Rajasthani", country: "India" },
      { language: "Romanian", country: "Romania" },
      { language: "Russian", country: "Russia" },
      { language: "Sanskrit", country: "India" },
      { language: "Santali", country: "India" },
      { language: "Serbian", country: "Serbia" },
      { language: "Sindhi", country: "Pakistan" },
      { language: "Sinhala", country: "Sri Lanka" },
      { language: "Slovak", country: "Slovakia" },
      { language: "Slovene", country: "Slovenia" },
      { language: "Slovenian", country: "Slovenia" },
      { language: "Ukrainian", country: "Ukraine" },
      { language: "Urdu", country: "Pakistan" },
      { language: "Uzbek", country: "Uzbekistan" },
      { language: "Vietnamese", country: "Vietnam" },
      { language: "Welsh", country: "Wales" },
      { language: "Wu", country: "China" },
    ];
    this.voices = [
      {
        name: "alloy",
        url: "https://cdn.openai.com/API/docs/audio/alloy.wav",
      },
      {
        name: "echo",
        url: "https://cdn.openai.com/API/docs/audio/echo.wav",
      },
      {
        name: "fable",
        url: "https://cdn.openai.com/API/docs/audio/fable.wav",
      },
      {
        name: "onyx",
        url: "https://cdn.openai.com/API/docs/audio/onyx.wav",
      },
      {
        name: "nova",
        url: "https://cdn.openai.com/API/docs/audio/nova.wav",
      },
      {
        name: "shimmer",
        url: "https://cdn.openai.com/API/docs/audio/shimmer.wav",
      },
    ];
    this.modelsNLP = ["gpt-4o-mini", "gpt-4o"];
    this.modelsVoice = ["tts-1", "tts-1-hd"];
    this.categories = [
      {
        title: "Tạo bài SEO",
        slug: "tao-bai-seo",
        icon: "fa-solid fa-chart-line",
        category: ["Common", "Content"],
        type: "green",
      },
      {
        title: "Dịch mọi ngôn ngữ",
        slug: "dich-moi-ngon-ngu",
        icon: "fa-solid fa-language",
        category: ["Common", "Content"],
        type: "green",
      },
      {
        title: "Viết lại theo bài mẫu",
        slug: "viet-lai-theo-bai-mau",
        icon: "fa-solid fa-copy",
        category: ["Common", "Content"],
        type: "green",
      },
      {
        title: "Tạo bài sản phẩm/dịch vụ với GPT 4o",
        slug: "tao-bai-san-pham-gpt-4o",
        icon: "fa-solid fa-robot",
        category: ["Common", "Website"],
        type: "dark",
        // type: "primary",
      },
      {
        title: "Bài giới thiệu trên website",
        slug: "bai-gioi-thieu-tren-website",
        icon: "fa-regular fa-file-lines",
        category: ["Common", "Website"],
        type: "dark",
        // type: "primary",
      },
      {
        title: "Xử lý ảnh",
        slug: "xu-ly-anh",
        icon: "fa-regular fa-file-lines",
        category: ["Common", "Marketing"],
        type: "blue",
      },
      {
        title: "Viết nội dung landing page",
        slug: "viet-noi-dung-landing-page",
        icon: "fa-solid fa-laptop-code",
        category: ["Common", "Marketing"],
        type: "blue",
      },

      {
        title: "Facebook - Viết bài đăng chia sẻ",
        slug: "facebook-viet-bai-dang-chia-se",
        icon: "fa-solid fa-feather",
        category: ["Common", "Social"],
        type: "primary",
      },
      {
        title: "Facebook - Viết bài đăng bán",
        slug: "facebook-viet-bai-dang-ban",
        icon: "fa-solid fa-feather-pointed",
        category: ["Common", "Social"],
        type: "primary",
      },
      {
        title: "Kịch bản livestream đơn giản",
        slug: "kich-ban-livestream-don-gian",
        icon: "fa-solid fa-broadcast-tower",
        category: ["Common", "Marketing"],
        type: "blue",
      },
      {
        title: "Viết kịch bản video ngắn",
        slug: "viet-kich-ban-video-ngan",
        icon: "fa-solid fa-video",
        category: ["Common", "Video"],
        type: "red",
      },
      {
        title: "Tạo bài đăng Facebook từ brief",
        slug: "tao-bai-dang-facebook-tu-brief",
        icon: "fa-solid fa-pen-to-square",
        category: ["Content"],
        type: "green",
      },
      {
        title: "Viết lại",
        slug: "viet-lai",
        icon: "fa-solid fa-edit",
        category: ["Content"],
        type: "green",
      },
      {
        title: "SEO Homepage",
        slug: "seo-homepage",
        icon: "fa-solid fa-house-laptop",
        category: ["Common", "Website"],
        type: "dark",
      },
      {
        title: "SEO Menu",
        slug: "seo-menu",
        icon: "fa-solid fa-cube",
        category: ["Common", "Website"],
        type: "dark",
      },
      {
        title: "Tạo prompt vẽ từ ý tưởng",
        slug: "tao-prompt-ve-tu-y-tuong",
        icon: "fa-solid fa-lightbulb",
        category: ["Marketing"],
        type: "blue",
      },
      {
        title: "Sáng tạo hình sản phẩm",
        slug: "sang-tao-hinh-san-pham",
        icon: "fa-solid fa-camera",
        category: ["Marketing"],
        type: "blue",
      },
      {
        title: "Tạo prompt vẽ từ ảnh mẫu",
        slug: "tao-prompt-ve-tu-anh-mau",
        icon: "fa-solid fa-file-image",
        category: ["Marketing"],
        type: "blue",
      },
      {
        title: "Sửa ảnh theo yêu cầu",
        slug: "sua-anh-theo-yeu-cau",
        icon: "fa-solid fa-scissors",
        category: ["Marketing"],
        type: "blue",
      },
      {
        title: "Sáng tạo hình minh hoạ bài viết",
        slug: "sang-tao-hinh-minh-hoa-bai-viet",
        icon: "fa-solid fa-image",
        category: ["Marketing"],
        type: "blue",
      },

      {
        title: "Facebook - Viết bài đăng đa dạng",
        slug: "facebook-viet-bai-dang-da-dang",
        icon: "fa-brands fa-facebook",
        category: ["Social"],
        type: "primary",
      },
      {
        title: "Viết mô tả video Youtube chuẩn SEO",
        slug: "viet-mo-ta-video-youtube-chuan-seo",
        icon: "fa-brands fa-youtube",
        category: ["Video"],
        type: "red",
      },
    ];
  }

  async getLanguages() {
    const languages = this.languages.map((lang) => lang.language);
    return languages;
  }
  async getVoices() {
    return this.voices;
  }
  async getVoices() {
    return this.voices;
  }
  async getModelsNLP() {
    const models = await Bot.findAll({
      attributes: ['name', 'id'],
      where: {
        feature: 'text'
      }
    });
    return models;
  }
  async getModelsVoice() {
    const models = await Bot.findAll({
      attributes: ['name', 'id'],
      where: {
        feature: 'audio'
      }
    });
    return models;
  }
  async getAllCategories() {
    return this.categories;
  }
  async getByCategory(category) {
    const result = this.categories.filter((item) =>
      item.category.includes(category)
    );
    return result;
  }
  async searchCategory(keyword) {
    const result = this.categories.filter((item) =>
      item.title.toLowerCase().includes(keyword.toLowerCase())
    );
    return result;
  }
}
module.exports = new UsageService();
