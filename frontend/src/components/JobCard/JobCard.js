import React from 'react';
import classNames from 'classnames/bind';
import styles from './JobCard.module.scss';

const cx = classNames.bind(styles);

const JobCard = ({ title, company, salary, location, logo }) => {
  return (
    <div className={cx('job-card')}>
      <div className={cx('logo')}>
        <img src={logo} alt={company} />
      </div>
      <div className={cx('content')}>
        <h3 className={cx('title')}>{title}</h3>
        <p className={cx('company')}>{company}</p>
        <div className={cx('details')}>
          <span className={cx('salary')}>{salary}</span>
          <span className={cx('location')}>{location}</span>
        </div>
      </div>
    </div>
  );
};

export default JobCard; 