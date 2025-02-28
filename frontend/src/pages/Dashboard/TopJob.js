// Component này sẽ hiển thị các công việc nổi bật trên dashboard

import React, { useEffect, useState } from 'react'
import classNames from 'classnames/bind'
import { Link, useNavigate } from 'react-router-dom'
import styles from './TopJob.module.scss'
import { authAPI, userApis } from '~/utils/api'

const cx = classNames.bind(styles)

const LOCATIONS = {
  "Ngẫu Nhiên": "random",
  "Hà Nội": "hanoi",
  "Thành phố Hồ Chí Minh": "hcm",
  "Miền Bắc": "north",
  "Miền Nam": "south"
}

const TopJob = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [jobs, setJobs] = useState([])
  const [selectedLocation, setSelectedLocation] = useState("random")
  const [savedStatus, setSavedStatus] = useState({});

  const getRandomAvatarId = () => Math.floor(Math.random() * 1000) + 1

  const fetchData = async () => {
    try {
      const result = await authAPI().get(userApis.getAllJobs, {
        params: { 
          page: activePage,
          location: selectedLocation 
        },
      })
      console.log("result",result.data.jobs)
      // Add random avatar URLs to each job
      const jobsWithAvatars = result.data.jobs.map(job => ({
        ...job,
        company_logo: `https://i.pravatar.cc/${getRandomAvatarId()}`
      }))
      setJobs(jobsWithAvatars)
      console.log("jobsWithAvatars",jobsWithAvatars)
      setTotalPages(result.data.totalPages)
    } catch (error) {
      console.error("Error fetching jobs:", error)
    }
  }

  const handleJobClick = async (jobId) => {
    try {
      await authAPI().post(userApis.addViewedJob(jobId));
      navigate(`/jobs/${jobId}`);
    } catch (error) {
      console.error('Error adding to viewed jobs:', error);
      navigate(`/jobs/${jobId}`);
    }
  };

  const handleSaveJob = async (e, jobId) => {
    e.stopPropagation(); // Ngăn chặn việc chuyển trang khi click vào nút save
    if (!jobId) {
      console.error('Invalid job ID');
      return;
    }

    try {
      if (savedStatus[jobId]) {
        await authAPI().delete(userApis.unsaveJob(jobId));
        setSavedStatus(prev => ({...prev, [jobId]: false}));
      } else {
        await authAPI().post(userApis.saveJob(jobId));
        setSavedStatus(prev => ({...prev, [jobId]: true}));
      }
    } catch (error) {
      console.error("Error toggling job save status:", error);
      if (error.response?.data?.message === 'Bạn đã lưu công việc này rồi') {
        setSavedStatus(prev => ({...prev, [jobId]: true}));
      }
    }
  };

  useEffect(() => {
    fetchData()
  }, [activePage, selectedLocation])

  useEffect(() => {
    const fetchSavedStatus = async () => {
      try {
        const response = await authAPI().get(userApis.getAllSavedJobsByUser);
        const initialSavedStatus = {};
        response.data.savedJobs.forEach(job => {
          initialSavedStatus[job.job_id] = true;
        });
        setSavedStatus(initialSavedStatus);
      } catch (error) {
        console.error("Error fetching saved status:", error);
      }
    };
    fetchSavedStatus();
  }, []);

  return (
    <div className={cx('wrapper')}>
        <div className={cx('header')}>
            <h1>Top Job</h1>
        </div>
      {/* Location Filter */}
      <div className={cx('filter-section')}>
        <div className={cx('filter-label')}>
          <i className="fa-solid fa-location-dot"></i>
          Lọc theo:
        </div>
        <div className={cx('location-filters')}>
          {Object.keys(LOCATIONS).map((location) => (
            <button
              key={location}
              className={cx('location-btn', { active: LOCATIONS[location] === selectedLocation })}
              onClick={() => setSelectedLocation(LOCATIONS[location])}
            >
              {location}
            </button>
          ))}
        </div>
      </div>

      {/* Job Grid */}
      <div className={cx('job-grid')}>
        {jobs.map((job) => (
          <div key={job.job_id} 
               className={cx('job-card')}
               onClick={() => handleJobClick(job.job_id)}>
            <div className={cx('company-logo')}>
              <img src={job.company_logo} alt={job.company_name} />
            </div>
            <div className={cx('job-content')}>
              <Link to={`/jobs/${job.job_id}`} className={cx('job-title')}>
                {job.title}
              </Link>
              <div className={cx('company-name')}>
                <i className="fa-solid fa-building"></i>
                {job.company_name}
              </div>
              <div className={cx('job-info')}>
                <div className={cx('info-item')}>
                  <i className="fa-solid fa-sack-dollar"></i>
                  {job.salary || "Thỏa thuận"}
                </div>
                <div className={cx('info-item')}>
                  <i className="fa-solid fa-location-dot"></i>
                  {job.location}
                </div>
                <div className={cx('info-item')}>
                  <i className="fa-regular fa-clock"></i>
                  {job.deadline || "Đang cập nhật"}
                </div>
              </div>
              <div className={cx('job-tags')}>
                {job.tags?.map((tag, index) => (
                  <span key={index} className={cx('tag')}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button 
              className={cx('save-btn', { 'saved': savedStatus[job.job_id] })}
              onClick={(e) => handleSaveJob(e, job.job_id)}
            >
              <i className={`fa-${savedStatus[job.job_id] ? 'solid' : 'regular'} fa-heart`}></i>
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={cx('pagination')}>
          <button 
            className={cx('page-btn', { disabled: activePage === 1 })}
            onClick={() => activePage > 1 && setActivePage(activePage - 1)}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={cx('page-btn', { active: activePage === index + 1 })}
              onClick={() => setActivePage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button 
            className={cx('page-btn', { disabled: activePage === totalPages })}
            onClick={() => activePage < totalPages && setActivePage(activePage + 1)}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  )
}

export default TopJob