import React from 'react';
import classNames from 'classnames/bind';
import styles from './JobDetailModal.module.scss';
const cx = classNames.bind(styles);

const JobDetailModal = ({ isOpen, onClose, jobDetails }) => {
  if (!isOpen) return null;

  return (
    <div className={cx('modal-overlay')} onClick={onClose}>
      <div className={cx('modal-content')} onClick={(e) => e.stopPropagation()}>
        <div className={cx('modal-header')}>
          <h2 className={cx('modal-title')}>Chi tiết tin tuyển dụng</h2>
          <button className={cx('close-icon')} onClick={onClose}>×</button>
        </div>
        
        <div className={cx('job-details')}>
          <div className={cx('job-title-section')}>
            <h3 className={cx('job-title')}>{jobDetails?.title}</h3>
            <span className={cx('job-status', jobDetails?.status === 'Đang tuyển' ? 'active' : 'inactive')}>
              {jobDetails.status}
            </span>
          </div>
          
          <div className={cx('info-grid')}>
            <div className={cx('info-item')}>
              <div className={cx('info-label')}>Mức lương</div>
              <div className={cx('info-value')}>{jobDetails?.salary}</div>
            </div>
            <div className={cx('info-item')}>
              <div className={cx('info-label')}>Địa điểm</div>
              <div className={cx('info-value')}>{jobDetails?.location}</div>
            </div>
            <div className={cx('info-item')}>
              <div className={cx('info-label')}>Kinh nghiệm</div>
              <div className={cx('info-value')}>{jobDetails.experience}</div>
            </div>
            <div className={cx('info-item')}>
              <div className={cx('info-label')}>Hình thức làm việc</div>
              <div className={cx('info-value')}>{jobDetails.working_time}</div>
            </div>
            <div className={cx('info-item')}>
              <div className={cx('info-label')}>Cấp bậc</div>
              <div className={cx('info-value')}>{jobDetails.rank}</div>
            </div>
            <div className={cx('info-item')}>
              <div className={cx('info-label')}>Hạn nộp đơn</div>
              <div className={cx('info-value', 'deadline')}>
                {new Date(jobDetails.deadline).toLocaleDateString('en-US')}
              </div>
            </div>
          </div>
          
          <div className={cx('detail-section')}>
            <h4 className={cx('section-title')}>Mô tả công việc</h4>
            <p className={cx('section-content')}>{jobDetails.description}</p>
          </div>
          
          <div className={cx('detail-section')}>
            <h4 className={cx('section-title')}>Yêu cầu công việc</h4>
            <p className={cx('section-content')}>{jobDetails.job_requirements}</p>
          </div>
          
          <div className={cx('detail-section')}>
            <h4 className={cx('section-title')}>Quyền lợi</h4>
            <p className={cx('section-content')}>{jobDetails.benefits}</p>
          </div>
          
          <div className={cx('detail-section')}>
            <h4 className={cx('section-title')}>Địa điểm làm việc</h4>
            <p className={cx('section-content')}>{jobDetails.working_location}</p>
          </div>
          
          <div className={cx('detail-section')}>
            <h4 className={cx('section-title')}>Chuyên ngành</h4>
            <p className={cx('section-content')}>{jobDetails.category_id}</p>
          </div>
        </div>
        
        <div className={cx('modal-footer')}>
          <button className={cx('close-btn')} onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;
