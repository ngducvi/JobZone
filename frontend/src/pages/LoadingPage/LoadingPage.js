import React from 'react';
import classNames from 'classnames/bind';
import styles from './LoadingPage.module.scss';
import images from '~/assets/images';

const cx = classNames.bind(styles);

const LoadingPage = () => {
  return (
    <div className={cx('loading-container')}>
      <div className={cx('loading-content')}>
        <div className={cx('logo-container')}>
          <img src={images.logo} alt="Logo" className={cx('logo')} />
          <div className={cx('logo-shadow')}></div>
        </div>

        <div className={cx('loading-animation')}>
          <div className={cx('circle-container')}>
            {[...Array(8)].map((_, index) => (
              <div key={index} className={cx('circle')} style={{ '--i': index }}></div>
            ))}
          </div>
          
          <div className={cx('progress-ring')}>
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" />
            </svg>
          </div>
        </div>

        <div className={cx('loading-text')}>
          <div className={cx('text-content')}>
            <span className={cx('main-text')}>Đang tải</span>
            <div className={cx('dots')}>
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </div>
          </div>
          <span className={cx('sub-text')}>Vui lòng đợi trong giây lát</span>
        </div>

        <div className={cx('loading-stats')}>
          <div className={cx('stat-item')}>
            <i className="fas fa-briefcase"></i>
            <span>1000+ việc làm IT</span>
          </div>
          <div className={cx('stat-item')}>
            <i className="fas fa-building"></i>
            <span>500+ công ty hàng đầu</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
