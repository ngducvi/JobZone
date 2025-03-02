const express = require('express');
const userController = require('../controllers/UserController');
const jwtMiddleware = require('../middleware/JWTMiddleware');
const router = express.Router();

router.post('/register', userController.registerUser.bind(userController));
router.post('/login', userController.login.bind(userController));
router.get('/verify-email', userController.verifyEmail.bind(userController));
router.get('/reset-password', userController.resetPassword.bind(userController));
router.post('/forget-password', userController.forgetPassword.bind(userController));
router.post('/change-password', userController.changePassword.bind(userController));
router.use(jwtMiddleware(["user", "admin","recruiter"]));
router.get('/current-user', userController.getCurrentUser.bind(userController));
router.patch('/current-user', userController.updateUser.bind(userController));
router.get('/check-balance', userController.checkBalance.bind(userController));
router.get('/logout', userController.logout.bind(userController));
router.patch('/update-password', userController.updatePassword.bind(userController));
router.get("/conversation/all", userController.getAllConversations.bind(userController));
router.get("/conversation/most-recent", userController.getMostRecentConversations.bind(userController));
router.get("/conversation-detail/:id", userController.getConversationDetail.bind(userController));
router.get("/usage-history", userController.getUsageHistory.bind(userController));
router.get("/candidate-profile", userController.getAllCandidateProfile.bind(userController));
router.get("/candidate-profile/:id", userController.getCandidateProfile.bind(userController));
router.get("/categories-post", userController.getAllCategoriesPost.bind(userController));
router.get("/career-handbook", userController.getAllCareerHandbook.bind(userController));
router.get("/career-handbook/featured", userController.getAllFeaturedCareerHandbook.bind(userController));
router.get("/jobs", userController.getAllJobs.bind(userController));
router.get("/top-company", userController.getAllTopCompany.bind(userController));
router.get("/saved-jobs", userController.getAllSavedJobsByUser.bind(userController));
router.get("/applied-jobs", userController.getAllAppliedJobsByUser.bind(userController));
router.get("/viewed-jobs", userController.getAllViewedJobsByUser.bind(userController));
router.get("/cv-templates", userController.getAllCvTemplates.bind(userController));
router.get("/user-cvs", userController.getAllUserCvByUserId.bind(userController));
router.get("/candidate-cvs", userController.getAllCandidateCvByUserId.bind(userController));
router.get("/suitable-jobs", userController.getAllSuitableJobsByUser.bind(userController));
router.get("/job-detail/:job_id", userController.getJobDetailByJobId.bind(userController));
router.get("/companies", userController.getAllCompany.bind(userController));
router.get("/company-detail/:company_id", userController.getCompanyDetailByCompanyId.bind(userController));
router.get("/career-handbook/:category_id", userController.getCareerHandbookByCategoryId.bind(userController));
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
router.get("/jobs/filter", userController.filterJobs.bind(userController));
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
module.exports = router;
