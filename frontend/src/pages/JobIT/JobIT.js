import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './JobIT.module.scss';
import images from '~/assets/images';
import { authAPI, userApis } from "~/utils/api";
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

const JobIT = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedSalary, setSelectedSalary] = useState('all');
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [topCompany, setTopCompany] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("list"); // 'list' or 'top'
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [filterType, setFilterType] = useState('newest'); // 'newest', 'urgent', 'salary'
  const [categories, setCategories] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [savedStatus, setSavedStatus] = useState({});

  // Filter buttons data
  const filterButtons = [
    {
      id: 'newest',
      label: 'Tin mới nhất',
    },
    {
      id: 'urgent',
      label: 'Cần tuyển gấp',
    },
    {
      id: 'salary',
      label: 'Lương cao nhất',
    },
  ];

  // Danh sách ID của các categories liên quan đến IT
  const IT_CATEGORY_IDS = [
    '1f25e3ee-ce9e-11ef-9430-2cf05db24bc7', // Software Engineering
    '1f25e912-ce9e-11ef-9430-2cf05db24bc7', // Data Science
    '1f25ef7a-ce9e-11ef-9430-2cf05db24bc7', // Web Development
    '1f25f02b-ce9e-11ef-9430-2cf05db24bc7', // Mobile Development
    '1f25f0db-ce9e-11ef-9430-2cf05db24bc7', // Cybersecurity
    '1f25f189-ce9e-11ef-9430-2cf05db24bc7', // Business Analyst
  ];

  // Thêm mapping cho tên categories
  const CATEGORY_NAMES = {
    '1f25e3ee-ce9e-11ef-9430-2cf05db24bc7': {
      name: 'Software Engineering',
      icon: 'fas fa-code'
    },
    '1f25e912-ce9e-11ef-9430-2cf05db24bc7': {
      name: 'Data Science',
      icon: 'fas fa-database'
    },
    '1f25ef7a-ce9e-11ef-9430-2cf05db24bc7': {
      name: 'Web Development',
      icon: 'fas fa-globe'
    },
    '1f25f02b-ce9e-11ef-9430-2cf05db24bc7': {
      name: 'Mobile Development',
      icon: 'fas fa-mobile-alt'
    },
    '1f25f0db-ce9e-11ef-9430-2cf05db24bc7': {
      name: 'Cybersecurity',
      icon: 'fas fa-shield-alt'
    },
    '1f25f189-ce9e-11ef-9430-2cf05db24bc7': {
      name: 'Business Analyst',
      icon: 'fas fa-chart-line'
    }
  };

  useEffect(() => {
    const fetchTopCompany = async () => {
      const response = await authAPI().get(userApis.getAllTopCompany, {
        params: {
          page: activePage,
        },
      });
      setTopCompany(response.data.topCompany);
      console.log(response.data.topCompany);
      setTotalPages(response.data.totalPages);
    };
    fetchTopCompany();
  }, [activePage]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsResponse, categoriesResponse] = await Promise.all([
          authAPI().get(userApis.getAllJobs),
          authAPI().get(userApis.getAllCategories)
        ]);

        // Lọc jobs theo IT categories
        const itJobs = jobsResponse.data.jobs.filter(job => 
          IT_CATEGORY_IDS.includes(job.category_id)
        );
        setJobs(itJobs);
        console.log(itJobs);
        setFilteredJobs(itJobs);

        // Lọc và đếm số lượng jobs cho mỗi IT category
        const itCategories = categoriesResponse.data.categories
          .filter(cat => IT_CATEGORY_IDS.includes(cat.category_id))
          .map(cat => ({
            ...cat,
            name: CATEGORY_NAMES[cat.category_id].name,
            icon: CATEGORY_NAMES[cat.category_id].icon,
            jobCount: itJobs.filter(job => job.category_id === cat.category_id).length
          }));
        setCategories(itCategories);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const savedResponse = await authAPI().get(userApis.getAllSavedJobsByUser);
        const initialSavedStatus = {};
        savedResponse.data.savedJobs.forEach(job => {
          initialSavedStatus[job.job_id] = true;
        });
        setSavedStatus(initialSavedStatus);
      } catch (error) {
        console.error("Error fetching saved jobs:", error);
      }
    };
    fetchSavedJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search logic here
  };

  // Handle filter change
  const handleFilterChange = (type) => {
    setFilterType(type);
    // Implement filter logic here
    let filteredJobs = [...topCompany];
    
    switch(type) {
      case 'newest':
        // filteredJobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'urgent':
        filteredJobs = filteredJobs.filter(job => job.is_urgent);
        break;
      case 'salary':
        filteredJobs.sort((a, b) => b.salary_max - a.salary_max);
        break;
      default:
        break;
    }
    
    setTopCompany(filteredJobs);
  };

  // Thêm hàm xử lý click category
  const handleCategoryClick = (categoryId) => {
    if (selectedCategory === categoryId) {
      // Nếu click vào category đang được chọn, bỏ chọn và hiển thị tất cả jobs
      setSelectedCategory(null);
      setFilteredJobs(jobs);
    } else {
      // Nếu click vào category mới, lọc jobs theo category đó
      setSelectedCategory(categoryId);
      const filtered = jobs.filter(job => job.category_id === categoryId);
      setFilteredJobs(filtered);
    }
  };

  const handleSaveJob = async (e, jobId) => {
    e.stopPropagation();
    if (!jobId) return;

    try {
      if (savedStatus[jobId]) {
        await authAPI().delete(userApis.unsaveJob(jobId));
        setSavedStatus(prev => ({...prev, [jobId]: false}));
      } else {
        await authAPI().post(userApis.saveJob(jobId));
        setSavedStatus(prev => ({...prev, [jobId]: true}));
      }
      window.dispatchEvent(new Event('user-data-update'));
    } catch (error) {
      console.error("Error toggling job save status:", error);
      if (error.response?.data?.message === 'Bạn đã lưu công việc này rồi') {
        setSavedStatus(prev => ({...prev, [jobId]: true}));
      }
    }
  };

  const handleJobClick = async (jobId) => {
    try {
      // Thêm job vào viewed jobs
      await authAPI().post(userApis.addViewedJob(jobId));
      // Chuyển hướng đến trang chi tiết
      navigate(`/jobs/${jobId}`);
    } catch (error) {
      console.error("Error adding viewed job:", error);
    }
  };

  return (
    <div className={cx('wrapper')}>
      {/* Header Section */}
      <div className={cx('header')}>
        <h1>Việc làm IT</h1>
        <p>Việc làm IT xịn dành cho Developer chất</p>
        <div className={cx('tags')}>
          <span className={cx('tag')}>Backend</span>
          <span className={cx('tag')}>Frontend</span>
          <span className={cx('tag')}>Tester</span>
          <span className={cx('tag')}>Business Analyst</span>
        </div>
      </div>

      {/* Search Section */}
      <div className={cx('search-section')}>
        <div className={cx('icon-wrapper')}>
          <i className="fas fa-search"></i>
          <input 
            className={cx('form-control')}
            type="text" 
            placeholder="Tên công việc, vị trí bạn muốn ứng tuyển..." 
          />
        </div>
        <div className={cx('icon-wrapper')}>
          <i className="fas fa-building"></i>
          <select 
            className={cx('form-control')}
            value={selectedLocation} 
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="all">Tất cả tỉnh vực</option>
            <option value="hanoi">Hà Nội</option>
            <option value="hcm">Hồ Chí Minh</option>
          </select>
        </div>
        <div className={cx('icon-wrapper')}>
          <i className="fas fa-layer-group"></i>
          <select 
            className={cx('form-control')}
            value={selectedLevel} 
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="all">Tất cả cấp bậc</option>
            <option value="intern">Thực tập sinh</option>
            <option value="fresher">Fresher</option>
            <option value="junior">Junior</option>
            <option value="senior">Senior</option>
          </select>
        </div>
        <div className={cx('icon-wrapper')}>
          <i className="fas fa-money-bill"></i>
          <select 
            className={cx('form-control')}
            value={selectedSalary} 
            onChange={(e) => setSelectedSalary(e.target.value)}
          >
            <option value="all">Tất cả mức lương</option>
            <option value="10-15">10-15 triệu</option>
            <option value="15-20">15-20 triệu</option>
            <option value="20-25">20-25 triệu</option>
            <option value="25+">Trên 25 triệu</option>
          </select>
        </div>
        <button className={cx('btn', 'btn-primary')}>
          <i className="fas fa-search"></i>
          Tìm kiếm
        </button>
      </div>

      {/* Categories */}
      <div className={cx('categories')}>
        {categories.map((category) => (
          <div 
            key={category.category_id} 
            className={cx('category', { 
              active: selectedCategory === category.category_id 
            })}
            onClick={() => handleCategoryClick(category.category_id)}
          >
            <i className={category.icon}></i>
            <span>{category.name}</span>
            <span className={cx('count')}>{category.jobCount}</span>
          </div>
        ))}
      </div>

      {/* Filter Options */}
      <div className={cx('filter-options')}>
        <div className={cx('filter-group')}>
          {filterButtons.map(button => (
            <button
              key={button.id}
              className={cx('filter-btn', { active: filterType === button.id })}
              onClick={() => handleFilterChange(button.id)}
            >
              {button.label}
            </button>
          ))}
        </div>
        <div className={cx('results-count')}>
          Hiển thị <span>{filteredJobs.length}</span> việc làm
        </div>
      </div>

      {/* Main Content */}
      <div className={cx('main-content')}>
        {/* Job List */}
        <div className={cx('job-list')}>
          {filteredJobs.map((job) => (
            <div 
              key={job.job_id} 
              className={cx('job-card')}
              onClick={() => handleJobClick(job.job_id)}
            >
              <div className={cx('card-overlay')}></div>
              <div className={cx('job-header')}>
                <div className={cx('company-info')}>
                  <img 
                    src={job.company_logo || images.company_1} 
                    alt={job.company_name} 
                    className={cx('company-logo')}
                  />
                  <div className={cx('company-details')}>
                    <h3 className={cx('job-title')}>{job.title}</h3>
                    <p className={cx('company-name')}>{job.company_name}</p>
                  </div>
                </div>
                <button 
                  className={cx('save-btn', { saved: savedStatus[job.job_id] })}
                  onClick={(e) => handleSaveJob(e, job.job_id)}
                >
                  <i className={`fa${savedStatus[job.job_id] ? 's' : 'r'} fa-bookmark`}></i>
                  <span className={cx('tooltip')}>
                    {savedStatus[job.job_id] ? 'Đã Lưu' : 'Lưu Tin'}
                  </span>
                </button>
              </div>

              <div className={cx('job-content')}>
                <div className={cx('info-grid')}>
                  <div className={cx('info-item', 'salary')}>
                    <i className="fas fa-money-bill"></i>
                    <div>
                      <span className={cx('label')}>Mức lương</span>
                      <span className={cx('value')}>{job.salary}</span>
                    </div>
                  </div>
                  <div className={cx('info-item', 'location')}>
                    <i className="fas fa-map-marker-alt"></i>
                    <div>
                      <span className={cx('label')}>Địa điểm</span>
                      <span className={cx('value')}>{job.location}</span>
                    </div>
                  </div>
                  <div className={cx('info-item', 'experience')}>
                    <i className="fas fa-briefcase"></i>
                    <div>
                      <span className={cx('label')}>Kinh nghiệm</span>
                      <span className={cx('value')}>{job.experience}</span>
                    </div>
                  </div>
                  <div className={cx('info-item', 'work-type')}>
                    <i className="fas fa-clock"></i>
                    <div>
                      <span className={cx('label')}>Hình thức</span>
                      <span className={cx('value')}>{job.working_time}</span>
                    </div>
                  </div>
                </div>

                <div className={cx('tags-section')}>
                  <div className={cx('tag')}>
                    <i className="fas fa-graduation-cap"></i>
                    {job.education}
                  </div>
                  <div className={cx('tag')}>
                    <i className="fas fa-user-tie"></i>
                    {job.rank}
                  </div>
                  <div className={cx('tag')}>
                    <i className="fas fa-map-pin"></i>
                    {job.working_location}
                  </div>
                </div>

                <div className={cx('deadline-section')}>
                  <div className={cx('deadline-info')}>
                    <i className="far fa-clock"></i>
                    <span>
                      Còn {Math.max(0, Math.ceil((new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24)))} ngày để ứng tuyển
                    </span>
                  </div>
                  <button className={cx('apply-btn')}>Ứng tuyển ngay</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Top Companies */}
        <div className={cx('top-companies')}>
          <h2>Top công ty nổi bật</h2>
          {topCompany.slice(0, 5).map((company) => (
            <div key={company.id} className={cx('company-card')}>
              <img src={company.logo || images.company_1} alt={company.company_name} />
              <div className={cx('company-info')}>
                <h3>{company.company_name}</h3>
                <span>{company.job_count || '41'} việc làm</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobIT;
