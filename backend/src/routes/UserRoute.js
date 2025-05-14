const express = require('express');
const userController = require('../controllers/UserController');
const jwtMiddleware = require('../middleware/JWTMiddleware');
const checkPlanExpiredMiddleware = require('../middleware/CheckPlanExpiredMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// Public routes (no authentication required)
// Authentication routes
router.post('/register', userController.registerUser.bind(userController));
router.post('/login', userController.login.bind(userController));
router.get('/verify-email', userController.verifyEmail.bind(userController));
router.get('/reset-password', userController.resetPassword.bind(userController));
router.post('/forget-password', userController.forgetPassword.bind(userController));
router.post('/change-password', userController.changePassword.bind(userController));

// Public job search routes
router.get("/jobs", userController.getAllJobs.bind(userController));
router.get("/jobs/filter", userController.filterJobs.bind(userController));
router.get("/categories", userController.getAllCategories.bind(userController));
router.get("/categories/:parent_id", userController.getCategoriesByParentId.bind(userController));
router.get("/companies", userController.getAllCompany.bind(userController));
router.get("/company-detail/:company_id", userController.getCompanyDetailByCompanyId.bind(userController));
router.get("/job-detail/:job_id", userController.getJobDetailByJobId.bind(userController));
router.get("/top-company", userController.getAllTopCompany.bind(userController));
router.get("/top-company-pro", userController.getAllTopCompanyPro.bind(userController));
router.get("/reviews/:company_id", userController.getAllReviewsByCompanyId.bind(userController));
router.get("/career-handbook/:category_id", userController.getCareerHandbookByCategoryId.bind(userController));
router.get("/career-handbook/post/:post_id", userController.getCareerHandbookByPostId.bind(userController));

// Authentication required routes
router.use(jwtMiddleware(["user", "admin","recruiter"]));
router.use(checkPlanExpiredMiddleware());

// Protected routes
router.get('/current-user', userController.getCurrentUser.bind(userController));
router.get('/check-candidate', userController.checkCandidate.bind(userController));
router.get('/check-user-plan', userController.checkUserPlan.bind(userController));
router.patch('/current-user', userController.updateUser.bind(userController));
router.get('/check-balance', userController.checkBalance.bind(userController));
router.get('/logout', userController.logout.bind(userController));
router.patch('/update-password', userController.updatePassword.bind(userController));

router.get("/candidate-profile", userController.getAllCandidateProfile.bind(userController));
router.get("/candidate-profile/:id", userController.getCandidateProfile.bind(userController));
router.get("/categories-post", userController.getAllCategoriesPost.bind(userController));
router.get("/career-handbook", userController.getAllCareerHandbook.bind(userController));
router.get("/career-handbook/featured", userController.getAllFeaturedCareerHandbook.bind(userController));
router.get("/jobs/experience", userController.getJobsByExperience.bind(userController));
router.get("/jobs/working-time", userController.getJobsByWorkingTime.bind(userController));
router.get("/jobs/salary", userController.getJobsBySalary.bind(userController));
router.get("/jobs/working-location-remote", userController.getJobsByWorkingLocationRemote.bind(userController));

router.get("/saved-jobs", userController.getAllSavedJobsByUser.bind(userController));
router.get("/applied-jobs", userController.getAllAppliedJobsByUser.bind(userController));
router.get("/viewed-jobs", userController.getAllViewedJobsByUser.bind(userController));
router.get("/cv-templates", userController.getAllCvTemplates.bind(userController));
router.get("/user-cvs", userController.getAllUserCvByUserId.bind(userController));
router.get("/candidate-cvs", userController.getAllCandidateCvByUserId.bind(userController));
router.get("/suitable-jobs", userController.getAllSuitableJobsByUser.bind(userController));
router.get("/template-fields/:template_id", userController.getAllTemplateFieldsByTemplateId.bind(userController));
router.get("/cv-field-values/:cv_id", userController.getAllCvFieldValuesByCvId.bind(userController));
router.get("/cv-templates/:template_id", userController.getTemplateById.bind(userController));
router.get("/candidate-languages", userController.getAllCandidateLanguages.bind(userController));
router.get("/candidate-languages/:candidate_id", userController.getCandidateLanguagesByCandidateId.bind(userController));
router.get("/candidate-experiences/:candidate_id", userController.getCandidateExperiencesByCandidateId.bind(userController));
router.get("/candidate-education/:candidate_id", userController.getCandidateEducationByCandidateId.bind(userController));
router.get("/candidate-certifications/:candidate_id", userController.getCandidateCertificationsByCandidateId.bind(userController));
router.get("/candidate-projects/:candidate_id", userController.getCandidateProjectsByCandidateId.bind(userController));
router.put('/candidate-education/edit/:id', userController.editCandidateEducation);
router.post('/candidate-education/:candidate_id', userController.createCandidateEducationWithCandidateId.bind(userController));
router.delete('/candidate-education/:id', userController.deleteCandidateEducationById.bind(userController));

router.post('/candidate-experience/:candidate_id', userController.createCandidateExperienceWithCandidateId.bind(userController));
router.put('/candidate-experience/edit/:id', userController.editCandidateExperience.bind(userController));
router.delete('/candidate-experience/:id', userController.deleteCandidateExperienceById.bind(userController));

router.post('/candidate-languages/:candidate_id', userController.createCandidateLanguagesWithCandidateId.bind(userController));
router.put('/candidate-languages/edit/:id', userController.editCandidateLanguages.bind(userController));
router.delete('/candidate-languages/:id', userController.deleteCandidateLanguagesById.bind(userController));

router.post('/candidate-certifications/:candidate_id', userController.createCandidateCertificationsWithCandidateId.bind(userController));
router.put('/candidate-certifications/edit/:id', userController.editCandidateCertifications.bind(userController));
router.delete('/candidate-certifications/:id', userController.deleteCandidateCertificationsById.bind(userController));

router.post('/candidate-projects/:candidate_id', userController.createCandidateProjectsWithCandidateId.bind(userController));
router.put('/candidate-projects/edit/:id', userController.editCandidateProjects.bind(userController));
router.delete('/candidate-projects/:id', userController.deleteCandidateProjectsById.bind(userController));

router.put('/candidate/edit/:id', userController.editCandidate.bind(userController));
router.put('/candidate/is-searchable-and-is-actively-searching/:id', userController.editIsSearchableAndIsActivelySearching.bind(userController));
router.get('/categories', userController.getAllCategories.bind(userController));
// lưu job
router.post('/jobs/save/:job_id', userController.saveJob.bind(userController));
// bỏ lưu job
router.delete('/jobs/unsave/:job_id', userController.unsaveJob.bind(userController));
// kiểm tra job đã được lưu chưa
router.get('/jobs/is-saved/:job_id', userController.isJobSaved.bind(userController));
// thêm job vào lịch sử xem
router.post('/jobs/view/:job_id', userController.addViewedJob.bind(userController));
// xóa lịch sử xem
router.delete('/viewed-jobs/clear', userController.clearViewedJobs.bind(userController));
// xóa job trong lịch sử xem
router.delete('/viewed-jobs/:job_id', userController.deleteViewedJob.bind(userController));
// get all jobs by company_id
router.get('/jobs/company/:company_id', userController.getAllJobsByCompanyId.bind(userController));
router.post('/apply-job', userController.applyForJob.bind(userController));
router.get('/check-application-status/:job_id', userController.checkApplicationStatus.bind(userController));
router.post('/withdraw-application', userController.withdrawApplication.bind(userController));
router.put('/candidate/edit-profile-picture/:candidate_id', upload.single('profile_picture'), userController.editProfilePictureWithCandidateId.bind(userController));
// router.put('/company/edit-logo/:company_id', upload.single('logo'), userController.updateCompanyLogoWithCompanyId.bind(userController));
router.get('/candidate/profile-picture/:candidate_id', userController.getProfilePictureByCandidateId.bind(userController));
router.put('/candidate/edit-profile-picture-cloudinary/:candidate_id', upload.single('profile_picture'), userController.updateProfilePictureByCandidateIdCloudinary.bind(userController));
router.post('/company/review', userController.createReviewCompany.bind(userController));
router.put('/company/review/:review_id', userController.updateReviewCompany.bind(userController));
router.delete('/company/review/:review_id', userController.deleteReviewCompany.bind(userController));
router.post('/create-cv', userController.createNewCV.bind(userController));
router.put('/toggle-cv-template/:cv_id', userController.toggleCvTemplate.bind(userController));
router.put('/cancel-cv-template/:cv_id', userController.cancelCvTemplate.bind(userController));
router.put('/toggle-user-cv-template/:cv_id', userController.toggleUserCvTemplate.bind(userController));
router.put('/cancel-user-cv-template/:cv_id', userController.cancelUserCvTemplate.bind(userController));
router.delete('/delete-user-cv-template/:cv_id', userController.deleteUserCvTemplate.bind(userController));
// Thêm route update CV
router.put('/update-cv/:cv_id', userController.updateCV.bind(userController));

router.delete('/candidate-cv/:cv_id', userController.deleteCandidateCv.bind(userController));
router.post(
  "/create-candidate-cv-with-cv-id",
  upload.single('cv_file'),
  userController.createCandidateCvWithCvId.bind(userController)
);
router.get('/notifications', userController.getUserNotifications.bind(userController));
router.get('/candidate-notification', userController.getCandidateNotification.bind(userController));
router.patch('/candidate-notification', userController.updateCandidateNotification.bind(userController));
router.get('/notifications/unread/count', userController.getUnreadNotificationsCount.bind(userController));
router.patch('/notifications/:notificationId/read', userController.markNotificationAsRead.bind(userController));
router.patch('/notifications/read-all', userController.markAllNotificationsAsRead.bind(userController));
router.delete('/notifications/:notificationId', userController.deleteNotification.bind(userController));
router.delete('/notifications/read/all', userController.deleteAllReadNotifications.bind(userController));
router.get('/reviews', userController.getAllReviewsByUserId.bind(userController));
router.put('/reviews/edit', userController.editReviewByUserId.bind(userController));
router.delete('/reviews/:review_id', userController.deleteReviewByReviewId.bind(userController));
router.get('/check-candidate-status', userController.checkCandidateStatus.bind(userController));
router.get('/conversations', userController.getAllConversations.bind(userController));
router.get('/recruiter-company', userController.getRecruiterCompanyByUserId.bind(userController));
module.exports = router;
