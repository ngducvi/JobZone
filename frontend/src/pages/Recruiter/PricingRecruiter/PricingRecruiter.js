// page pricing recruiter

import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Pricing.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCrown, faGem, faCheck } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

const PRICING_PLANS = {
  BASIC: {
    name: 'Basic',
    icon: faStar,
    price: '299.000',
    features: [
      'Đăng tin tuyển dụng cơ bản',
      'Tìm kiếm ứng viên cơ bản',
      'Xem hồ sơ ứng viên giới hạn',
      'Hỗ trợ qua email',
      'Thời hạn 30 ngày'
    ]
  },
  PRO: {
    name: 'Pro',
    icon: faCrown,
    price: '599.000',
    features: [
      'Tất cả tính năng Basic',
      'Đăng tin tuyển dụng không giới hạn',
      'Tìm kiếm ứng viên nâng cao',
      'Xem hồ sơ ứng viên không giới hạn',
      'Ưu tiên hiển thị tin tuyển dụng',
      'Hỗ trợ 24/7 qua chat',
      'Thời hạn 90 ngày'
    ]
  },
  PREMIUM: {
    name: 'Premium',
    icon: faGem,
    price: '999.000',
    features: [
      'Tất cả tính năng Pro',
      'Tiếp cận ứng viên chất lượng cao',
      'AI đề xuất ứng viên phù hợp',
      'Báo cáo phân tích chi tiết',
      'Tư vấn tuyển dụng 1-1',
      'Ưu tiên cao nhất',
      'Thời hạn 180 ngày'
    ]
  }
};

const PricingRecruiter = () => {
  // Thêm state để theo dõi viewport
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Theo dõi thay đổi kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={cx('wrapper')}>
      <div className={cx('background-shapes')}>
        <div className={cx('shape', 'shape-1')}></div>
        <div className={cx('shape', 'shape-2')}></div>
        <div className={cx('shape', 'shape-3')}></div>
      </div>
      
      <div className={cx('container')}>
        <div className={cx('header')}>
          <h1>Chọn gói dịch vụ phù hợp với bạn</h1>
          <p>Nâng cao hiệu quả tuyển dụng với các gói dịch vụ đa dạng của chúng tôi</p>
        </div>

        <div className={cx('pricing-grid')}>
          {Object.values(PRICING_PLANS).map((plan, index) => (
            <div 
              key={plan.name} 
              className={cx('pricing-card', plan.name.toLowerCase(), {
                'featured': plan.name === 'Pro' && !isMobile
              })}
              style={{
                '--animation-delay': isMobile ? '0s' : `${index * 0.2}s`
              }}
            >
              {plan.name === 'Pro' && (
                <div className={cx('popular-badge')}>
                  <span>Phổ biến</span>
                </div>
              )}
              
              <div className={cx('card-header')} style={{ background: plan.color }}>
                <FontAwesomeIcon icon={plan.icon} className={cx('plan-icon')} />
                <h2>{plan.name}</h2>
                <div className={cx('price')}>
                  <span className={cx('currency')}>₫</span>
                  <span className={cx('amount')}>{plan.price}</span>
                  <span className={cx('period')}>/tháng</span>
                </div>
              </div>

              <div className={cx('card-content')}>
                <ul className={cx('features-list')}>
                  {plan.features.map((feature, index) => (
                    <li key={index}>
                      <FontAwesomeIcon icon={faCheck} className={cx('check-icon')} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={cx('subscribe-btn')} style={{ '--plan-color': plan.color }}>
                  Đăng ký ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingRecruiter;
