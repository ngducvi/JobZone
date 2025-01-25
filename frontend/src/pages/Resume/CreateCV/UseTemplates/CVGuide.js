import React from 'react';
import classNames from 'classnames/bind';
import styles from './UseTemplates.module.scss';

const cx = classNames.bind(styles);

const CVGuide = () => {
  return (
    <div className={cx('guide-content')}>
      <h3>Hướng dẫn viết CV hiệu quả</h3>
      <div className={cx('guide-section')}>
        <h4>1. Thông tin cá nhân</h4>
        <p>- Điền đầy đủ và chính xác thông tin cá nhân</p>
        <p>- Sử dụng email chuyên nghiệp</p>
      </div>
      <div className={cx('guide-section')}>
        <h4>2. Kinh nghiệm làm việc</h4>
        <p>- Liệt kê theo thứ tự thời gian mới nhất</p>
        <p>- Tập trung vào thành tích và kết quả đạt được</p>
      </div>
      {/* Thêm các phần hướng dẫn khác */}
    </div>
  );
};

export default CVGuide; 