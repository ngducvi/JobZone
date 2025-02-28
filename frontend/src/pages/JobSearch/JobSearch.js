// JobSearch
import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames/bind";
import styles from "./JobSearch.module.scss";
import JobCard from "~/components/JobCard/JobCard";
import images from "~/assets/images";
import { authAPI, userApis, recruiterApis } from "~/utils/api";
import { useNavigate } from "react-router-dom";
const cx = classNames.bind(styles);

const JobSearch = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedSalary, setSelectedSalary] = useState("all");
  const [workType, setWorkType] = useState("all");
  const [companyType, setCompanyType] = useState("all");
  const [workArea, setWorkArea] = useState("all");
  const [businessArea, setBusinessArea] = useState("all");
  const filtersRef = useRef(null);
  const [jobs, setJobs] = useState([]);
  const [visibleJobs, setVisibleJobs] = useState(10);
  const [totalJobs, setTotalJobs] = useState(0);
  const [categories, setCategories] = useState([]);
  const [visibleCategories, setVisibleCategories] = useState(5);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [datePosted, setDatePosted] = useState('all');
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [savedStatus, setSavedStatus] = useState({});

  const [filters, setFilters] = useState({
    category_id: '',
    experience: 'all',
    salary: 'all', 
    working_time: 'all',
    working_location: 'all',
    datePosted: 'all',
    location: '',
    rank: 'all',
    education: 'all'
  });

  const datePostedOptions = [
    { value: 'all', label: 'All' },
    { value: 'last_hour', label: 'Last Hour' },
    { value: 'last_24h', label: 'Last 24 Hour' },
    { value: 'last_7d', label: 'Last 7 Days' },
    { value: 'last_14d', label: 'Last 14 Days' },
    { value: 'last_30d', label: 'Last 30 Days' }
  ];

  const rankOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'staff', label: 'Nhân viên' },
    { value: 'team_lead', label: 'Trưởng nhóm' },
    { value: 'manager', label: 'Trưởng/Phó phòng' },
    { value: 'Quản lý / Giám sát', label: 'Quản lý / Giám sát' },
    { value: 'branch_manager', label: 'Trưởng chi nhánh' },
    { value: 'vice_director', label: 'Phó giám đốc' },
    { value: 'director', label: 'Giám đốc' },
    { value: 'intern', label: 'Thực tập sinh' }
  ];

  const experienceOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Không yêu cầu', label: 'Không yêu cầu' },
    { value: 'Dưới 1 năm', label: 'Dưới 1 năm' },
    { value: '1 năm', label: '1 năm' },
    { value: '2 năm', label: '2 năm' },
    { value: '3 năm', label: '3 năm' },
    { value: '4 năm', label: '4 năm' },
    { value: '5 năm', label: '5 năm' }
  ];

  const salaryOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Dưới 10 triệu', label: 'Dưới 10 triệu' },
    { value: '10 - 15 triệu', label: '10 - 15 triệu' },
    { value: '15 - 20 triệu', label: '15 - 20 triệu' },
    { value: '20 - 25 triệu', label: '20 - 25 triệu' },
    { value: '25 - 30 triệu', label: '25 - 30 triệu' },
    { value: '30 - 50 triệu', label: '30 - 50 triệu' },
    { value: 'Trên 50 triệu', label: 'Trên 50 triệu' },
    { value: 'Thỏa thuận', label: 'Thỏa thuận' }
  ];

  const workingTimeOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Toàn thời gian', label: 'Toàn thời gian' },
    { value: 'Bán thời gian', label: 'Bán thời gian' },
    { value: 'Thực tập', label: 'Thực tập' },
    { value: 'Khác', label: 'Khác' }
  ];

  const companyTypeOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'pro', label: 'Pro Company' }
  ];

  const defaultCategories = [
    {
      category_id: "all",
      category_name: "Tất cả",
      description: "Tất cả các danh mục"
    },
    {
      category_id: "1f25e3ee-ce9e-11ef-9430-2cf05db24bc7",
      category_name: "Software Engineering",
      description: "Category for software development jobs including back-end, front-end, and full-stack development."
    },
    {
      category_id: "1f25e912-ce9e-11ef-9430-2cf05db24bc7",
      category_name: "Data Science",
      description: "Category for jobs related to data analysis, machine learning, and artificial intelligence."
    },
    {
      category_id: "1f25ea73-ce9e-11ef-9430-2cf05db24bc7", 
      category_name: "Project Management",
      description: "Category for project management roles in tech and non-tech industries."
    },
    {
      category_id: "1f25eb8c-ce9e-11ef-9430-2cf05db24bc7",
      category_name: "Marketing",
      description: "Category for marketing roles including digital marketing, content creation, and brand management."
    },
    {
      category_id: "1f25ec4e-ce9e-11ef-9430-2cf05db24bc7",
      category_name: "Graphic Design", 
      description: "Category for graphic design and UI/UX design roles."
    },
    {
      category_id: "1f25ed2a-ce9e-11ef-9430-2cf05db24bc7",
      category_name: "Sales",
      description: "Category for sales roles including account management and business development."
    },
    {
      category_id: "1f25ee06-ce9e-11ef-9430-2cf05db24bc7",
      category_name: "Human Resources",
      description: "Category for HR roles including recruitment, payroll, and employee relations."
    },
    {
      category_id: "1f25eec3-ce9e-11ef-9430-2cf05db24bc7",
      category_name: "Customer Support",
      description: "Category for customer support and customer service roles."
    },
    {
      category_id: "1f25ef7a-ce9e-11ef-9430-2cf05db24bc7",
      category_name: "Web Development",
      description: "Category for web development jobs including front-end and back-end development."
    },
    {
      category_id: "1f25f02b-ce9e-11ef-9430-2cf05db24bc7",
      category_name: "Mobile Development",
      description: "Category for mobile app development roles for iOS and Android platforms."
    },
    // ... thêm các categories khác
  ];

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const responseJobs = await authAPI().get(userApis.getAllJobs);
      setJobs(responseJobs.data.jobs);
      setTotalJobs(responseJobs.data.jobs.length);
      console.log("responseJobs", responseJobs.data.jobs);
      
      // Sử dụng defaultCategories thay vì gọi API
      setCategories(defaultCategories);
      
      jobs.map((job) => {
        const jobDate = new Date(job.created_at);
        console.log("jobDate", jobDate);
      });
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await authAPI().get(userApis.getAllSavedJobsByUser);
        const initialSavedStatus = {};
        response.data.savedJobs.forEach(job => {
          initialSavedStatus[job.job_id] = true;
        });
        setSavedStatus(initialSavedStatus);
      } catch (error) {
        console.error("Error fetching saved jobs:", error);
      }
    };
    fetchSavedJobs();
  }, []);

  const fetchFilteredJobs = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          queryParams.append(key, value);
        }
      });

      const response = await authAPI().get(
        `${userApis.filterJobs}?${queryParams.toString()}`
      );

      setJobs(response.data.jobs);
      setTotalJobs(response.data.totalJobs);
    } catch (error) {
      console.error('Error fetching filtered jobs:', error);
    }
  };

  useEffect(() => {
    fetchFilteredJobs();
  }, [filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Smooth scroll to section when clicking on filter headers
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section && filtersRef.current) {
      filtersRef.current.scrollTo({
        top: section.offsetTop - 20,
        behavior: "smooth",
      });
    }
  };

  const handleShowMore = () => {
    setVisibleJobs(prev => prev + 10);
  };

  const handleShowMoreCategories = () => {
    setShowAllCategories(true);
    setVisibleCategories(categories.length);
  };

  const handleShowLessCategories = () => {
    setShowAllCategories(false);
    setVisibleCategories(5);
  };
  

  // Filter jobs by date posted
  const filterJobsByDate = (jobs) => {
    if (datePosted === 'all') return jobs;

    const now = new Date();
    return jobs.filter(job => {
      const jobDate = new Date(job.created_at);
      const diffHours = (now - jobDate) / (1000 * 60 * 60);
      const diffDays = diffHours / 24;

      switch (datePosted) {
        case 'last_hour':
          return diffHours <= 1;
        case 'last_24h':
          return diffHours <= 24;
        case 'last_7d':
          return diffDays <= 7;
        case 'last_14d':
          return diffDays <= 14;
        case 'last_30d':
          return diffDays <= 30;
        default:
          return true;
      }
    });
  };

  // Thêm hàm để lấy label từ value của filter
  const getFilterLabel = (filterName, value) => {
    switch (filterName) {
      case 'category_id':
        const category = defaultCategories.find(cat => cat.category_id === value);
        return category ? category.category_name : value;
      case 'experience':
        return experienceOptions.find(opt => opt.value === value)?.label;
      case 'rank':
        return rankOptions.find(opt => opt.value === value)?.label;
      case 'salary':
        return salaryOptions.find(opt => opt.value === value)?.label;
      case 'working_time':
        return workingTimeOptions.find(opt => opt.value === value)?.label;
      case 'datePosted':
        return datePostedOptions.find(opt => opt.value === value)?.label;
      default:
        return value;
    }
  };

  // Thêm hàm xóa filter
  const handleRemoveFilter = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: 'all'
    }));
  };

  // Thêm hàm xử lý tìm kiếm
  const handleSearch = () => {
    setIsSearching(true);
    if (!searchTitle && !searchLocation) {
      // Nếu không có từ khóa tìm kiếm, hiển thị tất cả jobs
      fetchFilteredJobs();
    } else {
      // Filter jobs theo title và location
      const filteredJobs = jobs.filter(job => {
        const matchTitle = !searchTitle || 
          job.title.toLowerCase().includes(searchTitle.toLowerCase());
        const matchLocation = !searchLocation || 
          job.location.toLowerCase().includes(searchLocation.toLowerCase());
        return matchTitle && matchLocation;
      });
      setJobs(filteredJobs);
      setTotalJobs(filteredJobs.length);
    }
    setIsSearching(false);
  };

  // Thêm hàm xử lý click vào job
  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  // Thêm hàm xử lý lưu/hủy lưu job
  const handleSaveJob = async (e, jobId) => {
    e.stopPropagation();
    if (!jobId) return;

    try {
      if (savedStatus[jobId]) {
        // Nếu đã lưu thì gọi API hủy lưu
        await authAPI().delete(userApis.unsaveJob(jobId));
        setSavedStatus(prev => ({...prev, [jobId]: false}));
      } else {
        // Nếu chưa lưu thì gọi API lưu
        await authAPI().post(userApis.saveJob(jobId));
        setSavedStatus(prev => ({...prev, [jobId]: true}));
      }
      // Emit sự kiện để cập nhật UserInfo
      window.dispatchEvent(new Event('user-data-update'));
    } catch (error) {
      console.error("Error toggling job save status:", error);
      if (error.response?.data?.message === 'Bạn đã lưu công việc này rồi') {
        setSavedStatus(prev => ({...prev, [jobId]: true}));
      }
    }
  };

  return (
    <div className={cx("job-search")}>
      <div className={cx("search-header")}>
        <div className={cx("container")}>
          <div className={cx("search-form")}>
            <div className={cx("search-input")}>
              <i className="fas fa-search"></i>
              <input 
                type="text" 
                placeholder="Vị trí tuyển dụng" 
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
            <div className={cx("location-input")}>
              <i className="fas fa-map-marker-alt"></i>
              <input 
                type="text" 
                placeholder="Địa điểm"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
            <button 
              className={cx("search-button", { searching: isSearching })}
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                'Tìm kiếm'
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={cx("container")}>
        <div className={cx("content")}>
          <aside className={cx("filters")} ref={filtersRef}>
            <div className={cx("filter-section")} id="categories">
              <h3>Theo danh mục nghề</h3>
              <div className={cx("categories-list")}>
                {categories.slice(0, visibleCategories).map((category) => (
                  <label key={category.category_id} className={cx("radio-item")}>
                    <input
                      type="radio"
                      name="category"
                      value={category.category_id}
                      checked={filters.category_id === category.category_id}
                      onChange={(e) => handleFilterChange('category_id', e.target.value)}
                    />
                    <div className={cx("date-filter-info")}>
                      <span className={cx("category-name")}>{category.category_name}</span>
                      <span className={cx("job-count")}>
                        ({jobs.filter(job => job.category_id === category.category_id).length} việc làm)
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              {categories.length > 5 && (
                <button 
                  className={cx("show-more-categories")}
                  onClick={showAllCategories ? handleShowLessCategories : handleShowMoreCategories}
                >
                  {showAllCategories ? (
                    <>
                      <span>Thu gọn</span>
                      <i className="fas fa-chevron-up"></i>
                    </>
                  ) : (
                    <>
                      <span>Xem thêm</span>
                      <i className="fas fa-chevron-down"></i>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className={cx("filter-section")}>
              <h3>Kinh nghiệm</h3>
              {experienceOptions.map(option => (
                <label key={option.value} className={cx("radio-item")}>
                <input
                  type="radio"
                  name="experience"
                    value={option.value}
                    checked={filters.experience === option.value}
                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                  />
                  <div className={cx("date-filter-info")}>
                    <span>{option.label}</span>
                    <span className={cx("job-count")}>
                      ({jobs.filter(job => job.experience === option.value).length} việc làm)
                    </span>
                  </div>
              </label>
              ))}
            </div>

            <div className={cx("filter-section")}>
              <h3>Cấp bậc</h3>
              {rankOptions.map(option => (
                <label key={option.value} className={cx("radio-item")}>
                <input
                  type="radio"
                    name="rank"
                    value={option.value}
                    checked={filters.rank === option.value}
                    onChange={(e) => handleFilterChange('rank', e.target.value)}
                  />
                  <div className={cx("date-filter-info")}>
                    <span>{option.label}</span>
                    <span className={cx("job-count")}>
                      ({jobs.filter(job => job.rank === option.value).length} việc làm)
                    </span>
                  </div>
              </label>
              ))}
            </div>

            <div className={cx("filter-section")}>
              <h3>Mức lương</h3>
              {salaryOptions.map(option => (
                <label key={option.value} className={cx("radio-item")}>
                <input
                  type="radio"
                  name="salary"
                    value={option.value}
                    checked={filters.salary === option.value}
                    onChange={(e) => handleFilterChange('salary', e.target.value)}
                  />
                  <div className={cx("date-filter-info")}>
                    <span>{option.label}</span>
                    <span className={cx("job-count")}>
                      ({jobs.filter(job => job.salary === option.value).length} việc làm)
                    </span>
                  </div>
              </label>
              ))}
            </div>

            <div className={cx("filter-section")}>
              <h3>Hình thức làm việc</h3>
              {workingTimeOptions.map(option => (
                <label key={option.value} className={cx("radio-item")}>
                <input
                  type="radio"
                    name="working_time"
                    value={option.value}
                    checked={filters.working_time === option.value}
                    onChange={(e) => handleFilterChange('working_time', e.target.value)}
                  />
                  <div className={cx("date-filter-info")}>
                    <span>{option.label}</span>
                    <span className={cx("job-count")}>
                      ({jobs.filter(job => job.working_time === option.value).length} việc làm)
                    </span>
                  </div>
              </label>
              ))}
            </div>

            <div className={cx("filter-section")}>
              <h3>Loại công ty</h3>
              {companyTypeOptions.map(option => (
                <label key={option.value} className={cx("radio-item")}>
                <input
                  type="radio"
                    name="company_type"
                    value={option.value}
                    checked={filters.company_type === option.value}
                    onChange={(e) => handleFilterChange('company_type', e.target.value)}
                  />
                  <div className={cx("date-filter-info")}>
                    <span>{option.label}</span>
                    <span className={cx("job-count")}>
                      {jobs.filter(job => job.company_type === option.value).length}
                    </span>
                  </div>
              </label>
              ))}
            </div>

            <div className={cx("filter-section")}>
              <h3>Date Posted</h3>
              {datePostedOptions.map(option => (
                <label key={option.value} className={cx("radio-item")}>
                <input
                  type="radio"
                    name="datePosted"
                    value={option.value}
                    checked={datePosted === option.value}
                    onChange={(e) => setDatePosted(e.target.value)}
                  />
                  <div className={cx("date-filter-info")}>
                    <span>{option.label}</span>
                    <span className={cx("job-count")}>
                      ({filterJobsByDate(jobs).length} việc làm)
                    </span>
                  </div>
              </label>
              ))}
            </div>
          </aside>

          <main className={cx("job-list")}>
            <div className={cx("job-list-header")}>
              <div className={cx("active-filters")}>
                <div className={cx("filter-header")}>
                <span>Lọc nâng cao</span>
                  <span className={cx("jobs-counter")}>
                    ({filterJobsByDate(jobs).length} việc làm)
                  </span>
                </div>
                <div className={cx("filter-tags")}>
                  {Object.entries(filters).map(([key, value]) => {
                    if (value && value !== 'all') {
                      return (
                        <span key={key} className={cx("filter-tag")}>
                          {getFilterLabel(key, value)}
                          <button 
                            className={cx("remove-tag")}
                            onClick={() => handleRemoveFilter(key)}
                          >
                            ×
                          </button>
                  </span>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
              <div className={cx("sort-section")}>
                <span>Ưu tiên hiển thị theo:</span>
                <select className={cx("sort-select")}>
                  <option value="relevance">Search by AI</option>
                </select>
              </div>
            </div>

            <div className={cx("jobs")}>
              {filterJobsByDate(jobs).slice(0, visibleJobs).map((job) => (
                <div 
                  key={job.job_id} 
                  className={cx("job-card")}
                  onClick={() => handleJobClick(job.job_id)}
                >
                  <div className={cx("company-logo")}>
                    <img src={job.Company?.logo || images.company_logo} alt="Company Logo" />
                  </div>
                  
                  <div className={cx("job-info")}>
                    <h3 className={cx("job-title")}>{job.title}</h3>
                    <div className={cx("company-name")}>{job.Company?.company_name}</div>
                    
                    <div className={cx("job-meta")}>
                      <span className={cx("location")}>
                        <i className="fas fa-map-marker-alt"></i> {job.location}
                      </span>
                      <span className={cx("salary")}>
                        <i className="fas fa-dollar-sign"></i> {job.salary}
                      </span>
                      <span className={cx("time")}>
                        <i className="far fa-clock"></i> {job.working_time}
                      </span>
                    </div>

                    <div className={cx("tags")}>
                      <span className={cx("tag", "full-time")}>{job.working_time}</span>
                      <span className={cx("tag", "private")}>Private</span>
                      <span className={cx("tag", "urgent")}>Urgent</span>
                    </div>
                  </div>

                  <button 
                    className={cx("save-job", { saved: savedStatus[job.job_id] })}
                    onClick={(e) => handleSaveJob(e, job.job_id)}
                  >
                    <i className={`fa${savedStatus[job.job_id] ? 's' : 'r'} fa-bookmark`}></i>
                    <span className={cx("tooltip")}>
                      {savedStatus[job.job_id] ? 'Đã lưu' : 'Lưu tin'}
                    </span>
                  </button>
                </div>
              ))}
            </div>

            {visibleJobs < totalJobs && (
              <div className={cx("show-more-section")}>
                <div className={cx("jobs-count")}>
                  Show {visibleJobs} of {totalJobs} Jobs
                </div>
                <div className={cx("progress-bar")}>
                  <div 
                    className={cx("progress")} 
                    style={{ width: `${(visibleJobs / totalJobs) * 100}%` }}
                  ></div>
                </div>
                <button 
                  className={cx("show-more-btn")}
                  onClick={handleShowMore}
                >
                  Show More
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default JobSearch;
