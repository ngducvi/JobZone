import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './JobIT.module.scss';
import images from '~/assets/images';
import { authAPI, userApis } from "~/utils/api";

const cx = classNames.bind(styles);

const JobIT = () => {
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedSalary, setSelectedSalary] = useState('all');
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [topCompany, setTopCompany] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("list"); // 'list' or 'top'
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [filterType, setFilterType] = useState('newest'); // 'newest', 'urgent', 'salary'

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
        <div className={cx('category')}>
          <span>Git</span>
          <span className={cx('count')}>250</span>
        </div>
        <div className={cx('category')}>
          <span>Javascript</span>
          <span className={cx('count')}>212</span>
        </div>
        <div className={cx('category')}>
          <span>Làm việc nhóm</span>
          <span className={cx('count')}>205</span>
        </div>
        <div className={cx('category')}>
          <span>Phân tích yêu cầu</span>
          <span className={cx('count')}>205</span>
        </div>
        <div className={cx('category')}>
          <span>Quản lý dự án</span>
          <span className={cx('count')}>170</span>
        </div>
        <div className={cx('category')}>
          <span>Khác</span>
          <span className={cx('count')}>1847</span>
        </div>
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
          Tìm thấy <span>{topCompany.length}</span> việc làm phù hợp với yêu cầu của bạn
        </div>
      </div>

      {/* Main Content */}
      <div className={cx('main-content')}>
        {/* Job List */}
        <div className={cx('job-list')}>
          {topCompany.map((item) => (
            <div key={item.id} className={cx('job-card')}>
              <div className={cx('company-info')}>
                <img src={item.logo || images.company_1} alt={item.company_name} />
                <div className={cx('job-details')}>
                  <h3>{item.company_name}</h3>
                  <p className={cx('location')}>
                    <i className="fas fa-map-marker-alt"></i>
                    Hồ Chí Minh
                  </p>
                  <div className={cx('tags')}>
                    <span>Quản trị và vận hành bảo mật</span>
                  </div>
                </div>
              </div>
              <div className={cx('job-meta')}>
                <div className={cx('salary')}>
                  <i className="fas fa-money-bill-wave"></i>
                  25-35 triệu
                </div>
                <div className={cx('deadline')}>
                  <i className="far fa-clock"></i>
                  Còn 25 ngày để ứng tuyển
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
