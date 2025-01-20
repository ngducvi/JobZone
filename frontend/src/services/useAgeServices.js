import api, {  usageApis } from '~/utils/api'; // Import hàm API với xác thực token

const useAgeServices = {
  // Lấy tất cả danh mục
  getAllCategories: async () => {
    try {
      const response = await api.get(usageApis.getAllCategories);
      return response.data; // Trả về danh sách danh mục
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Lấy dữ liệu theo danh mục
  getByCategory: async (category) => {
    try {
      const response = await api.get(usageApis.getByCategory(category));
      return response.data; // Trả về dữ liệu theo danh mục
    } catch (error) {
      console.error(`Error fetching category ${category}:`, error);
      throw error;
    }
  },

  // Tìm kiếm danh mục
  searchCategory: async (query) => {
    try {
      const response = await api.post(usageApis.searchCategory, { query });
      return response.data; // Trả về kết quả tìm kiếm
    } catch (error) {
      console.error('Error searching category:', error);
      throw error;
    }
  },
};

export default useAgeServices;
