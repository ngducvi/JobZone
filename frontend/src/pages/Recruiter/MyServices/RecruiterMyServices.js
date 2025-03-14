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
  faLock
} from '@fortawesome/free-solid-svg-icons';
import { authAPI, recruiterApis } from '~/utils/api';

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
    minPlan: 'Pro'
  },
  {
    id: 3,
    icon: faChartLine,
    title: 'Phát triển',
    description: 'Đánh giá hiệu suất, kế hoạch phát triển',
    minPlan: 'ProMax'
  }
];

const templates = [
  {
    id: 1,
    icon: faFileLines,
    title: 'Tạo mô tả công việc (JD)',
    minPlan: 'Basic'
  },
  {
    id: 2,
    icon: faUserCheck,
    title: 'Đánh giá CV ứng viên',
    minPlan: 'Basic'
  },
  {
    id: 3,
    icon: faBook,
    title: 'Tạo kế hoạch đào tạo',
    minPlan: 'Pro'
  },
  {
    id: 4,
    icon: faEnvelope,
    title: 'Viết email tuyển dụng',
    minPlan: 'Basic'
  },
  {
    id: 5,
    icon: faChartBar,
    title: 'Đánh giá hiệu suất nhân viên',
    minPlan: 'Pro'
  },
  {
    id: 6,
    icon: faFileContract,
    title: 'Tạo chính sách nhân sự',
    minPlan: 'Pro'
  },
  {
    id: 7,
    icon: faPieChart,
    title: 'Báo cáo & phân tích HR',
    minPlan: 'ProMax'
  },
  {
    id: 8,
    icon: faQuestion,
    title: 'Tạo bài kiểm tra kiến thức',
    minPlan: 'ProMax'
  },
  {
    id: 9,
    icon: faHandshake,
    title: 'Quản lý xung đột & khiếu nại',
    minPlan: 'ProMax'
  }
];

const planLevels = {
  'Basic': 1,
  'Pro': 2,
  'ProMax': 3
};

const RecruiterMyServices = () => {
  const [currentPlan, setCurrentPlan] = useState('Basic');

  useEffect(() => {
    const fetchCompanyPlan = async () => {
      try {
        const responseCompany = await authAPI().get(recruiterApis.getAllRecruiterCompanies);
        setCurrentPlan(responseCompany.data.companies[0].plan);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCompanyPlan();
  }, []);

  const canAccessFeature = (minPlan) => {
    return planLevels[currentPlan] >= planLevels[minPlan];
  };

  const handleTemplateClick = (template) => {
    if (!canAccessFeature(template.minPlan)) {
      alert(`Tính năng này chỉ khả dụng cho gói ${template.minPlan} trở lên`);
      return;
    }
    // Xử lý click template
    console.log(`Clicked template: ${template.title}`);
  };

  return (
    <div className={cx('wrapper')}>
      <div className={cx('header')}>
        <h1>HR TEMPLATES</h1>
        <p>Bộ công cụ AI hỗ trợ HR chuyên nghiệp giúp tối ưu hóa quy trình tuyển dụng, đào tạo và phát triển nhân sự</p>
      </div>

      <div className={cx('categories')}>
        {categories.map(category => (
          <div 
            key={category.id} 
            className={cx('category-card', {
              'locked': !canAccessFeature(category.minPlan)
            })}
          >
            <FontAwesomeIcon icon={category.icon} className={cx('category-icon')} />
            <h2>{category.title}</h2>
            <p>{category.description}</p>
            {!canAccessFeature(category.minPlan) && (
              <div className={cx('lock-overlay')}>
                <FontAwesomeIcon icon={faLock} />
                <p>Gói {category.minPlan}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={cx('templates-grid')}>
        {templates.map(template => (
          <div 
            key={template.id} 
            className={cx('template-card', {
              'locked': !canAccessFeature(template.minPlan)
            })}
            onClick={() => handleTemplateClick(template)}
          >
            <FontAwesomeIcon icon={template.icon} className={cx('template-icon')} />
            <h3>{template.title}</h3>
            {!canAccessFeature(template.minPlan) && (
              <div className={cx('lock-overlay')}>
                <FontAwesomeIcon icon={faLock} />
                <p>Gói {template.minPlan}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecruiterMyServices;
