const express = require('express');
const userController = require('../controllers/UserController');
const recruiterController = require('../controllers/RecruiterController');
const jwtMiddleware = require('../middleware/JWTMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/register', recruiterController.registerUser.bind(userController));
router.post('/login', recruiterController.login.bind(userController));
// Cho phép public search ứng viên
router.get('/candidates', recruiterController.getAllCandidate.bind(recruiterController));
router.post('/search-candidates', recruiterController.searchCandidates.bind(recruiterController));
// router.get('/verify-email', userController.verifyEmail.bind(userController));
// router.get('/reset-password', userController.resetPassword.bind(userController));
// router.post('/forget-password', userController.forgetPassword.bind(userController));
// router.post('/change-password', userController.changePassword.bind(userController));
router.use(jwtMiddleware(["recruiter"]));
router.get('/current-user', recruiterController.getCurrentUser.bind(recruiterController));
router.get('/recruiter-companies', recruiterController.getAllRecruiterCompanies.bind(recruiterController));
router.get('/dashboard-stats', recruiterController.getDashboardStats.bind(recruiterController));
router.get('/jobs/:company_id', recruiterController.getAllJobsByCompanyId.bind(recruiterController));
router.get('/job-applications/:job_id', recruiterController.getAllJobApplicationsByJobId.bind(recruiterController));
router.get('/candidate-detail/:candidate_id', recruiterController.getCandidateDetailByCandidateId.bind(recruiterController));
router.get('/candidate-detail-by-user-id/:user_id', recruiterController.getCandidateDetailByUserId.bind(recruiterController));
router.post('/edit-job-application-status', recruiterController.editJobApplicationStatus.bind(recruiterController));
router.post('/post-job', recruiterController.postJob.bind(recruiterController));
router.post('/edit-job/:job_id', recruiterController.editJob.bind(recruiterController));
router.get('/job/:job_id', recruiterController.getJobByJobId.bind(recruiterController));
router.delete('/delete-job/:job_id', recruiterController.deleteJob.bind(recruiterController));
router.put('/company/edit-logo/:company_id', upload.single('logo'), recruiterController.updateCompanyLogoWithCompanyId.bind(recruiterController));
router.put('/company/edit/:company_id', upload.single('logo'), recruiterController.updateCompany.bind(recruiterController));
router.put('/company/edit-banner/:company_id', upload.single('banner'), recruiterController.updateCompanyBannerWithCompanyId.bind(recruiterController));
router.get('/business-licenses/:company_id', recruiterController.getBusinessLicensesByCompanyId.bind(recruiterController));
router.get('/check-business-license/:company_id', recruiterController.checkBusinessLicense.bind(recruiterController));
router.post('/create-business-license/:company_id', recruiterController.createBusinessLicense.bind(recruiterController));
router.put('/update-business-license/:license_id', upload.single('business_license_file'), recruiterController.updateBusinessLicense.bind(recruiterController));
router.put('/company/update-business-license-file/:license_id', upload.single('business_license_file'), recruiterController.updateBusinessLicenseFile.bind(recruiterController));
router.post('/find-similar-candidates', recruiterController.findSimilarCandidates.bind(recruiterController));
router.get('/notifications', recruiterController.getNotifications.bind(recruiterController));
router.get('/notifications/unread/count', recruiterController.getUnreadNotificationsCount.bind(recruiterController));
router.put('/notifications/:notificationId/read', recruiterController.markNotificationAsRead.bind(recruiterController));
router.put('/notifications/read-all', recruiterController.markAllNotificationsAsRead.bind(recruiterController));
router.delete('/notifications/:notificationId', recruiterController.deleteNotification.bind(recruiterController));
router.delete('/notifications/read/all', recruiterController.deleteAllReadNotifications.bind(recruiterController));
router.get('/check-recruiter-company', recruiterController.checkRecruiterCompany.bind(recruiterController));
router.get('/export-job-applications/:job_id', recruiterController.exportJobApplications.bind(recruiterController));
router.get('/job-applications/new-stats', recruiterController.getNewJobApplicationsStats.bind(recruiterController));
router.get('/company-reviews/:company_id', recruiterController.getCompanyReviewsByCompanyId.bind(recruiterController));
router.get('/user-cvs/:cv_id', recruiterController.getAllUserCvByCvId.bind(recruiterController));
router.get('/candidate-cvs/:cv_id', recruiterController.getAllCandidateCvByCvId.bind(recruiterController));
router.post('/create-recruiter-company', recruiterController.createRecruiterCompany.bind(recruiterController));

// Skills management routes
router.get('/skills', recruiterController.getAllSkills.bind(recruiterController));
router.get('/skills/category/:category_id', recruiterController.getSkillsByCategoryId.bind(recruiterController));
router.get('/job-skills/:job_id', recruiterController.getJobSkills.bind(recruiterController));
router.post('/job-skill', recruiterController.addJobSkill.bind(recruiterController));
router.delete('/job-skill', recruiterController.removeJobSkill.bind(recruiterController));

router.get('/user-plan/:user_id', recruiterController.getUserPlan.bind(recruiterController));

module.exports = router;
