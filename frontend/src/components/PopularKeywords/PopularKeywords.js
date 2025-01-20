import React from 'react';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import styles from './PopularKeywords.module.scss';

const cx = classNames.bind(styles);

const PopularKeywords = () => {
  const sections = [
    {
      title: 'Tìm việc làm theo ngành nghề',
      links: [
        { text: 'Việc làm An toàn lao động', url: '/viec-lam-an-toan-lao-dong' },
        { text: 'Việc làm Bán hàng kỹ thuật', url: '/viec-lam-ban-hang-ky-thuat' },
        { text: 'Việc làm Bán lẻ / bán sỉ', url: '/viec-lam-ban-le-ban-si' },
        { text: 'Việc làm Bảo hiểm', url: '/viec-lam-bao-hiem' },
        { text: 'Việc làm Bất động sản', url: '/viec-lam-bat-dong-san' },
        { text: 'Việc làm Biên / Phiên dịch', url: '/viec-lam-bien-phien-dich' },
        { text: 'Việc làm Bưu chính - Viễn thông', url: '/viec-lam-buu-chinh-vien-thong' },
      ]
    },
    {
      title: 'Tìm việc làm tại nhà',
      links: [
        { text: 'Việc làm tại Hà Nội', url: '/viec-lam-tai-ha-noi' },
        { text: 'Việc làm tại Hồ Chí Minh', url: '/viec-lam-tai-ho-chi-minh' },
        { text: 'Việc làm tại Bình Dương', url: '/viec-lam-tai-binh-duong' },
        { text: 'Việc làm tại Bắc Ninh', url: '/viec-lam-tai-bac-ninh' },
        { text: 'Việc làm tại Đồng Nai', url: '/viec-lam-tai-dong-nai' },
        { text: 'Việc làm tại Hưng Yên', url: '/viec-lam-tai-hung-yen' },
        { text: 'Việc làm tại Hải Dương', url: '/viec-lam-tai-hai-duong' },
      ]
    },
    {
      title: 'Việc làm phổ biến',
      links: [
        { text: 'Tìm việc làm Copywriter', url: '/tim-viec-lam-copywriter' },
        { text: 'Tìm việc làm Content Creator', url: '/tim-viec-lam-content-creator' },
        { text: 'Tìm việc làm Social Content', url: '/tim-viec-lam-social-content' },
        { text: 'Tìm việc làm Biên phiên dịch tiếng Anh', url: '/tim-viec-lam-bien-phien-dich-tieng-anh' },
        { text: 'Tìm việc làm Giảng viên tiếng Anh', url: '/tim-viec-lam-giang-vien-tieng-anh' },
        { text: 'Tìm việc làm Trợ giảng tiếng Anh', url: '/tim-viec-lam-tro-giang-tieng-anh' },
        { text: 'Tìm việc làm Kế toán nội bộ', url: '/tim-viec-lam-ke-toan-noi-bo' },
      ]
    }
  ];

  return (
    <div className={cx('wrapper')}>
      <h2 className={cx('title')}>Từ khóa tìm việc làm phổ biến tại TopCV</h2>
      <div className={cx('content')}>
        {sections.map((section, index) => (
          <div key={index} className={cx('section')}>
            <h3 className={cx('section-title')}>{section.title}</h3>
            <ul className={cx('link-list')}>
              {section.links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <Link to={link.url}>{link.text}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularKeywords; 