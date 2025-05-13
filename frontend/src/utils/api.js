import axios from 'axios';

const HOST = process.env.REACT_APP_API_URL;

export const adminApis = {
    sendNotification: '/send-notification',
    getStatistics: (year) => `courses/statistics/yearly/${year}`,
    getJobStatisticsByMonth: (year) => `/admin/job/statistics/monthly?year=${year}`,
    getCandidateStatistics: (year, month) => `/admin/candidate/statistics?year=${year}${month ? `&month=${month}` : ''}`,
    getCandidatesByStatusStats: '/admin/candidate/status-stats',
    getCandidatesByIndustryStats: '/admin/candidate/industry-stats',
    getRecruiterStatistics: (year, month) => `/admin/recruiter/statistics?year=${year}${month ? `&month=${month}` : ''}`,
    getCompaniesByPlanStats: '/admin/company/plan-stats',
    getCompaniesByLicenseStats: '/admin/company/license-stats',
    getCompanyRegistrationTrend: (year, month) => `/admin/company/registration-trend?year=${year}&month=${month}`,
    getNewJobApplicationsStats: (company_id, since) => `/admin/job-applications/new-stats?company_id=${company_id}${since ? `&since=${since}` : ''}`,

    getAllUsers: '/admin/user/all',
    getAllModels: '/admin/model/all',
    updateModel: (id) => `/admin/model/edit/${id}`,
    getAllPayments: '/admin/transaction/all',
    getAllGiftCodes: '/admin/gift-code/all',
    createGiftCode: '/admin/gift-code/create',
    updateGiftCode: (id) => `/admin/gift-code/edit/${id}`,
    deleteGiftCode: (id) => `/admin/gift-code/delete/${id}`,
    getCountUsers: '/admin/user/count-all',
    getCountRecruiterUsers: '/admin/user/count-recruiter',
    getCountModels: '/admin/model/count-all', 
    getCountPayments: '/admin/transaction/count-all',
    getCountGiftCodes: '/admin/gift-code/count-all',  
    getCountJobs: '/admin/job/count-all',
    getAllWallets: '/admin/wallet/all', 
    getAllCandidates: '/admin/candidate/all',
    getAllCompanies: '/admin/company/all',
    getAllCategories: '/admin/category/all',
    getAllJobs: '/admin/job/all',
    getAllRecruiterCompanies: '/admin/recruiter-companies/all',
    getAllCareerHandbooks: '/admin/career-handbook/all',
    updateStatusRecruiterCompany: (id) => `/admin/recruiter-companies/update-status/${id}`,
    editJob: (id) => `/admin/jobs/${id}`,
    getCompanyDetailByCompanyId: (id) => `/admin/company/detail/${id}`,
    getUserDetail: (id) => `/admin/user/detail/${id}`,
    getAllReviews: '/admin/reviews/all',
    getAllReviewsByCompanyId: (company_id) => `/admin/reviews/company/${company_id}`,
    createCategory: '/admin/category/create',
    editCategory: (category_id) => `/admin/category/edit/${category_id}`,
    deleteCategory: (id) => `/admin/category/delete/${id}`,
    createCareerHandbook: '/admin/career-handbook/create',
    editCareerHandbook: (id) => `/admin/career-handbook/edit/${id}`,
    deleteCareerHandbook: (id) => `/admin/career-handbook/delete/${id}`,
    updateStatusCandidate: (candidate_id) => `/admin/candidate/update-status/${candidate_id}`,
    updateStatusJob: (job_id) => `/admin/job/update-status/${job_id}`,
    updateBusinessLicenseStatus: (id) => `/admin/company/update-business-license-status/${id}`,
    getCountCandidates: '/admin/candidate/count-all',
    updateStatusRecruiterCompany: (recruiter_id) => `/admin/recruiter-companies/update-status/${recruiter_id}`,
};

export const userApis = {
    getCurrentUser: '/user/current-user',
    checkCandidate: '/user/check-candidate',
    checkUserPlan: '/user/check-user-plan',
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
    analyzeJobForCandidate: '/openai/analyze-job-for-candidate',
    getAllTopCompany: '/user/top-company',
    getAllTopCompanyPro: '/user/top-company-pro',

    createPaymentUrl: '/vnpay/create_payment_url',


    checkGiftCode: '/giftcode/check-giftcode',
    resetPassword: '/user/reset-password/',
    changePassword: '/user/change-password/',
    refreshToken: '/api/refresh-token/',
    getAllCandidateProfile: '/user/candidate-profile',
    getAllCategories: '/user/categories',
    getCandidateProfile: (id) => `/user/candidate-profile/${id}`,
    getAllCategoriesPost: '/user/categories-post',
    getAllCareerHandbooks: '/user/career-handbook',
    getAllFeaturedCareerHandbooks: '/user/career-handbook/featured',
    
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
    getAllReviewsByCompanyId: (company_id, rating) => `/user/reviews/${company_id}${rating ? `?rating=${rating}` : ''}`,
    getCareerHandbookByCategoryId: (category_id) => `/user/career-handbook/${category_id}`,
    getAllTemplateFieldsByTemplateId: (template_id) => `/user/template-fields/${template_id}`,
    getAllCvFieldValuesByCvId: (cv_id) => `/user/cv-field-values/${cv_id}`,
    getTemplateById: (template_id) => `/user/cv-templates/${template_id}`,
    getAllCandidateLanguages: '/user/candidate-languages',
    getCandidateLanguagesByCandidateId: (candidate_id) => `/user/candidate-languages/${candidate_id}`,
    getCandidateExperiencesByCandidateId: (candidate_id) => `/user/candidate-experiences/${candidate_id}`,
    
    getCandidateCertificationsByCandidateId: (candidate_id) => `/user/candidate-certifications/${candidate_id}`,
    getCandidateProjectsByCandidateId: (candidate_id) => `/user/candidate-projects/${candidate_id}`,
    // candidate education
    editCandidateEducation: (education_id) => `/user/candidate-education/edit/${education_id}`,
    createCandidateEducationWithCandidateId: (candidate_id) => `/user/candidate-education/${candidate_id}`,
    getCandidateEducationByCandidateId: (candidate_id) => `/user/candidate-education/${candidate_id}`,
    deleteCandidateEducationById: (education_id) => `/user/candidate-education/${education_id}`,

    // Experience APIs
    createCandidateExperienceWithCandidateId: (candidate_id) => `/user/candidate-experience/${candidate_id}`,
    editCandidateExperience: (experience_id) => `/user/candidate-experience/edit/${experience_id}`,
    deleteCandidateExperienceById: (experience_id) => `/user/candidate-experience/${experience_id}`,
    // Languages APIs
    createCandidateLanguagesWithCandidateId: (candidate_id) => `/user/candidate-languages/${candidate_id}`,
    editCandidateLanguages: (languages_id) => `/user/candidate-languages/edit/${languages_id}`,
    deleteCandidateLanguagesById: (languages_id) => `/user/candidate-languages/${languages_id}`,

    // Certifications APIs
    createCandidateCertificationsWithCandidateId: (candidate_id) => `/user/candidate-certifications/${candidate_id}`,
    editCandidateCertifications: (certifications_id) => `/user/candidate-certifications/edit/${certifications_id}`,
    deleteCandidateCertificationsById: (certifications_id) => `/user/candidate-certifications/${certifications_id}`,
    // Projects APIs
    createCandidateProjectsWithCandidateId: (candidate_id) => `/user/candidate-projects/${candidate_id}`,
    editCandidateProjects: (projects_id) => `/user/candidate-projects/edit/${projects_id}`,
    deleteCandidateProjectsById: (projects_id) => `/user/candidate-projects/${projects_id}`,
    editCandidate: (candidate_id) => `/user/candidate/edit/${candidate_id}`,
    // edit is_searchable and is_actively_searching
    editIsSearchableAndIsActivelySearching: (candidate_id) => `/user/candidate/is-searchable-and-is-actively-searching/${candidate_id}`,
    filterJobs: '/user/jobs/filter',
    
    saveJob: (jobId) => `/user/jobs/save/${jobId}`,
    unsaveJob: (jobId) => `/user/jobs/unsave/${jobId}`,
    isJobSaved: (jobId) => `/user/jobs/is-saved/${jobId}`,
    // viewed job
    addViewedJob: (jobId) => `/user/jobs/view/${jobId}`,
    clearViewedJobs: '/user/viewed-jobs/clear',
    deleteViewedJob: (jobId) => `/user/viewed-jobs/${jobId}`,
    getAllJobsByCompanyId: (companyId) => `/user/jobs/company/${companyId}`,
    applyJob: '/user/apply-job',
    checkApplicationStatus: (job_id) => `/user/check-application-status/${job_id}`,
    withdrawApplication: '/user/withdraw-application',
    editProfilePictureWithCandidateId: (candidate_id) => `/user/candidate/edit-profile-picture/${candidate_id}`,
    createReviewCompany: '/user/company/review',
    updateReviewCompany: (review_id) => `/user/company/review/${review_id}`,
    deleteReviewCompany: (review_id) => `/user/company/review/${review_id}`,
    getCareerHandbookByPostId: (post_id) => `/user/career-handbook/post/${post_id}`,
    getJobsByExperience: '/user/jobs/experience',
    getJobsByWorkingTime: '/user/jobs/working-time',
    getJobsBySalary: '/user/jobs/salary',
    getJobsByWorkingLocationRemote: '/user/jobs/working-location-remote',
    createCandidateCvWithCvId: '/user/create-candidate-cv-with-cv-id',
    toggleCvTemplate: (cv_id) => `/user/toggle-cv-template/${cv_id}`,
    cancelCvTemplate: (cv_id) => `/user/cancel-cv-template/${cv_id}`,
    toggleUserCvTemplate: (cv_id) => `/user/toggle-user-cv-template/${cv_id}`,
    cancelUserCvTemplate: (cv_id) => `/user/cancel-user-cv-template/${cv_id}`,
    deleteUserCvTemplate: (cv_id) => `/user/delete-user-cv-template/${cv_id}`,
    deleteCandidateCv: (cv_id) => `/user/candidate-cv/${cv_id}`,
   

    getUserNotifications: '/user/notifications',
    getUnreadNotificationsCount: '/user/notifications/unread/count',
    markNotificationAsRead: (notificationId) => `/user/notifications/${notificationId}/read`,
    markAllNotificationsAsRead: '/user/notifications/read-all',
    deleteNotification: (notificationId) => `/user/notifications/${notificationId}`,
    deleteAllReadNotifications: '/user/notifications/read/all',
    createNewCV: '/user/create-cv',
    updateCV: (cv_id) => `/user/update-cv/${cv_id}`,
    getAllReviewsByUserId: '/user/reviews',
    editReviewByUserId: '/user/reviews/edit',
    deleteReviewByReviewId: (review_id) => `/user/reviews/${review_id}`,
    getCandidateNotification: '/user/candidate-notification',
    updateCandidateNotification: '/user/candidate-notification',

    checkCandidateStatus: '/user/check-candidate-status',


    getAllConversations: '/user/conversations',
    getRecruiterCompanyByUserId: '/user/recruiter-company',
};


export const recruiterApis = {
    getCurrentUser: '/recruiter/current-user',
    register: '/recruiter/register',
    login: '/recruiter/login',
    getAllRecruiterCompanies: '/recruiter/recruiter-companies',
    getDashboardStats: '/recruiter/dashboard-stats',
    getAllJobsByCompanyId: (company_id) => `/recruiter/jobs/${company_id}`,
    getAllJobApplicationsByJobId: (job_id) => `/recruiter/job-applications/${job_id}`,
    getAllCandidate: '/recruiter/candidates',
    getCandidateDetailByCandidateId: (candidate_id) => `/recruiter/candidate-detail/${candidate_id}`,
    getCandidateDetailByUserId: (user_id) => `/recruiter/candidate-detail-by-user-id/${user_id}`,
    getJobApplicationByJobId: (job_id) => `/recruiter/job-application/${job_id}`,
    getCandidateByJobId: (job_id) => `/recruiter/job-application/${job_id}`,
    editJobApplicationStatus: '/recruiter/edit-job-application-status',
    postJob: '/recruiter/post-job',
    editJob: (job_id) => `/recruiter/edit-job/${job_id}`,
    getJobByJobId: (job_id) => `/recruiter/job/${job_id}`,
    deleteJob: (job_id) => `/recruiter/delete-job/${job_id}`,
    updateCompanyLogo: (company_id) => `/recruiter/company/edit-logo/${company_id}`,
    updateCompany: (company_id) => `/recruiter/company/edit/${company_id}`,
    updateCompanyBanner: (company_id) => `/recruiter/company/edit-banner/${company_id}`,
    getBusinessLicensesByCompanyId: (company_id) => `/recruiter/business-licenses/${company_id}`,
    checkBusinessLicense: (company_id) => `/recruiter/check-business-license/${company_id}`,
    createBusinessLicense: (company_id) => `/recruiter/create-business-license/${company_id}`,
    updateBusinessLicense: (license_id) => `/recruiter/update-business-license/${license_id}`,
    updateBusinessLicenseFile: (license_id) => `/recruiter/company/update-business-license-file/${license_id}`,
    searchCandidates: '/recruiter/search-candidates',
    getNotifications: '/recruiter/notifications',
    getUnreadNotificationsCount: '/recruiter/notifications/unread/count',
    markNotificationAsRead: (notificationId) => `/recruiter/notifications/${notificationId}/read`,
    markAllNotificationsAsRead: '/recruiter/notifications/read-all',
    deleteNotification: (notificationId) => `/recruiter/notifications/${notificationId}`,
    deleteAllReadNotifications: '/recruiter/notifications/read/all',
    checkRecruiterCompany: '/recruiter/check-recruiter-company',
    checkPlan: '/recruiter/check-plan',
    exportJobApplications: (job_id) => `/recruiter/export-job-applications/${job_id}`,
    findSimilarCandidates: '/recruiter/find-similar-candidates',
    getNewJobApplicationsStats: (company_id, since) => `/recruiter/job-applications/new-stats?company_id=${company_id}${since ? `&since=${since}` : ''}`,
};

export const messagesApis = {
    getAllConversations: '/messages/conversations',
    getConversationByUserId: (user_id) => `/messages/conversations/${user_id}`,
    getMessagesByConversationId: (conversation_id) => `/messages/messages/${conversation_id}`,
    sendMessage: '/messages/send-message',
    editMessage: '/messages/edit-message',
    deleteMessage: '/messages/delete-message',
    createConversation: '/messages/create-conversation',
    markMessagesAsRead: '/messages/mark-messages-read',
    resetUnreadCount: '/messages/reset-unread-count',
    getTotalUnread: (user_id) => `/messages/total-unread/${user_id}`,
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
