// RecruiterReports

import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './RecruiterReports.module.scss';
import { authAPI, recruiterApis } from '~/utils/api';
import { FaUsers, FaFileAlt, FaCheck, FaTimes, FaChartBar, FaUserCheck } from 'react-icons/fa';
const cx = classNames.bind(styles);

const statusColors = {
  'Đang xét duyệt': '#3b82f6',
  'Chờ phỏng vấn': '#f59e0b',
  'Đã phỏng vấn': '#6366f1',
  'Đạt phỏng vấn': '#10b981',
  'Đã nhận': '#22d3ee',
  'Đã từ chối': '#ef4444',
  'Hết hạn': '#64748b',
};

const RecruiterReports = () => {
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Lấy tổng quan dashboard
        const resStats = await authAPI().get(recruiterApis.getDashboardStats);
        setStats(resStats.data);
        // Lấy danh sách job
        const resCompany = await authAPI().get(recruiterApis.getAllRecruiterCompanies);
        const companyId = resCompany.data.companies[0].company_id;
        const resJobs = await authAPI().get(recruiterApis.getAllJobsByCompanyId(companyId));
        setJobs(resJobs.data.jobs);
        // Lấy tất cả ứng viên của tất cả job
        let allApplications = [];
        for (const job of resJobs.data.jobs) {
          const resApps = await authAPI().get(recruiterApis.getAllJobApplicationsByJobId(job.job_id));
          allApplications = allApplications.concat(resApps.data.jobApplications.map(app => ({...app, job_title: job.title})));
        }
        setApplications(allApplications);
      } catch (err) {
        setError('Không thể tải dữ liệu báo cáo.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Thống kê ứng viên theo trạng thái
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  // Top job có nhiều ứng viên nhất
  const topJobs = jobs
    .map(job => ({
      ...job,
      totalApplications: applications.filter(app => app.job_id === job.job_id).length
    }))
    .sort((a, b) => b.totalApplications - a.totalApplications)
    .slice(0, 5);

  return (
    <div className={cx('wrapper')}>
      <h1>Báo cáo & Thống kê tuyển dụng</h1>
      {loading ? (
        <div className={cx('loading')}>Đang tải dữ liệu...</div>
      ) : error ? (
        <div className={cx('error')}>{error}</div>
      ) : (
        <>
          <div className={cx('stats-cards')}>
            <div className={cx('stat-card')}>
              <FaFileAlt className={cx('icon')} />
              <div>
                <div className={cx('stat-value')}>{stats?.totalJobs || 0}</div>
                <div className={cx('stat-label')}>Tổng số tin tuyển dụng</div>
              </div>
            </div>
            <div className={cx('stat-card')}>
              <FaUsers className={cx('icon')} />
              <div>
                <div className={cx('stat-value')}>{stats?.totalApplications || 0}</div>
                <div className={cx('stat-label')}>Tổng số ứng viên</div>
              </div>
            </div>
            <div className={cx('stat-card')}>
              <FaCheck className={cx('icon')} />
              <div>
                <div className={cx('stat-value')}>{statusCounts['Đã nhận'] || 0}</div>
                <div className={cx('stat-label')}>Ứng viên đã nhận</div>
              </div>
            </div>
            <div className={cx('stat-card')}>
              <FaTimes className={cx('icon')} />
              <div>
                <div className={cx('stat-value')}>{statusCounts['Đã từ chối'] || 0}</div>
                <div className={cx('stat-label')}>Ứng viên bị từ chối</div>
              </div>
            </div>
            <div className={cx('stat-card')}>
              <FaChartBar className={cx('icon')} />
              <div>
                <div className={cx('stat-value')}>{stats?.totalActiveJobs || 0}</div>
                <div className={cx('stat-label')}>Tin đang hiển thị</div>
              </div>
            </div>
          </div>

          <div className={cx('section')}>
            <h2>Thống kê ứng viên theo trạng thái</h2>
            <div className={cx('status-stats')}>
              {Object.keys(statusCounts).map(status => (
                <div key={status} className={cx('status-card')} style={{borderColor: statusColors[status]}}>
                  <span className={cx('status-label')} style={{color: statusColors[status]}}>{status}</span>
                  <span className={cx('status-value')}>{statusCounts[status]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={cx('section')}>
            <h2>Top tin tuyển dụng có nhiều ứng viên nhất</h2>
            <table className={cx('jobs-table')}>
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Địa điểm</th>
                  <th>Ngày đăng</th>
                  <th>Số ứng viên</th>
                </tr>
              </thead>
              <tbody>
                {topJobs.map(job => (
                  <tr key={job.job_id}>
                    <td>{job.title}</td>
                    <td>{job.location}</td>
                    <td>{new Date(job.created_at).toLocaleDateString('vi-VN')}</td>
                    <td>{job.totalApplications}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={cx('section')}>
            <h2>Danh sách ứng viên gần đây</h2>
            <table className={cx('apps-table')}>
              <thead>
                <tr>
                  <th>Tên ứng viên</th>
                  <th>Vị trí ứng tuyển</th>
                  <th>Trạng thái</th>
                  <th>Ngày nộp</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 10).map(app => (
                  <tr key={app.application_id}>
                    <td>{app.user?.name || 'N/A'}</td>
                    <td>{app.job_title}</td>
                    <td style={{color: statusColors[app.status]}}>{app.status}</td>
                    <td>{new Date(app.created_at).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default RecruiterReports;
