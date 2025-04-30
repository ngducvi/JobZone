// AITools page
import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './AITools.module.scss';
import { FaMicrophone, FaUserTie, FaEnvelope, FaUserCircle, FaRobot } from 'react-icons/fa';

const cx = classNames.bind(styles);

const AITools = () => {
  const tools = [
    {
      title: 'AI Chatbot Tư Vấn',
      description: 'Trò chuyện và nhận tư vấn trực tiếp từ AI về nghề nghiệp, kỹ năng và định hướng',
      icon: <FaRobot className={cx('icon')} />,
      path: '/tools/ai-chat',
      color: '#2563eb'
    },
    {
      title: 'Luyện Tập Phỏng Vấn',
      description: 'Thực hành phỏng vấn với AI và nhận phản hồi để cải thiện kỹ năng',
      icon: <FaMicrophone className={cx('icon')} />,
      path: '/tools/interview-prep',
      color: '#013a74'
    },
    {
      title: 'Tư Vấn Nghề Nghiệp',
      description: 'Nhận tư vấn và định hướng nghề nghiệp cá nhân hóa từ AI',
      icon: <FaUserTie className={cx('icon')} />,
      path: '/tools/career-counseling',
      color: '#02a346'
    },
    {
      title: 'Tạo Email Chuyên Nghiệp',
      description: 'Tạo email chuyên nghiệp với sự hỗ trợ của AI',
      icon: <FaEnvelope className={cx('icon')} />,
      path: '/tools/create-email',
      color: '#6b46c1'
    },
    {
      title: 'Phát Triển Thương Hiệu Cá Nhân',
      description: 'Xây dựng và nâng cao thương hiệu cá nhân với AI',
      icon: <FaUserCircle className={cx('icon')} />,
      path: '/tools/personal-brand',
      color: '#d97706'
    }
  ];

  return (
    <div className={cx('wrapper')}>
      <div className={cx('container')}>
        <div className={cx('header')}>
          <h1 className={cx('title')}>Công Cụ Hỗ Trợ Nghề Nghiệp với AI</h1>
          <p className={cx('subtitle')}>Nâng cao hiệu quả tìm việc và phát triển sự nghiệp với các công cụ thông minh</p>
        </div>

        <div className={cx('tools-grid')}>
          {tools.map((tool, index) => (
            <Link 
              to={tool.path} 
              key={index} 
              className={cx('tool-card')}
              style={{ '--card-color': tool.color }}
            >
              <div className={cx('card-header')}>
                <div className={cx('icon-wrapper')}>
                  {tool.icon}
                </div>
                <h2 className={cx('card-title')}>{tool.title}</h2>
              </div>
              <p className={cx('card-description')}>{tool.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AITools;
