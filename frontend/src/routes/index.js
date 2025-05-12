//Layout
import Dashboard from '~/pages/Dashboard';
import AllTemplates from '~/pages/AllTemplates';
import PaymentReturn from '~/pages/PaymentReturn';
import Pricing from '~/pages/Pricing';
import VerifyEmailSuccess from '~/pages/VerifyEmailSuccess';
import Users from '~/pages/Admin/Users';
import AdminLayout from '~/components/Layouts/AdminLayout';
import Home from '~/pages/Admin/Home';
import Profile from '~/pages/Userinfo/Profile/Profile';
import Pay from '~/pages/Pay/Pay';
import ChangePassword from '~/pages/ChangePassword/ChangePassword';
import Usersinfo from '~/pages/Userinfo/Usersinfo';
import Models from '~/pages/Admin/Models';
import Payments from '~/pages/Admin/Payments';
import NotFound from '~/pages/NotFound';
import Forbidden from '~/pages/Forbidden';
import RecruiterHome from '~/pages/Recruiter/Home';
import RecruiterLayout from '~/components/Layouts/RecruiterLayout';
import Company from '~/pages/Admin/Company/Company';
import Category from '~/pages/Admin/Category/Category';
import Job from '~/pages/Admin/Job/Job';
import Candidate from '~/pages/Admin/Candidate/Candidate';
import Recruiter from '~/pages/Admin/Recruiter/Recruiter';
import CareerHandbook from '~/pages/Admin/CareerHandbook/CareerHandbook';
import CareerHandbookUser from '~/pages/CareerHandbook/CareerHandbook';
import JobSearch from '~/pages/JobSearch/JobSearch';
import TopCompany from '~/pages/TopCompany';
import JobIT from '~/pages/JobIT';
import SaveJob from '~/pages/SaveJob/SaveJob';
import LoadingPage from '~/pages/LoadingPage/LoadingPage';
import JobsApplying from '~/pages/JobsApplying/JobsApplying';
import ViewdJob from '~/pages/ViewedJob/ViewedJob';
import CreateCV from '~/pages/Resume/CreateCV/CreateCV';
import ManagerCV from '~/pages/Resume/ManagerCV/ManagerCV';
import JobDetail from '~/pages/JobDetail/JobDetail';
import UpCV from '~/pages/Resume/UpCV/UpCV';
import JobZoneProfile from '~/pages/Resume/JobZoneProfile/JobZoneProfile';
import TopCompanyDetail from '~/pages/TopCompany/TopCompanyDetail/TopCompanyDetail';

import JobHunting from '~/pages/CareerHandbook/JobHunting/JobHunting';
import IndustryKnowledge from '~/pages/CareerHandbook/IndustryKnowledge/IndustryKnowledge';
import Compensation from '~/pages/CareerHandbook/Compensation/Compensation';
import RecruitmentTrends from '~/pages/CareerHandbook/RecruitmentTrends/RecruimentTrends';
import CereerPreparation from '~/pages/CareerHandbook/CareerPreparation/CereerPreparation';
import CareerOrientation from '~/pages/CareerHandbook/CareerOrientation/CareerOrientation';
import Tools from '~/pages/Tools/Tools';
import SalaryCalculator from '~/pages/Tools/SalaryCalculator/SalaryCalculator';
import CompoundInterestCalculator from '~/pages/Tools/CompoundInterestCalculator/CompoundInterestCalculator';
import SavingCalculator from '~/pages/Tools/SavingCalculator/SavingCalculator';
import TestDisc from '~/pages/Tools/TestDisc/TestDisc';
import UseTemplates from '~/pages/Resume/CreateCV/UseTemplates/UseTemplates';
import SeeCv from '~/pages/Resume/SeeCv/SeeCv';
import TestTemplate from '~/pages/TestTemplate/TestTemplate';
import CvLibrary from '~/pages/CvLibrary/CvLibrary';
import RecruiterCVManagement from '~/pages/Recruiter/CVManagement/RecruiterCVManagement';
import RecruiterCampaigns from '~/pages/Recruiter/Campaigns/RecruiterCampaigns';
import RecruiterJobs from '~/pages/Recruiter/Jobs/RecruiterJobs';
import RecruiterReports from '~/pages/Recruiter/Reports/RecruiterReports';
import RecruiterMyServices from '~/pages/Recruiter/MyServices/RecruiterMyServices';
import RecruiterSettings from '~/pages/Recruiter/Settings/RecruiterSettings';
import SearchCandidate from '~/pages/Recruiter/SearchCandidate/SearchCandidate';
import CandidateDetail from '~/pages/Recruiter/CandidateDetail/CandidateDetail';
import PostJob from '~/pages/Recruiter/PostJob/PostJob';
import PricingRecruiter from '~/pages/Recruiter/PricingRecruiter/PricingRecruiter';
import CareerHandbookDetail from '~/pages/CareerHandbook/CareerHandbookDetail/CareerHandbookDetail';
import RecruiterAISuggest from '~/pages/Recruiter/AISuggest/RecruiterAISuggest';
import DashboardA from '~/pages/Admin/DashboardA/DashboardA';
import ManagerReview from '~/pages/Userinfo/ManagerReview/ManagetReview';
import Notifications from '~/pages/Userinfo/Notifications/Notifications';
import SettingEmail from '~/pages/Userinfo/SettingEmail/SettingEmail';
import NotificationsManager from '~/pages/Recruiter/NotificationsManager/NotificationsManager';
import EditCV from '~/pages/Resume/EditCV/EditCV';
import CreateSeoBlog from '~/pages/CreateSeoBlog/CreateSeoBlog';
import CreateEmail from '~/pages/Tools/AiTools/CreateEmail/CreateEmail';
import InterviewPrep from '~/pages/Tools/AiTools/InterviewPrep/InterviewPrep';
import CareerCounseling from '~/pages/Tools/AiTools/CareerCounseling/CareerCounseling';
import AITools from '~/pages/Tools/AiTools';
import PersonalBrand from '~/pages/Tools/AiTools/PersonalBrand/PersonalBrand';
import AiChat from '~/pages/Tools/AiTools/AiChat/AiChat';
import CVEvaluation from '~/pages/Recruiter/MyServices/Tools/CVEvaluation/CVEvaluation';
import JobDescription from '~/pages/Recruiter/MyServices/Tools/JobDescription/JobDescription';
import TrainingPlan from '~/pages/Recruiter/MyServices/Tools/TrainingPlan/TrainingPlan';
import WriteRecruitmentEmails from '~/pages/Recruiter/MyServices/Tools/WriteRecruitmentEmails/WriteRecruitmentEmails';
import Messages from '~/pages/Messages';
import MessagesRecruiter from '~/pages/Messages/MesagesRecruiter/MesagesRecruiter';
import DashboardB from '~/pages/Admin/DashboardB/DashboardB';
const publicRoutes = [
    { path: '/', component: Dashboard },
    { path: '/user/verify-email', component: VerifyEmailSuccess, layout: null },
    { path: '/templates/all', component:  AllTemplates},
    { path: '/admin', component: Home, layout: AdminLayout},
    { path: '/admin/dashboarda', component: DashboardA, layout: AdminLayout},
    { path: '/admin/dashboardb', component: DashboardB, layout: AdminLayout},
    { path: '/admin/users', component: Users, layout: AdminLayout},
    { path: '/admin/models', component: Models, layout: AdminLayout},
    { path: '/admin/payments', component: Payments, layout: AdminLayout},
    { path: '/admin/company', component: Company, layout: AdminLayout},
    { path: '/admin/category', component: Category, layout: AdminLayout},
    { path: '/admin/job', component: Job, layout: AdminLayout},
    { path: '/admin/candidate', component: Candidate, layout: AdminLayout},
    { path: '/admin/recruiter', component: Recruiter, layout: AdminLayout},
    { path: '/admin/career-handbook', component: CareerHandbook, layout: AdminLayout},
    { path: '/user', component: Usersinfo },
    { path: '/templates/create-seo-blog', component: CreateSeoBlog },
    { path: '/tai-khoan/profile', component: Profile },
    { path: '/tai-khoan/manager-review', component: ManagerReview },
    { path: '/tai-khoan/notifications', component: Notifications },
    { path: '/tai-khoan/setting-email', component: SettingEmail },
    { path: '/user/pay', component: Pay },
    { path: '/user/change-password', component: ChangePassword },
    { path: '/user/career-handbook', component: CareerHandbookUser },
    { path: '/user/job-search', component: JobSearch },
    { path: '/user/top-company', component: TopCompany },
    { path: '/user/job-it', component: JobIT },
    { path: '/user/save-job', component: SaveJob },
    { path: '/user/jobs-applying', component: JobsApplying },
    { path: '/user/jobs-viewed', component: ViewdJob },
    { path: '/user/create-cv', component: CreateCV },
    { path: '/user/manager-cv', component: ManagerCV },
    { path: '/user/edit-cv', component: EditCV },
    { path: '/user/cv-library', component: CvLibrary },
    { path: '/user/see-cv', component: SeeCv, layout: null },
    { path: '/user/job-zone-profile', component: JobZoneProfile },
    { path: '/user/use-templates', component: UseTemplates },
    { path: '/jobs/:id', component: JobDetail },
    { path: '/company-detail/:company', component: TopCompanyDetail },
    { path: '/user/up-cv', component: UpCV },
    { path: '/pricing', component: Pricing },
    { path: '/payment/return', component: PaymentReturn, layout: null },
    { path: '/404', component: NotFound, layout: null },
    { path: '/403', component: Forbidden, layout: null },
    { path: '/recruiter', component: RecruiterHome, layout: RecruiterLayout},
    { path: '/recruiter/cv-management', component: RecruiterCVManagement , layout: RecruiterLayout},
    { path: '/recruiter/ai-suggest', component: RecruiterAISuggest , layout: RecruiterLayout},
    { path: '/recruiter/campaigns', component: RecruiterCampaigns , layout: RecruiterLayout},
    { path: '/recruiter/jobs', component: RecruiterJobs , layout: RecruiterLayout},
    { path: '/recruiter/reports', component: RecruiterReports , layout: RecruiterLayout},
    { path: '/recruiter/my-services', component: RecruiterMyServices , layout: RecruiterLayout},
    { path: '/recruiter/settings', component: RecruiterSettings , layout: RecruiterLayout},
    { path: '/recruiter/search-candidate', component: SearchCandidate , layout: RecruiterLayout},
    { path: '/recruiter/candidate-detail/:candidate_id', component: CandidateDetail, layout: RecruiterLayout },
    { path: '/recruiter/post-job', component: PostJob, layout: RecruiterLayout },
    { path: '/recruiter/pricing', component: PricingRecruiter, layout: RecruiterLayout },
    { path: '/recruiter/notifications-manager', component: NotificationsManager, layout: RecruiterLayout },
    { path: '/recruiter/my-services/tools/cv-evaluation', component: CVEvaluation, layout: RecruiterLayout },
    { path: '/recruiter/my-services/tools/job-description', component: JobDescription, layout: RecruiterLayout },
    { path: '/recruiter/my-services/tools/training-plan', component: TrainingPlan, layout: RecruiterLayout },
    { path: '/recruiter/my-services/tools/write-recruitment-emails', component: WriteRecruitmentEmails, layout: RecruiterLayout },
    { path: '/loading', component: LoadingPage, layout: null },
    { path: '/career-handbook/job-hunting', component: JobHunting },
    { path: '/career-handbook/industry-knowledge', component: IndustryKnowledge },
    { path: '/career-handbook/compensation', component: Compensation },
    { path: '/career-handbook/recruitment-trends', component: RecruitmentTrends },
    { path: '/career-handbook/career-preparation', component: CereerPreparation },
    { path: '/career-handbook/career-orientation', component: CareerOrientation },
    { path: '/tools', component: Tools },
    { path: '/tools/salary-calculator', component: SalaryCalculator },
    { path: '/tools/compound-interest-calculator', component: CompoundInterestCalculator },
    { path: '/tools/create-email', component: CreateEmail },
    { path: '/tools/interview-prep', component: InterviewPrep },
    { path: '/tools/career-counseling', component: CareerCounseling },
    { path: '/tools/saving-calculator', component: SavingCalculator },
    { path: '/tools/test-disc', component: TestDisc },
    { path: '/tools/ai', component: AITools },
    { path: '/tools/ai-chat', component: AiChat },
    { path: '/tools/personal-brand', component: PersonalBrand },
    { path: '/test-template', component: TestTemplate, layout: null },
    { path: '/career-handbook/detail/:id', component: CareerHandbookDetail},
    { path: '/career-handbook/:post_id', component: CareerHandbookDetail},
    { path: '/messages', component: Messages },
    { path: '/recruiter/messages', component: MessagesRecruiter, layout: RecruiterLayout },
];

const privateRoutes = [];

export { publicRoutes, privateRoutes };
