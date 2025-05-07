// page pricing recruiter

import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Pricing.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faRocket, faCheck } from '@fortawesome/free-solid-svg-icons';
import { authAPI, recruiterApis } from '~/utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
const cx = classNames.bind(styles);

const PRICING_PLANS = {
  BASIC: {
    name: 'Basic',
    icon: faStar,
    price: 'Miễn phí',
    features: [
      'Đăng tin tuyển dụng cơ bản',
      'Tìm kiếm ứng viên cơ bản',
      'Xem hồ sơ ứng viên giới hạn',
      'Hỗ trợ qua email',
      'Không giới hạn thời gian sử dụng'
    ]
  },
  PROMAX: {
    name: 'ProMax',
    icon: faRocket,
    price: '999.000',
    features: [
      'Tất cả tính năng Basic',
      'Đăng tin tuyển dụng không giới hạn',
      'Tìm kiếm ứng viên nâng cao',
      'Xem hồ sơ ứng viên không giới hạn',
      'AI đề xuất ứng viên phù hợp',
      'Báo cáo phân tích chi tiết',
      'Tư vấn tuyển dụng 1-1',
      'Ưu tiên hiển thị tin tuyển dụng',
      'Hỗ trợ 24/7 qua chat',
      'Thời hạn 180 ngày'
    ]
  }
};

// Hàm tính số ngày còn lại
const getDaysLeft = (expiredAt) => {
  if (!expiredAt) return null;
  const now = new Date();
  const expired = new Date(expiredAt);
  // Đặt giờ về 0 để tính chính xác số ngày
  now.setHours(0,0,0,0);
  expired.setHours(0,0,0,0);
  const diff = expired - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
};

const PricingRecruiter = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [planExpiredAt, setPlanExpiredAt] = useState(null);

  

  useEffect(() => {
    const fetchCompanyPlan = async () => {
      try {
        setIsLoading(true);
        const responseCompany = await authAPI().get(recruiterApis.getAllRecruiterCompanies);
        setCurrentPlan(responseCompany.data.companies[0].plan);
        setPlanExpiredAt(responseCompany.data.companies[0].plan_expired_at);
        console.log(planExpiredAt);
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

        <div className={cx('pricing-grid', 'two-cols')}>
          {Object.values(PRICING_PLANS).map((plan, index) => {
            const isCurrentProMax = currentPlan === 'ProMax' && plan.name === 'ProMax';
            const daysLeft = isCurrentProMax ? getDaysLeft(planExpiredAt) : null;
            return (
              <div
                key={plan.name}
                className={cx('pricing-card', plan.name.toLowerCase(), {
                  'featured': plan.name === 'ProMax' && !isMobile
                })}
                style={{
                  '--animation-delay': isMobile ? '0s' : `${index * 0.2}s`
                }}
              >
                {plan.name === 'ProMax' && (
                  <div className={cx('popular-badge')}>
                    <span>Nổi bật</span>
                  </div>
                )}

                <div className={cx('card-header')}>
                  <FontAwesomeIcon icon={plan.icon} className={cx('plan-icon')} />
                  <h2>{plan.name}</h2>
                  <div className={cx('price')}>
                    {plan.price === 'Miễn phí' ? (
                      <span className={cx('amount', 'free')}>{plan.price}</span>
                    ) : (
                      <>
                        <span className={cx('currency')}>₫</span>
                        <span className={cx('amount')}>{plan.price}</span>
                        <span className={cx('period')}>/gói</span>
                      </>
                    )}
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
                  {isCurrentProMax ? (
                    <>
                      <button className={cx('subscribe-btn', 'current-plan-btn')} disabled>
                        Đang sử dụng
                      </button>
                      {daysLeft !== null && (
                        <div className={cx('plan-expired-text')}>
                          {daysLeft > 0 ? `Còn ${daysLeft} ngày` : 'Đã hết hạn'}
                        </div>
                      )}
                    </>
                  ) : (
                    <button className={cx('subscribe-btn')} style={{ '--plan-color': plan.color }}>
                      {plan.price === 'Miễn phí' ? 'Dùng ngay' : 'Đăng ký ngay'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PricingRecruiter;
