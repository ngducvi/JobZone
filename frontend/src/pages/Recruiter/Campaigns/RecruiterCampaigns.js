// RecruiterCampaigns

import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './RecruiterCampaigns.module.scss';
import { authAPI, recruiterApis } from '~/utils/api';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

const RecruiterCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const campaignStatuses = {
    active: { label: 'Đang diễn ra', color: '#10b981' },
    scheduled: { label: 'Đã lên lịch', color: '#f59e0b' },
    completed: { label: 'Đã kết thúc', color: '#6b7280' },
    draft: { label: 'Bản nháp', color: '#9ca3af' }
  };

  return (
    <div className={cx('wrapper')}>
      <div className={cx('header')}>
        <div className={cx('title-section')}>
          <h1>Chiến dịch tuyển dụng</h1>
          <button 
            className={cx('create-campaign-btn')}
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus"></i>
            Tạo chiến dịch mới
          </button>
        </div>

        <div className={cx('stats-cards')}>
          <div className={cx('stat-card')}>
            <div className={cx('stat-icon', 'active')}>
              <i className="fas fa-bullhorn"></i>
            </div>
            <div className={cx('stat-info')}>
              <h3>Chiến dịch đang diễn ra</h3>
              <p>5 chiến dịch</p>
            </div>
          </div>

          <div className={cx('stat-card')}>
            <div className={cx('stat-icon', 'applications')}>
              <i className="fas fa-users"></i>
            </div>
            <div className={cx('stat-info')}>
              <h3>Tổng số ứng viên</h3>
              <p>125 ứng viên</p>
            </div>
          </div>

          <div className={cx('stat-card')}>
            <div className={cx('stat-icon', 'success')}>
              <i className="fas fa-check-circle"></i>
            </div>
            <div className={cx('stat-info')}>
              <h3>Tuyển dụng thành công</h3>
              <p>32 ứng viên</p>
            </div>
          </div>
        </div>
      </div>

      <div className={cx('campaigns-list')}>
        <div className={cx('filters')}>
          <div className={cx('search-box')}>
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Tìm kiếm chiến dịch..." />
          </div>
          
          <div className={cx('filter-options')}>
            <select className={cx('filter-select')}>
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang diễn ra</option>
              <option value="scheduled">Đã lên lịch</option>
              <option value="completed">Đã kết thúc</option>
              <option value="draft">Bản nháp</option>
            </select>

            <select className={cx('filter-select')}>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>

        <div className={cx('campaigns-grid')}>
          {/* Campaign cards will be mapped here */}
        </div>
      </div>
    </div>
  );
};

export default RecruiterCampaigns;
