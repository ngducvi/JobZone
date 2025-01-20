import { authAPI, userApis } from "~/utils/api";

const userServices = { 
  updatePassword: async (data) => {
    try {
      const response = await authAPI().patch(userApis.updatePassword, data);
      return response.data;
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  },

  updateCurrentUser: async (data) => {
    try {
      const response = await authAPI().patch(userApis.updateCurrentUser, data);
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await authAPI().get(userApis.getCurrentUser);

      return response.data;
    } catch (error) {
      console.error("Error getting current user:", error);
      throw error;
    }
  },
};

export default userServices;
