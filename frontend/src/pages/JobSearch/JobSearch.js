// JobSearch
import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames/bind";
import styles from "./JobSearch.module.scss";
import JobCard from "~/components/JobCard/JobCard";
import images from "~/assets/images";
import { authAPI, userApis, recruiterApis } from "~/utils/api";
import api from "~/utils/api";
import { useNavigate, useLocation } from "react-router-dom";
const cx = classNames.bind(styles);

const JobSearch = () => {
  const [selectedCategories, setSelectedCategories] = useState("all");
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
  const [currentCategoryLevel, setCurrentCategoryLevel] = useState(1);
  const [currentParentId, setCurrentParentId] = useState('root');
  const [categoryPath, setCategoryPath] = useState([{ id: 'root', name: 'Tất cả' }]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedProvinces, setSelectedProvinces] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const locationRef = useRef(null);

  const [filters, setFilters] = useState({
    category_id: 'all',
    experience: 'all',
    salary: 'all', 
    working_time: 'all',
    working_location: 'all',
    datePosted: 'all',
    location: '',
    rank: 'all',
    education: 'all'
  });

  // Thêm state để lưu số lượng việc làm theo từng filter
  const [jobCounts, setJobCounts] = useState({
    experience: {},
    rank: {},
    salary: {},
    working_time: {},
    category_id: {}
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

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      const responseJobs = await api.get(userApis.getAllJobs);
      setJobs(responseJobs.data.jobs);
      setTotalJobs(responseJobs.data.jobs.length);
      console.log("responseJobs", responseJobs.data.jobs);
      
      // Fetch categories by parent_id
      await fetchCategoriesByParentId(currentParentId);
      
      jobs.map((job) => {
        const jobDate = new Date(job.created_at);
        console.log("jobDate", jobDate);
      });
      console.log("jobs", jobs);
    };
    fetchData();
  }, []);

  // Fetch categories by parent_id
  const fetchCategoriesByParentId = async (parentId) => {
    try {
      console.log("Fetching categories for parent_id:", parentId);
      const apiUrl = userApis.getCategoriesByParentId(parentId);
      console.log("API URL:", apiUrl);
      
      const response = await api.get(apiUrl);
      console.log("API Response:", response.data);
      
      const fetchedCategories = response.data.categories;
      console.log("Fetched Categories:", fetchedCategories);

      // Process categories to add has_children flag
      const processedCategories = fetchedCategories.map(category => ({
        ...category,
        has_children: category.level < 3 // Assume categories with level < 3 have children
      }));
      console.log("Processed Categories:", processedCategories);

      // Add "All" option only for level 1
      if (parentId === 'root') {
        setCategories([
          {
            category_id: "all",
            category_name: "Tất cả",
            description: "Tất cả các danh mục",
            level: 1,
            has_children: false
          },
          ...processedCategories
        ]);
      } else {
        setCategories(processedCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Fallback đến defaultCategories chỉ khi API fails
      if (parentId === 'root') {
        // Tạo một fallback categories đơn giản khi không lấy được từ API
        const fallbackCategories = [
          {
            category_id: "all",
            category_name: "Tất cả",
            description: "Tất cả các danh mục",
            level: 1,
            has_children: false
          }
        ];
        setCategories(fallbackCategories);
      }
    }
  };

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

  // Add useEffect to handle URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryId = params.get('category_id');
    const keyword = params.get('keyword');
    const locationParam = params.get('location');

    // Set initial search values from URL params
    if (keyword) {
      setSearchTitle(keyword);
    }
    if (locationParam) {
      setSearchLocation(locationParam);
    }
    if (categoryId) {
      handleFilterChange('category_id', categoryId);
      // Find and select the category in the list
      const category = categories.find(cat => cat.category_id === categoryId);
      if (category) {
        setSelectedCategories([categoryId]);
      }
    }

    // Trigger search if we have parameters
    if (keyword || locationParam || categoryId) {
      fetchFilteredJobs();
    }
  }, [location.search]); // Re-run when URL search params change

  const fetchFilteredJobs = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          queryParams.append(key, value);
        }
      });

      // Add search title and location if present
      if (searchTitle) {
        queryParams.append('keyword', searchTitle);
      }
      if (searchLocation) {
        queryParams.append('location', searchLocation);
      }

      const response = await api.get(
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

  // Fetch categories when currentParentId changes
  useEffect(() => {
    fetchCategoriesByParentId(currentParentId);
  }, [currentParentId]);

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
  
  // Handle category selection and navigation between levels
  const handleCategorySelect = async (category) => {
    // If "all" selected, apply filter and stay at current level
    if (category.category_id === "all") {
      handleFilterChange('category_id', 'all');
      return;
    }
    
    // Nếu là danh mục cấp 2, lấy tất cả danh mục cấp 3 con và lọc theo chúng
    if (category.level === 2) {
      // Lưu trữ danh mục cấp 2 hiện tại để hiển thị trong giao diện
      setCurrentCategoryLevel(2);
      setCurrentParentId(category.category_id);
      
      // Cập nhật đường dẫn danh mục
      setCategoryPath(prev => {
        // Trường hợp đã có danh mục này trong đường dẫn, cắt bớt đường dẫn
        if (prev[1]?.id === category.category_id) {
          return prev.slice(0, 2);
        }
        
        // Thêm danh mục cấp 2 vào đường dẫn
        return [
          ...prev.slice(0, 1), // Giữ lại root
          { id: category.category_id, name: category.category_name }
        ];
      });
      
      // Áp dụng bộ lọc là danh mục cấp 2
      handleFilterChange('category_id', category.category_id);
      
      // Tải các danh mục con của cấp 2 để hiển thị
      await fetchCategoriesByParentId(category.category_id);
      return;
    }
    
    // If we're at level 3 or this category doesn't have children, apply as filter
    if (category.level === 3 || !category.has_children) {
      handleFilterChange('category_id', category.category_id);
      
      // If this is a leaf node, add it to the path without navigating
      if (!categoryPath.find(item => item.id === category.category_id)) {
        setCategoryPath(prev => [
          ...prev.slice(0, currentCategoryLevel),
          { id: category.category_id, name: category.category_name }
        ]);
      }
      return;
    }
    
    // Otherwise, navigate to next level
    const nextLevel = currentCategoryLevel + 1;
    setCurrentCategoryLevel(nextLevel);
    setCurrentParentId(category.category_id);
    
    // Update the category path, ensuring we don't add duplicates
    setCategoryPath(prev => {
      // If we already have this category in our path at the current position, just trim the array
      if (prev[currentCategoryLevel-1]?.id === category.category_id) {
        return prev.slice(0, currentCategoryLevel);
      }
      
      // Otherwise append it, trimming any existing entries beyond the current level
      return [
        ...prev.slice(0, currentCategoryLevel),
        { id: category.category_id, name: category.category_name }
      ];
    });
  };
  
  // Navigate back to a previous level in the hierarchy
  const handleCategoryPathClick = async (index) => {
    // If clicking the current level, do nothing
    if (index === currentCategoryLevel - 1) {
      return;
    }
    
    // Get the parent ID at the clicked index
    const parentId = categoryPath[index].id;
    const newLevel = index + 1;
    
    // Update state
    setCurrentParentId(parentId);
    setCurrentCategoryLevel(newLevel);
    
    // Trim the path to this level
    setCategoryPath(prev => prev.slice(0, newLevel));
    
    // If we're going back to the first level, reset the category filter
    if (index === 0 && parentId === 'root') {
      handleFilterChange('category_id', 'all');
    } else {
      // Otherwise set the filter to the category we navigated to
      handleFilterChange('category_id', parentId);
    }
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
        const category = categories.find(cat => cat.category_id === value);
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

  // Modify handleSearch to use non-authenticated API
  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (searchTitle) params.append('keyword', searchTitle);
      if (searchLocation) params.append('location', searchLocation);
      
      // Add other active filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value);
        }
      });

      const response = await api.get(`${userApis.filterJobs}?${params.toString()}`);
      setJobs(response.data.jobs || []);
      setTotalJobs(response.data.jobs?.length || 0);
    } catch (error) {
      console.error('Error searching jobs:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Modify handleSaveJob to check for authentication
  const handleSaveJob = async (e, jobId) => {
    e.stopPropagation();
    if (!jobId) return;

    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      // Redirect to login page or show login modal
      navigate('/login');
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
      window.dispatchEvent(new Event('user-data-update'));
    } catch (error) {
      console.error("Error toggling job save status:", error);
      if (error.response?.data?.message === 'Bạn đã lưu công việc này rồi') {
        setSavedStatus(prev => ({...prev, [jobId]: true}));
      }
    }
  };

  // Modify handleJobClick to check for authentication
  const handleJobClick = (jobId) => {
    const token = localStorage.getItem("token");
    if (token) {
      // If logged in, add to viewed jobs
      authAPI().post(userApis.addViewedJob(jobId));
    }
    navigate(`/jobs/${jobId}`);
  };

  // Thêm hàm tính toán số lượng việc làm cho mỗi filter
  const calculateJobCounts = (jobs) => {
    const counts = {
      experience: {},
      rank: {},
      salary: {},
      working_time: {},
      category_id: {}
    };

    jobs.forEach(job => {
      // Đếm theo kinh nghiệm
      counts.experience[job.experience] = (counts.experience[job.experience] || 0) + 1;
      
      // Đếm theo cấp bậc
      counts.rank[job.rank] = (counts.rank[job.rank] || 0) + 1;
      
      // Đếm theo mức lương
      counts.salary[job.salary] = (counts.salary[job.salary] || 0) + 1;
      
      // Đếm theo hình thức làm việc
      counts.working_time[job.working_time] = (counts.working_time[job.working_time] || 0) + 1;
      
      // Đếm theo danh mục
      counts.category_id[job.category_id] = (counts.category_id[job.category_id] || 0) + 1;
    });

    setJobCounts(counts);
  };

  // Cập nhật useEffect để tính toán số lượng khi jobs thay đổi
  useEffect(() => {
    if (jobs.length > 0) {
      calculateJobCounts(jobs);
    }
  }, [jobs]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch("https://esgoo.net/api-tinhthanh/1/0.htm");
        const data = await response.json();
        if (Array.isArray(data.data)) {
          setProvinces(data.data);
        } else {
          setProvinces([]);
        }
      } catch (error) {
        setProvinces([]);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch districts when provinces change
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const districtsData = await Promise.all(
          selectedProvinces.map(async (provinceId) => {
            const formattedId = provinceId.toString().padStart(2, "0");
            const response = await fetch(`https://esgoo.net/api-tinhthanh/2/${formattedId}.htm`);
            const data = await response.json();
            if (Array.isArray(data.data)) {
              return data.data.map((district) => ({
                ...district,
                provinceId: provinceId,
              }));
            }
            return [];
          })
        );
        setDistricts(districtsData.flat());
      } catch (error) {
        console.error("Error fetching districts:", error);
        setDistricts([]);
      }
    };

    if (selectedProvinces.length > 0) {
      fetchDistricts();
    } else {
      setDistricts([]);
    }
  }, [selectedProvinces]);

  // Handle clicks outside location dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProvinceSelect = (provinceId) => {
    setSelectedProvinces((prev) => {
      const isSelected = prev.includes(provinceId);
      if (isSelected) {
        return prev.filter((id) => id !== provinceId);
      } else {
        return [...prev, provinceId];
      }
    });
  };

  const handleDistrictSelect = (districtId) => {
    setSelectedDistricts((prev) => {
      const isSelected = prev.includes(districtId);
      if (isSelected) {
        return prev.filter((id) => id !== districtId);
      } else {
        return [...prev, districtId];
      }
    });
  };

  const handleSelectAllDistricts = (provinceId) => {
    const provinceDistricts = districts
      .filter((d) => d.provinceId === provinceId)
      .map((d) => d.id);

    setSelectedDistricts((prev) => {
      const allSelected = provinceDistricts.every((id) => prev.includes(id));
      if (allSelected) {
        return prev.filter((id) => !provinceDistricts.includes(id));
      } else {
        return [...new Set([...prev, ...provinceDistricts])];
      }
    });
  };

  const renderDistrictsByProvince = (provinceId) => {
    const province = provinces.find((p) => p.id === provinceId);
    const provinceDistricts = districts.filter((d) => d.provinceId === provinceId);

    if (!provinceDistricts.length) return null;

    return (
      <div key={provinceId} className={cx("district-group")}>
        <label className={cx("checkbox-item", "province-header")}>
          <input
            type="checkbox"
            checked={provinceDistricts.every((d) =>
              selectedDistricts.includes(d.id)
            )}
            onChange={() => handleSelectAllDistricts(provinceId)}
          />
          <span>{province?.name}</span>
        </label>
        <div className={cx("district-items")}>
          {provinceDistricts.map((district) => (
            <label key={district.id} className={cx("checkbox-item")}>
              <input
                type="checkbox"
                checked={selectedDistricts.includes(district.id)}
                onChange={() => handleDistrictSelect(district.id)}
              />
              <span>{district.name}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const handleConfirmLocation = () => {
    const selectedProvinceNames = selectedProvinces
      .map(id => provinces.find(p => p.id === id)?.name)
      .filter(Boolean);
    const selectedDistrictNames = selectedDistricts
      .map(id => districts.find(d => d.id === id)?.name)
      .filter(Boolean);
    
    const locationText = [...selectedProvinceNames, ...selectedDistrictNames].join(', ');
    setSearchLocation(locationText);
    setShowLocationModal(false);
    
    // Update URL and fetch jobs with new location
    const params = new URLSearchParams(location.search);
    params.set('location', locationText);
    navigate(`${location.pathname}?${params.toString()}`);
    handleSearch();
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
            <div className={cx("location-input")} onClick={() => setShowLocationModal(true)}>
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
                readOnly
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
              
              {/* Category navigation path */}
              {categoryPath.length > 1 && (
                <div className={cx("category-path")}>
                  {categoryPath.map((item, index) => (
                    <span key={item.id}>
                      <button 
                        className={cx("path-item", { active: index === categoryPath.length - 1 })}
                        onClick={() => handleCategoryPathClick(index)}
                      >
                        {item.name}
                      </button>
                      {index < categoryPath.length - 1 && <i className="fas fa-chevron-right"></i>}
                    </span>
                  ))}
                </div>
              )}
              
              <div className={cx("categories-list")}>
                {categories.slice(0, visibleCategories).map((category) => (
                  <div
                    key={category.category_id}
                    className={cx("category-item", {
                      active: filters.category_id === category.category_id,
                      "has-children": category.level < 3 && category.category_id !== "all"
                    })}
                    onClick={() => handleCategorySelect(category)}
                  >
                    <div className={cx("category-content")}>
                      <div className={cx("category-name-container")}>
                        <span className={cx("category-name")}>{category.category_name}</span>
                        <span className={cx("job-count")}>
                          ({jobCounts.category_id[category.category_id] || 0} việc làm)
                        </span>
                      </div>
                      {category.level < 3 && category.category_id !== "all" && (
                        <i className="fas fa-chevron-right"></i>
                      )}
                    </div>
                  </div>
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
                      ({jobCounts.experience[option.value] || 0} việc làm)
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
                      ({jobCounts.rank[option.value] || 0} việc làm)
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
                      ({jobCounts.salary[option.value] || 0} việc làm)
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
                      ({jobCounts.working_time[option.value] || 0} việc làm)
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
                    <img src={job.company_logo || images.company_logo} alt="Company Logo" />
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

      {/* Location Selection Modal */}
      {showLocationModal && (
        <div className={cx("modal-overlay")} ref={locationRef}>
          <div className={cx("modal-content", "location-modal")}>
            <div className={cx("modal-header")}>
              <h3>Chọn địa điểm làm việc</h3>
              <button className={cx("close-btn")} onClick={() => setShowLocationModal(false)}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className={cx("modal-body")}>
              <div className={cx("location-sections")}>
                <div className={cx("provinces-section")}>
                  <h4>Tỉnh/Thành phố</h4>
                  <div className={cx("provinces-list")}>
                    {provinces.map((province) => (
                      <label key={province.id} className={cx("checkbox-item")}>
                        <input
                          type="checkbox"
                          checked={selectedProvinces.includes(province.id)}
                          onChange={() => handleProvinceSelect(province.id)}
                        />
                        <span>{province.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className={cx("districts-section")}>
                  <h4>Quận/Huyện</h4>
                  <div className={cx("districts-list")}>
                    {selectedProvinces.map((provinceId) => renderDistrictsByProvince(provinceId))}
                  </div>
                </div>
              </div>
            </div>

            <div className={cx("modal-footer")}>
              <button className={cx("cancel-btn")} onClick={() => setShowLocationModal(false)}>
                Hủy
              </button>
              <button className={cx("confirm-btn")} onClick={handleConfirmLocation}>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSearch;
