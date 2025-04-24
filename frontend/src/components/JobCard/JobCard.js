import React from 'react';
import classNames from 'classnames/bind';
import styles from './JobCard.module.scss';

const cx = classNames.bind(styles);

const JobCard = ({ job, onClick, onSave, isSaved }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    if (onSave) {
      onSave(job.job_id);
    }
  };

  return (
    <div className={cx('job-card')} onClick={onClick}>
      <div className={cx('company-logo')}>
        <img src={job.company_logo} alt={job.company_name} />
      </div>
      
      <div className={cx('job-content')}>
        <h3 className={cx('job-title')}>{job.title}</h3>
        
        <div className={cx('company-name')}>
          <i className="fa-solid fa-building"></i>
          <span>{job.company_name}</span>
        </div>

        <div className={cx('job-info')}>
          <div className={cx('info-item')}>
            <i className="fa-solid fa-sack-dollar"></i>
            <span>{job.salary || "Thỏa thuận"}</span>
          </div>

          <div className={cx('info-item')}>
            <i className="fa-solid fa-location-dot"></i>
            <span>{job.location}</span>
          </div>

          <div className={cx('info-item')}>
            <i className="fa-regular fa-clock"></i>
            <span>{formatDate(job.deadline)}</span>
          </div>
        </div>

        {job.tags && job.tags.length > 0 && (
          <div className={cx('job-tags')}>
            {job.tags.map((tag, index) => (
              <span key={index} className={cx('tag')}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <button 
        className={cx('save-btn', { saved: isSaved })}
        onClick={handleSaveClick}
      >
        <i className={`fa-${isSaved ? 'solid' : 'regular'} fa-heart`}></i>
      </button>
    </div>
  );
};

export default JobCard; 