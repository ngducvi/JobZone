// RecruiterMyServices

import React, { useContext, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './RecruiterMyServices.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faGraduationCap, 
  faChartLine,
  faFileLines,
  faUserCheck,
  faBook,
  faEnvelope,
  faChartBar,
  faFileContract,
  faPieChart,
  faQuestion,
  faHandshake,
  faLock,
  faRocket
} from '@fortawesome/free-solid-svg-icons';
import { authAPI, recruiterApis } from '~/utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
const cx = classNames.bind(styles);

const categories = [
  {
    id: 1,
    icon: faUsers,
    title: 'Tuyển dụng',
    description: 'Tạo mô tả công việc, đánh giá CV',
    minPlan: 'Basic'
  },
  {
    id: 2, 
    icon: faGraduationCap,
    title: 'Đào tạo',
    description: 'Phát triển tài liệu đào tạo',
    minPlan: 'ProMax'
  },
  {
    id: 3,
    icon: faChartLine,
    title: 'Phát triển',
    description: 'Đánh giá hiệu suất, kế hoạch phát triển',
    minPlan: 'ProMax'
  },
  
];

const templates = [
  {
    id: 1,
    icon: faFileLines,
    title: 'Tạo mô tả công việc (JD)',
    path: '/recruiter/my-services/tools/job-description',
    minPlan: 'Basic'
  },
  {
    id: 2,
    icon: faUserCheck,
    title: 'Đánh giá CV ứng viên',
    path: '/recruiter/my-services/tools/cv-evaluation',
    minPlan: 'Basic',
    earlyAccess: true
  },
  {
    id: 3,
    icon: faBook,
    title: 'Tạo kế hoạch đào tạo',
    path: '/recruiter/my-services/tools/training-plan',
    minPlan: 'ProMax'
  },
  {
    id: 4,
    icon: faEnvelope,
    title: 'Viết email tuyển dụng',
    path: '/recruiter/my-services/tools/write-recruitment-emails',
    minPlan: 'Basic'
  },
  {
    id: 5,
    icon: faChartBar,
    title: 'Đánh giá hiệu suất nhân viên',
    minPlan: 'ProMax',
    earlyAccess: true
  },
  {
    id: 6,
    icon: faFileContract,
    title: 'Tạo chính sách nhân sự',
    minPlan: 'ProMax',
    earlyAccess: true
  },
  {
    id: 7,
    icon: faPieChart,
    title: 'Báo cáo & phân tích HR',
    minPlan: 'ProMax',
    earlyAccess: true
  },
  {
    id: 8,
    icon: faQuestion,
    title: 'Tạo bài kiểm tra kiến thức',
    minPlan: 'ProMax',
    earlyAccess: true
  },
  {
    id: 9,
    icon: faHandshake,
    title: 'Quản lý xung đột & khiếu nại',
    minPlan: 'ProMax',
    earlyAccess: true
  }
];

const planLevels = {
  'Basic': 1,
  'Pro': 2,
  'ProMax': 3
};

const planColors = {
  Basic: {
    color: '#f0ad4e',
    gradient: 'linear-gradient(135deg, #f0ad4e 0%, #ec971f 100%)',
    light: '#fff3e0'
  },
  Pro: {
    color: '#5bc0de',
    gradient: 'linear-gradient(135deg, #5bc0de 0%, #31b0d5 100%)',
    light: '#e1f5fe'
  },
  ProMax: {
    color: '#d9534f',
    gradient: 'linear-gradient(135deg, #d9534f 0%, #c9302c 100%)',
    light: '#ffebee'
  }
};

const RecruiterMyServices = () => {
  const [currentPlan, setCurrentPlan] = useState('Basic');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanyPlan = async () => {
      try {
        setIsLoading(true);
        const responseCompany = await authAPI().get(recruiterApis.getAllRecruiterCompanies);
        setCurrentPlan(responseCompany.data.companies[0].plan);
      } catch (error) {
        console.error(error);
        toast('Không thể tải thông tin gói dịch vụ', {
          icon: '❌',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanyPlan();
  }, []);

  const canAccessFeature = (minPlan) => {
    return planLevels[currentPlan] >= planLevels[minPlan];
  };

  const handleTemplateClick = (template) => {
    if (template.earlyAccess) {
      toast(`Tính năng này đang trong giai đoạn phát triển và sẽ sớm ra mắt`, {
        icon: '🚀',
      });
      return;
    }
    
    if (!canAccessFeature(template.minPlan)) {
      toast(`Tính năng này chỉ khả dụng cho gói ${template.minPlan} trở lên`, {
        icon: '🔒',
      });
      return;
    }
    
    // Handle template click
    if (template.path) {
      navigate(template.path);
    } else {
      console.log(`Clicked template: ${template.title}`);
    }
  };

  return (
    <div className={cx('wrapper')}>
      <div className={cx('container')}>
        <div className={cx('header')}>
          <h1>Công cụ HR</h1>
          <p>Bộ công cụ AI hỗ trợ HR chuyên nghiệp giúp tối ưu hóa quy trình tuyển dụng và phát triển nhân sự</p>
        </div>

        <div className={cx('content')}>
          <div className={cx('section')}>
            <div className={cx('section-header')}>
              <h2>
                <i className="fas fa-layer-group"></i>
                Danh mục
              </h2>
            </div>
            <div className={cx('categories')}>
              {categories.map(category => (
                <div 
                  key={category.id} 
                  className={cx('category-card', {
                    'locked': !canAccessFeature(category.minPlan)
                  })}
                >
                  <FontAwesomeIcon 
                    icon={category.icon} 
                    className={cx('category-icon')}
                    data-plan={category.minPlan}
                  />
                  <h3>{category.title}</h3>
                  <p>{category.description}</p>
                  {!canAccessFeature(category.minPlan) && (
                    <div className={cx('lock-overlay')}>
                      <FontAwesomeIcon icon={faLock} />
                      <span data-plan={category.minPlan}>Gói {category.minPlan}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={cx('section')}>
            <div className={cx('section-header')}>
              <h2>
                <i className="fas fa-file-alt"></i>
                Mẫu tài liệu
              </h2>
            </div>
            <div className={cx('templates-grid')}>
              {templates.map(template => (
                <div 
                  key={template.id} 
                  className={cx('template-card', {
                    'locked': !canAccessFeature(template.minPlan),
                    'early-access': template.earlyAccess
                  })}
                  onClick={() => handleTemplateClick(template)}
                >
                  <FontAwesomeIcon 
                    icon={template.icon} 
                    className={cx('template-icon')}
                    data-plan={template.minPlan}
                  />
                  <h3>{template.title}</h3>
                  {template.earlyAccess && (
                    <div className={cx('early-access-badge')}>
                      <FontAwesomeIcon icon={faRocket} />
                      <span>Sắp ra mắt</span>
                    </div>
                  )}
                  {!canAccessFeature(template.minPlan) && !template.earlyAccess && (
                    <div className={cx('lock-overlay')}>
                      <FontAwesomeIcon icon={faLock} />
                      <span data-plan={template.minPlan}>Gói {template.minPlan}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterMyServices;
