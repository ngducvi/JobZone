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

    
};

export default paymentServices;