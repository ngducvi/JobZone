const path = require('path');

module.exports = {
  // các cấu hình khác
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'), // Thay 'src' nếu cấu trúc thư mục của bạn khác
    },
  },
};
