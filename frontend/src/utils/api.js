import axios from 'axios';

const HOST = process.env.REACT_APP_API_URL;

export const adminApis = {
    sendNotification: '/send-notification',
    getStatistics: (year) => `courses/statistics/yearly/${year}`,

    getAllUsers: '/admin/user/all',
    getAllModels: '/admin/model/all',
    updateModel: (id) => `/admin/model/edit/${id}`,
    getAllPayments: '/admin/transaction/all',
    getAllGiftCodes: '/admin/gift-code/all',
    createGiftCode: '/admin/gift-code/create',
    updateGiftCode: (id) => `/admin/gift-code/edit/${id}`,
    deleteGiftCode: (id) => `/admin/gift-code/delete/${id}`,
    getCountUsers: '/admin/user/count-all',
    getCountModels: '/admin/model/count-all', 
    getCountPayments: '/admin/transaction/count-all',
    getCountGiftCodes: '/admin/gift-code/count-all',  
    getAllWallets: '/admin/wallet/all', 
    getAllCandidates: '/admin/candidate/all',
    getAllCompanies: '/admin/company/all',
    getAllCategories: '/admin/category/all',
    getAllJobs: '/admin/job/all',
    getAllRecruiterCompanies: '/admin/recruiter-companies/all',
    getAllCareerHandbooks: '/admin/career-handbook/all',
};

export const userApis = {
    getCurrentUser: '/user/current-user',
    getReturnUrl: '/api/vnpay_return',
    updatePassword: '/user/update-password',
    updateCurrentUser: '/user/current-user',
    login: '/user/login',
    logout: '/user/logout',
    checkEmail: '/check-email/',
    register: '/user/register/',
    verifyEmail: '/verify-email/',
    forgotPassword: '/user/forget-password/',
    aiCompletion: '/ai/completion/',

    createPaymentUrl: '/vnpay/create_payment_url',


    checkGiftCode: '/giftcode/check-giftcode',
    resetPassword: '/user/reset-password/',
    changePassword: '/user/change-password/',
    refreshToken: '/api/refresh-token/',
    getAllCandidateProfile: '/user/candidate-profile',
    getCandidateProfile: (id) => `/user/candidate-profile/${id}`,
    getAllCategoriesPost: '/user/categories-post',
    getAllCareerHandbooks: '/user/career-handbook',
    getAllFeaturedCareerHandbooks: '/user/career-handbook/featured',
    getAllTopCompany: '/user/top-company',
    getAllJobs: '/user/jobs',
    getAllSavedJobsByUser: '/user/saved-jobs',
    getAllAppliedJobsByUser: '/user/applied-jobs',
    getAllViewedJobsByUser: '/user/viewed-jobs',
    getAllCvTemplates: '/user/cv-templates',
    getAllUserCvByUserId: '/user/user-cvs',
    getAllCandidateCvByUserId: '/user/candidate-cvs',
    getAllSuitableJobsByUser:'/user/suitable-jobs',
    getJobDetailByJobId: (job_id) => `/user/job-detail/${job_id}`,
    getAllCompany: '/user/companies',
    getCompanyDetailByCompanyId: (company_id) => `/user/company-detail/${company_id}`,
    getCareerHandbookByCategoryId: (category_id) => `/user/career-handbook/${category_id}`,
    getAllTemplateFieldsByTemplateId: (template_id) => `/user/template-fields/${template_id}`,
    getAllCvFieldValuesByCvId: (cv_id) => `/user/cv-field-values/${cv_id}`,
    getTemplateById: (template_id) => `/user/cv-templates/${template_id}`,
};

export const usageApis = {
    getAllModelsNLP: '/usage/all-models-nlp',
    getAllModelsVoice: '/usage/all-models-voice',
    getAllCategories: '/usage/all-categories',
    getByCategory: (category) => `/usage/by-category/${category}`, // Dynamic route
    searchCategory: '/usage/search-category',
  };

const api = axios.create({
    baseURL: HOST,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

export const authAPI = () => {
    const token = localStorage.getItem('token');
    const instance = axios.create({
        baseURL: HOST,
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    });


    return instance;
};

export default api;
