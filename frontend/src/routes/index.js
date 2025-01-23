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
const publicRoutes = [
    { path: '/', component: Dashboard },
    { path: '/user/verify-email', component: VerifyEmailSuccess, layout: null },
    { path: '/templates/all', component:  AllTemplates},
    { path: '/admin', component: Home, layout: AdminLayout},
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
    { path: '/tai-khoan/profile', component: Profile },
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
    { path: '/user/job-zone-profile', component: JobZoneProfile },
    { path: '/jobs/:id', component: JobDetail },
    { path: '/company-detail/:company', component: TopCompanyDetail },
    { path: '/user/up-cv', component: UpCV },
    { path: '/pricing', component: Pricing },
    { path: '/payment/return', component: PaymentReturn, layout: null },
    { path: '/404', component: NotFound, layout: null },
    { path: '/403', component: Forbidden, layout: null },
    { path: '/recruiter', component: RecruiterHome, layout: RecruiterLayout},
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
    { path: '/tools/saving-calculator', component: SavingCalculator },
    { path: '/tools/test-disc', component: TestDisc },
];

const privateRoutes = [];

export { publicRoutes, privateRoutes };
