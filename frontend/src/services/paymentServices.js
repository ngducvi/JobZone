import { authAPI, userApis } from '~/utils/api';

const paymentServices = {
    createPayment: async (amount) => {
        try {
            const response = await authAPI().post(userApis.createPaymentUrl, amount);
            return response.data;
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error;
        }
    },
    getPayments: async () => {
        try {
            const response = await authAPI().get(userApis.getPayments);
            return response.data;
        } catch (error) {
            console.error('Error fetching payments:', error);
            throw error;
        }
    },

    checkPaymentStatus: async (orderId) => {
        try {
            const response = await authAPI().get(`${userApis.checkPaymentStatus}?orderId=${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error checking payment status:', error);
            throw error;
        }
    },
    
    updateUserPlan: async () => {
        try {
            const response = await authAPI().get(userApis.checkUserPlan);
            return response.data;
        } catch (error) {
            console.error('Error updating user plan:', error);
            throw error;
        }
    },

    checkAndUpdateTransaction: async (orderId) => {
        try {
            const response = await authAPI().get(`${userApis.checkAndUpdateTransaction}?orderId=${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error checking transaction:', error);
            throw error;
        }
    }
};

export default paymentServices;