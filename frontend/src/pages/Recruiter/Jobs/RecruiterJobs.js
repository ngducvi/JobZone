import React, { useContext, useEffect, useState, useRef } from "react";
import classNames from "classnames/bind";
import styles from "./RecruiterJobs.module.scss";
import { authAPI, userApis, recruiterApis } from "~/utils/api";
import UserContext from "~/context/UserContext";
import images from "~/assets/images";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import JobDetailModal from './JobDetailModal';

const cx = classNames.bind(styles);

const JOB_STATUS = {
  ACTIVE: {
    label: 'Đang hiển thị',
    icon: 'fa-solid fa-circle-check',
    color: '#10b981'
  },
  PENDING: {
    label: 'Chờ duyệt',
    icon: 'fa-solid fa-clock',
    color: '#f59e0b'
  },
  EXPIRED: {
    label: 'Hết hạn',
    icon: 'fa-solid fa-circle-xmark',
    color: '#ef4444'
  },
  DRAFT: {
    label: 'Bản nháp',
    icon: 'fa-solid fa-file-lines',
    color: '#6b7280'
  },
  CLOSED: {
    label: 'Đã đóng',
    icon: 'fa-solid fa-lock',
    color: '#dc2626'
  }
};

// Job Edit Modal Component
function EditJobModal({ isOpen, onClose, jobData, onEdit, setSelectedJob }) {
  const [title, setTitle] = useState(jobData ? jobData.title : 'Chưa có tiêu đề');
  const [description, setDescription] = useState(jobData ? jobData.description : 'Chưa có mô tả');
  const [salary, setSalary] = useState(jobData ? jobData.salary : 'Chưa có mức lương');
  const [location, setLocation] = useState(jobData ? jobData.location : 'Chưa có địa điểm');
  const [experience, setExperience] = useState(jobData ? jobData.experience : 'Chưa có kinh nghiệm');
  const [jobType, setJobType] = useState(jobData ? jobData.working_time : 'Chưa có hình thức làm việc');
  const [rank, setRank] = useState(jobData ? jobData.rank : 'Chưa có cấp bậc');
  const [deadline, setDeadline] = useState(jobData ? jobData.deadline.split('T')[0] : 'Chưa có hạn nộp đơn');
  const [benefits, setBenefits] = useState(jobData ? jobData.benefits : 'Chưa có quyền lợi');
  const [jobRequirements, setJobRequirements] = useState(jobData ? jobData.job_requirements : '');
  const [workingLocation, setWorkingLocation] = useState(jobData ? jobData.working_location : 'Chưa có địa điểm');
  const [status, setStatus] = useState(jobData ? jobData.status : 'Chưa có trạng thái');
  const [categoryId, setCategoryId] = useState(jobData ? jobData.category_id : 'Chưa có chuyên ngành');

  // Thêm state cho địa điểm
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [companyStatus, setCompanyStatus] = useState(null);
  const locationRef = useRef(null);

  // State cho hierarchical categories
  const [categories, setCategories] = useState([]);
  const [currentCategoryLevel, setCurrentCategoryLevel] = useState(1);
  const [currentParentId, setCurrentParentId] = useState('root');
  const [categoryPath, setCategoryPath] = useState([{ id: 'root', name: 'Tất cả' }]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState("Chọn danh mục nghề");
  const categoryRef = useRef(null);

  // Mapping từ giá trị database sang giá trị hiển thị
  const salaryMapping = {
    "duoi-10-trieu": "Dưới 10 triệu",
    "10-15-trieu": "10 - 15 triệu",
    "15-20-trieu": "15 - 20 triệu",
    "20-25-trieu": "20 - 25 triệu",
    "25-30-trieu": "25 - 30 triệu",
    "30-50-trieu": "30 - 50 triệu",
    "tren-50-trieu": "Trên 50 triệu",
    "thoa-thuan": "Thỏa thuận"
  };

  const experienceMapping = {
    "khong-yeu-cau": "Không yêu cầu",
    "duoi-1-nam": "Dưới 1 năm",
    "1-nam": "1 năm",
    "2-nam": "2 năm",
    "3-nam": "3 năm",
    "4-nam": "4 năm",
    "5-nam": "5 năm"
  };

  const jobTypeMapping = {
    "toan-thoi-gian": "Toàn thời gian",
    "ban-thoi-gian": "Bán thời gian",
    "thuc-tap": "Thực tập",
    "khac": "Khác"
  };

  const rankMapping = {
    "nhan-vien": "staff",
    "truong-nhom": "team_lead",
    "truong-pho-phong": "manager",
    "quan-ly-giam-sat": "Quản lý / Giám sát",
    "truong-chi-nhanh": "branch_manager",
    "pho-giam-doc": "vice_director",
    "giam-doc": "director",
    "thuc-tap-sinh": "intern"
  };

  // Hàm chuyển đổi giá trị từ database sang hiển thị
  const mapDatabaseValueToDisplay = (value, mapping) => {
    return mapping[value] || value;
  };

  // Hàm chuyển đổi giá trị hiển thị sang giá trị database
  const mapDisplayValueToDatabase = (value, mapping) => {
    const reversedMapping = Object.entries(mapping).reduce((acc, [key, val]) => {
      acc[val] = key;
      return acc;
    }, {});
    return reversedMapping[value] || value;
  };

  // active, pending, closed
  const statusLabel = status === 'Active' ? 'Đang hiển thị' : status === 'Pending' ? 'Chờ duyệt' : 'Đã đóng';

  useEffect(() => {
    if (jobData) {
      setTitle(jobData.title);
      setDescription(jobData.description);
      
      // Sử dụng hàm mapping để chuyển đổi giá trị từ database
      if (jobData.salary) {
        // Nếu giá trị từ database đã là dạng hiển thị (ví dụ: "25 - 30 triệu")
        if (Object.values(salaryMapping).includes(jobData.salary)) {
          setSalary(jobData.salary);
        } else {
          // Nếu là dạng key từ database (ví dụ: "25-30-trieu")
          setSalary(mapDatabaseValueToDisplay(jobData.salary, salaryMapping) || jobData.salary);
        }
      }
      
      setLocation(jobData.location);
      
      if (jobData.experience) {
        if (Object.values(experienceMapping).includes(jobData.experience)) {
          setExperience(jobData.experience);
        } else {
          setExperience(mapDatabaseValueToDisplay(jobData.experience, experienceMapping) || jobData.experience);
        }
      }
      
      if (jobData.working_time) {
        if (Object.values(jobTypeMapping).includes(jobData.working_time)) {
          setJobType(jobData.working_time);
        } else {
          setJobType(mapDatabaseValueToDisplay(jobData.working_time, jobTypeMapping) || jobData.working_time);
        }
      }
      
      if (jobData.rank) {
        if (Object.values(rankMapping).includes(jobData.rank)) {
          setRank(jobData.rank);
        } else {
          setRank(mapDatabaseValueToDisplay(jobData.rank, rankMapping) || jobData.rank);
        }
      }
      
      setDeadline(jobData.deadline.split('T')[0]);
      setBenefits(jobData.benefits);
      setJobRequirements(jobData.job_requirements);
      setWorkingLocation(jobData.working_location || jobData.location);
      setStatus(jobData.status);
      setCategoryId(jobData.category_id);
      
      // Tìm và thiết lập tên danh mục
      const getCategoryDetails = async () => {
        try {
          // Khởi tạo danh mục cấp 1
          await fetchCategoriesByParentId('root');
          
          // Tìm danh mục thích hợp để hiển thị
          const apiUrl = userApis.getAllCategories;
          const response = await authAPI().get(apiUrl);
          const allCategories = response.data.categories;
          
          if (allCategories && allCategories.length > 0) {
            const foundCategory = allCategories.find(cat => cat.category_id === jobData.category_id);
            if (foundCategory) {
              setCategoryName(foundCategory.category_name);
              
              // Cập nhật danh mục trong đường dẫn
              setCategoryPath([
                { id: 'root', name: 'Tất cả' },
                { id: foundCategory.category_id, name: foundCategory.category_name }
              ]);
            }
          }
        } catch (error) {
          console.error("Error fetching category details:", error);
        }
      };
      
      getCategoryDetails();
    }
  }, [jobData]);
  
  // Fetch provinces khi component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch("https://esgoo.net/api-tinhthanh/1/0.htm");
        const companyResponse = await authAPI().get(recruiterApis.checkRecruiterCompany);
        setCompanyStatus(companyResponse.data.recruiterCompany);
        console.log("companyResponse",companyResponse.data.recruiterCompany);
        const data = await response.json();
        if (Array.isArray(data.data)) {
          setProvinces(data.data);
        } else {
          setProvinces([]);
        }
      } catch (error) {
        console.error("Error fetching provinces:", error);
        setProvinces([]);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch districts khi chọn province
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedProvince) {
        setDistricts([]);
        return;
      }
      try {
        const formattedId = selectedProvince.toString().padStart(2, "0");
        const response = await fetch(`https://esgoo.net/api-tinhthanh/2/${formattedId}.htm`);
        const data = await response.json();
        if (Array.isArray(data.data)) {
          setDistricts(data.data);
        } else {
          setDistricts([]);
        }
      } catch (error) {
        console.error("Error fetching districts:", error);
        setDistricts([]);
      }
    };
    fetchDistricts();
  }, [selectedProvince]);

  // Handle clicks outside location dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Thêm hàm xử lý chọn tỉnh/thành
  const handleProvinceSelect = (provinceId) => {
    setSelectedProvince(provinceId);
    setSelectedDistrict(null);
    const provinceName = provinces.find(p => p.id === provinceId)?.name || "";
    setLocation(provinceName);
  };

  // Thêm hàm xử lý chọn quận/huyện
  const handleDistrictSelect = (districtId) => {
    setSelectedDistrict(districtId);
    const provinceName = provinces.find(p => p.id === selectedProvince)?.name || "";
    const districtName = districts.find(d => d.id === districtId)?.name || "";
    setLocation(`${districtName}, ${provinceName}`);
    setShowLocationDropdown(false);
  };

  // Fetch categories by parent_id
  const fetchCategoriesByParentId = async (parentId) => {
    try {
      console.log("Fetching categories for parent_id:", parentId);
      const apiUrl = userApis.getCategoriesByParentId(parentId);
      console.log("API URL:", apiUrl);
      
      const response = await authAPI().get(apiUrl);
      console.log("API Response:", response.data);
      
      const fetchedCategories = response.data.categories;
      console.log("Fetched Categories:", fetchedCategories);

      // Process categories to add has_children flag
      const processedCategories = fetchedCategories.map(category => ({
        ...category,
        has_children: category.level < 3 // Assume categories with level < 3 have children
      }));
      console.log("Processed Categories:", processedCategories);

      setCategories(processedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  // Handle category selection and navigation between levels
  const handleCategorySelect = async (category) => {    
    // If we're at level 3 or this category doesn't have children, select it as final choice
    if (category.level === 3 || !category.has_children) {
      setCategoryId(category.category_id);
      setCategoryName(category.category_name);
      setShowCategoryModal(false);
      
      // Update the category path for display
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
    
    // Fetch subcategories for the selected category
    await fetchCategoriesByParentId(category.category_id);
  };
  
  // Handle confirm button in category modal
  const handleConfirmCategory = () => {
    // Nếu đã chọn một danh mục (danh mục nằm ở level cuối cùng trong đường dẫn)
    if (categoryPath.length > 1) {
      const selectedCategory = categoryPath[categoryPath.length - 1];
      setCategoryId(selectedCategory.id);
      setCategoryName(selectedCategory.name);
    }
    setShowCategoryModal(false);
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
    
    // Fetch categories for the selected level
    await fetchCategoriesByParentId(parentId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Chuyển đổi giá trị hiển thị sang giá trị database
    const salaryValue = mapDisplayValueToDatabase(salary, salaryMapping);
    const experienceValue = mapDisplayValueToDatabase(experience, experienceMapping);
    const jobTypeValue = mapDisplayValueToDatabase(jobType, jobTypeMapping);
    const rankValue = mapDisplayValueToDatabase(rank, rankMapping);
    
    const updatedJob = {
      title,
      description,
      salary: salaryValue,
      location,
      experience: experienceValue,
      working_time: jobTypeValue,
      rank: rankValue,
      deadline,
      benefits,
      job_requirements: jobRequirements,
      working_location: workingLocation,
      status,
      category_id: categoryId,
    };
    
    console.log("Submitting updated job:", updatedJob);
    await onEdit(jobData.job_id, updatedJob);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={cx('modal-overlay')}> 
      <div className={cx('modal-content')}> 
        <h2>Chỉnh sửa tin tuyển dụng</h2>
        <form onSubmit={handleSubmit} >
          <div className={cx('form-group')}> 
            <label htmlFor="title">Tiêu đề công việc</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className={cx('form-group')}> 
            <label htmlFor="description">Mô tả công việc</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className={cx('form-group')}> 
            <label htmlFor="salary">Mức lương</label>
            <select id="salary" value={salary} onChange={(e) => setSalary(e.target.value)} required>
              <option value="">Chọn mức lương</option>
              <option value="Dưới 10 triệu">Dưới 10 triệu</option>
              <option value="10 - 15 triệu">10 - 15 triệu</option>
              <option value="15 - 20 triệu">15 - 20 triệu</option>
              <option value="20 - 25 triệu">20 - 25 triệu</option>
              <option value="25 - 30 triệu">25 - 30 triệu</option>
              <option value="30 - 50 triệu">30 - 50 triệu</option>
              <option value="Trên 50 triệu">Trên 50 triệu</option>
              <option value="Thỏa thuận">Thỏa thuận</option>
            </select>
          </div>
          <div className={cx('form-group', 'location-group')} ref={locationRef}> 
            <label htmlFor="location">Địa điểm làm việc</label>
            <div className={cx('location-selector')} onClick={() => setShowLocationDropdown(true)}>
              <span className={cx('location-text')}>
                {location || "Chọn địa điểm"}
              </span>
              <i className={cx('fa-solid fa-chevron-down', { rotated: showLocationDropdown })}></i>
            </div>

            {showLocationDropdown && (
              <>
                <div className={cx('location-overlay')} onClick={() => setShowLocationDropdown(false)} />
                <div className={cx('location-dropdown')}>
                  <div className={cx('provinces-list')}>
                    <div className={cx('dropdown-header')}>
                      <h4>Chọn Tỉnh/Thành phố</h4>
                      <input type="text" placeholder="Tìm kiếm..." className={cx('search-input')} />
                    </div>
                    <div className={cx('dropdown-content')}>
                      {provinces.map((province) => (
                        <div
                          key={province.id}
                          className={cx('location-item', { selected: selectedProvince === province.id })}
                          onClick={() => handleProvinceSelect(province.id)}
                        >
                          {province.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedProvince && (
                    <div className={cx('districts-list')}>
                      <div className={cx('dropdown-header')}>
                        <h4>Chọn Quận/Huyện</h4>
                        <input type="text" placeholder="Tìm kiếm..." className={cx('search-input')} />
                      </div>
                      <div className={cx('dropdown-content')}>
                        {districts.map((district) => (
                          <div
                            key={district.id}
                            className={cx('location-item', { selected: selectedDistrict === district.id })}
                            onClick={() => handleDistrictSelect(district.id)}
                          >
                            {district.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <div className={cx('form-group')}> 
            <label htmlFor="experience">Kinh nghiệm</label>
            <select id="experience" value={experience} onChange={(e) => setExperience(e.target.value)} required>
              <option value="">Tất cả</option>
              <option value="Không yêu cầu">Không yêu cầu</option>
              <option value="Dưới 1 năm">Dưới 1 năm</option>
              <option value="1 năm">1 năm</option>
              <option value="2 năm">2 năm</option>
              <option value="3 năm">3 năm</option>
              <option value="4 năm">4 năm</option>
              <option value="5 năm">5 năm</option>
            </select>
          </div>
          <div className={cx('form-group')}> 
            <label htmlFor="jobType">Hình thức làm việc</label>
            <select id="jobType" value={jobType} onChange={(e) => setJobType(e.target.value)} required>
              <option value="">Chọn hình thức</option>
              <option value="Toàn thời gian">Toàn thời gian</option>
              <option value="Bán thời gian">Bán thời gian</option>
              <option value="Thực tập">Thực tập</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div className={cx('form-group')}> 
            <label htmlFor="rank">Cấp bậc</label>
            <select id="rank" value={rank} onChange={(e) => setRank(e.target.value)} required>
              <option value="">Chọn cấp bậc</option>
              <option value="staff">Nhân viên</option>
              <option value="team_lead">Trưởng nhóm</option>
              <option value="manager">Trưởng/Phó phòng</option>
              <option value="Quản lý / Giám sát">Quản lý / Giám sát</option>
              <option value="branch_manager">Trưởng chi nhánh</option>
              <option value="vice_director">Phó giám đốc</option>
              <option value="director">Giám đốc</option>
              <option value="intern">Thực tập sinh</option>
            </select>
          </div>
          <div className={cx('form-group')}> 
            <label htmlFor="deadline">Hạn nộp đơn</label>
            <input type="date" id="deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
          </div>
          <div className={cx('form-group')}> 
            <label htmlFor="benefits">Quyền lợi</label>
            <textarea id="benefits" value={benefits} onChange={(e) => setBenefits(e.target.value)} required />
          </div>
          <div className={cx('form-group')}> 
            <label htmlFor="jobRequirements">Yêu cầu công việc</label>
            <textarea id="jobRequirements" value={jobRequirements} onChange={(e) => setJobRequirements(e.target.value)} required />
          </div>
          <div className={cx('form-group')}> 
            <label htmlFor="workingLocation">Địa điểm làm việc</label>
            <input type="text" id="workingLocation" value={workingLocation} onChange={(e) => setWorkingLocation(e.target.value)} required />
          </div>
          <div className={cx('form-group')}> 
            <label htmlFor="status">Trạng thái</label>
            {status === 'Active' ? (
              <input type="text" id="status" value={statusLabel} readOnly />
            ) : (
              <input type="text" id="status" value={statusLabel} readOnly />
            )}
          </div>
          <div className={cx('form-group')}> 
            <label htmlFor="categoryId">Chuyên ngành</label>
            <div 
              className={cx('category-selector')} 
              onClick={() => setShowCategoryModal(true)}
            >
              <span className={cx('category-text')}>
                {categoryName}
              </span>
              <i className={cx('fa-solid fa-chevron-down')}></i>
            </div>
          </div>
          <div className={cx('button-group')}> 
            <button type="submit" className={cx('submit-btn')}>Lưu thay đổi</button>
            <button type="button" className={cx('cancel-btn')} onClick={() => { onClose(); setSelectedJob(null); }}>Hủy</button>
          </div>
        </form>
        
        {/* Category Modal */}
        {showCategoryModal && (
          <div className={cx('modal-overlay', 'inner-modal')} ref={categoryRef}>
            <div className={cx('modal-content', 'category-modal')}>
              <div className={cx('modal-header')}>
                <h3>Chọn danh mục nghề</h3>
                <button className={cx('close-btn')} onClick={() => setShowCategoryModal(false)}>
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>

              <div className={cx('modal-body')}>
                {/* Category navigation path */}
                {categoryPath.length > 1 && (
                  <div className={cx('category-path')}>
                    {categoryPath.map((item, index) => (
                      <span key={item.id}>
                        <button 
                          className={cx('path-item', { active: index === categoryPath.length - 1 })}
                          onClick={() => handleCategoryPathClick(index)}
                        >
                          {item.name}
                        </button>
                        {index < categoryPath.length - 1 && <i className="fas fa-chevron-right"></i>}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className={cx('categories-list')}>
                  {categories.map((category) => (
                    <div
                      key={category.category_id}
                      className={cx('category-item', {
                        "has-children": category.level < 3,
                        "active": categoryId === category.category_id || 
                                categoryPath.some(item => item.id === category.category_id)
                      })}
                      onClick={() => handleCategorySelect(category)}
                    >
                      <div className={cx('category-content')}>
                        <span className={cx('category-name')}>{category.category_name}</span>
                        {category.level < 3 && (
                          <i className="fas fa-chevron-right"></i>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={cx('modal-footer')}>
                <button className={cx('cancel-btn')} onClick={() => setShowCategoryModal(false)}>
                  Hủy
                </button>
                <button className={cx('confirm-btn')} onClick={handleConfirmCategory}>
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RecruiterJobs() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [jobApplications, setJobApplications] = useState({});
  const [jobStats, setJobStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    expiredJobs: 0,
    draftJobs: 0
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isJobDetailModalOpen, setIsJobDetailModalOpen] = useState(false);
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 8;
  const [hasBusinessLicense, setHasBusinessLicense] = useState(false);
  const [isCheckingLicense, setIsCheckingLicense] = useState(true);
  const [isCompanyActive, setIsCompanyActive] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsCheckingLicense(true);
        // Fetch company info
        const responseCompany = await authAPI().get(recruiterApis.getAllRecruiterCompanies);
        setCompanyInfo(responseCompany.data.companies[0]);

        // Check company activation status
        const companyResponse = await authAPI().get(recruiterApis.checkRecruiterCompany);
        const isActive = companyResponse.data.recruiterCompany === 'active';
        setIsCompanyActive(isActive);

        // Check business license
        const responseCheckLicense = await authAPI().get(
          recruiterApis.checkBusinessLicense(responseCompany.data.companies[0].company_id)
        );
        setHasBusinessLicense(responseCheckLicense.data.businessLicense);

        if (responseCheckLicense.data.businessLicense) {
          // Only fetch other data if business license exists
          // Fetch jobs
          const responseJobs = await authAPI().get(
            recruiterApis.getAllJobsByCompanyId(responseCompany.data.companies[0].company_id)
          );
          setJobs(responseJobs.data.jobs);

          // Calculate job statistics
          const stats = responseJobs.data.jobs.reduce((acc, job) => {
            acc.totalJobs++;
            acc[`${job.status.toLowerCase()}Jobs`]++;
            return acc;
          }, { totalJobs: 0, activeJobs: 0, pendingJobs: 0, expiredJobs: 0, draftJobs: 0 });
          
          setJobStats(stats);

          // Get all job applications for each job
          const applications = {};
          for (const job of responseJobs.data.jobs) {
            const responseJobApplications = await authAPI().get(
              recruiterApis.getAllJobApplicationsByJobId(job.job_id)
            );
            applications[job.job_id] = responseJobApplications.data.jobApplications;
          }
          setJobApplications(applications);
        }
      } catch (error) {
        console.error(error);
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setIsCheckingLicense(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  const handleEditJob = (job) => {
    setSelectedJob(job);
    setIsEditModalOpen(true);
    console.log(job);
  };

  const handleEditSubmit = async (jobId, updatedJob) => {
    try {
      await authAPI().post(recruiterApis.editJob(jobId), updatedJob);
      setJobs((prevJobs) => prevJobs.map((job) => (job.job_id === jobId ? { ...job, ...updatedJob } : job)));
      toast.success('Chỉnh sửa tin tuyển dụng thành công!');
    } catch (error) {
      console.error("Error editing job:", error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa tin tuyển dụng này?');
    if (!confirmDelete) return;

    try {
      await authAPI().delete(recruiterApis.deleteJob(jobId));
      setJobs((prevJobs) => prevJobs.filter((job) => job.job_id !== jobId));
      toast.success('Xóa tin tuyển dụng thành công!');
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const handleViewJob = (job) => {
    setSelectedJobDetails(job);
    setIsJobDetailModalOpen(true);
  };

  const isJobExpired = (deadline) => {
    return new Date(deadline) < new Date();
  };

  const getFilteredJobs = () => {
    let filtered = [...jobs];

    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeTab !== 'all') {
      filtered = filtered.filter(job => {
        if (activeTab === 'expired') {
          return isJobExpired(job.deadline);
        }
        if (activeTab === 'active') {
          return job.status === 'Active' && !isJobExpired(job.deadline);
        }
        if (activeTab === 'closed') {
          return job.status === 'Closed';
        }
        return job.status.toLowerCase() === activeTab;
      });
    }

    return filtered;
  };

  // Tính toán các jobs cho trang hiện tại
  const getCurrentJobs = () => {
    const filtered = getFilteredJobs();
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    return filtered.slice(indexOfFirstJob, indexOfLastJob);
  };

  // Tính tổng số trang
  const totalPages = Math.ceil(getFilteredJobs().length / jobsPerPage);

  // Tạo mảng các số trang để hiển thị
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleAddLicense = () => {
    navigate("/recruiter/settings", { state: { activeTab: 'license' } });
  };

  if (isCheckingLicense) {
    return (
      <div className={cx("wrapper")}>
        <div className={cx("loading")}>
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!hasBusinessLicense) {
    return (
      <div className={cx("wrapper")}>
        <div className={cx("no-license")}>
          <div className={cx("message")}>
            <i className="fa-solid fa-exclamation-triangle"></i>
            <h2>Bạn cần cập nhật giấy phép kinh doanh</h2>
            <p>Để sử dụng tính năng quản lý tin tuyển dụng, vui lòng cập nhật thông tin giấy phép kinh doanh của công ty.</p>
            <button className={cx("add-license-btn")} onClick={handleAddLicense}>
              <i className="fa-solid fa-plus"></i>
              Thêm giấy phép kinh doanh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cx('wrapper')}>
      <div className={cx('header-section')}>
        <div className={cx('title-section')}>
          <h1>Quản lý Tin Tuyển Dụng</h1>
          {isCompanyActive ? (
            <button className={cx('create-job-btn')} onClick={() => navigate('/recruiter/post-job')}>
              <i className="fa-solid fa-plus"></i>
              Đăng tin tuyển dụng
            </button>
          ) : (
            <button className={cx('create-job-btn', 'disabled')} disabled>
              <i className="fa-solid fa-exclamation-circle"></i>
              Tài khoản chưa được kích hoạt
            </button>
          )}
        </div>

        <div className={cx('stats-section')}>
          <div className={cx('stats-grid')}>
            <div className={cx('stat-card')}>
              <i className="fa-solid fa-briefcase"></i>
              <div className={cx('stat-info')}>
                <span className={cx('stat-value')}>{jobStats.totalJobs}</span>
                <span className={cx('stat-label')}>Tổng tin tuyển dụng</span>
              </div>
            </div>
            <div className={cx('stat-card')}>
              <i className="fa-solid fa-circle-check"></i>
              <div className={cx('stat-info')}>
                <span className={cx('stat-value')}>{jobStats.activeJobs}</span>
                <span className={cx('stat-label')}>Tin đang hiển thị</span>
              </div>
            </div>
            <div className={cx('stat-card')}>
              <i className="fa-solid fa-circle-xmark"></i>
              <div className={cx('stat-info')}>
                <span className={cx('stat-value')}>{jobStats.expiredJobs}</span>
                <span className={cx('stat-label')}>Tin hết hạn</span>
              </div>
            </div>
            <div className={cx('stat-card')}>
              <i className="fa-solid fa-file-lines"></i>
              <div className={cx('stat-info')}>
                <span className={cx('stat-value')}>{jobStats.draftJobs}</span>
                <span className={cx('stat-label')}>Tin đóng</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={cx('content-section')}>
        <div className={cx('filter-section')}>
          <div className={cx('tabs')}>
            <button 
              className={cx('tab', { active: activeTab === 'all' })}
              onClick={() => setActiveTab('all')}
              data-tab="all"
            >
              Tất cả tin
              <span className={cx('count-badge')}>{jobs.length}</span>
            </button>
            <button
              className={cx('tab', { active: activeTab === 'active' })}
              onClick={() => setActiveTab('active')}
              data-tab="active"
            >
              <i className={JOB_STATUS.ACTIVE.icon}></i>
              Đang hiển thị
              <span className={cx('count-badge')}>
                {jobs.filter(job => job.status === 'Active' && !isJobExpired(job.deadline)).length}
              </span>
            </button>
            <button
              className={cx('tab', { active: activeTab === 'pending' })}
              onClick={() => setActiveTab('pending')}
              data-tab="pending"
            >
              <i className={JOB_STATUS.PENDING.icon}></i>
              Chờ duyệt
              <span className={cx('count-badge')}>
                {jobs.filter(job => job.status === 'Pending').length}
              </span>
            </button>
            <button
              className={cx('tab', { active: activeTab === 'expired' })}
              onClick={() => setActiveTab('expired')}
              data-tab="expired"
            >
              <i className={JOB_STATUS.EXPIRED.icon}></i>
              Hết hạn
              <span className={cx('count-badge')}>
                {jobs.filter(job => isJobExpired(job.deadline)).length}
              </span>
            </button>
            <button
              className={cx('tab', { active: activeTab === 'closed' })}
              onClick={() => setActiveTab('closed')}
              data-tab="closed"
            >
              <i className={JOB_STATUS.CLOSED.icon}></i>
              Đã đóng
              <span className={cx('count-badge')}>
                {jobs.filter(job => job.status === 'Closed').length}
              </span>
            </button>
          </div>

          <div className={cx('search-section')}>
            <div className={cx('search-box')}>
              <i className="fa-solid fa-search"></i>
              <input 
                type="text" 
                placeholder="Tìm kiếm tin tuyển dụng..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={cx('jobs-grid')}>
          {getCurrentJobs().map(job => (
            <div key={job.job_id} className={cx('job-card')}>
              <div className={cx('job-header')}>
                <h3>{job.title}</h3>
                <span className={cx('job-status')} 
                  data-status={job.status.toLowerCase()}
                  style={{ 
                    color: JOB_STATUS[job.status]?.color,
                    backgroundColor: `${JOB_STATUS[job.status]?.color}15`
                  }}
                >
                  <i className={JOB_STATUS[job.status]?.icon}></i>
                  {JOB_STATUS[job.status]?.label}
                </span>
              </div>
              
              <div className={cx('job-info')}>
                <p><i className="fa-solid fa-building"></i>{companyInfo?.company_name}</p>
                <p><i className="fa-solid fa-location-dot"></i>{job.location || "Không có địa điểm"}</p>
                <p><i className="fa-solid fa-clock"></i>Hết hạn: {new Date(job.deadline).toLocaleDateString('en-US')}</p>
              </div>

              <div className={cx('job-stats')}>
                <span><i className="fa-solid fa-eye"></i>{job.views || 0} lượt xem</span>
                <span><i className="fa-solid fa-users"></i>{jobApplications[job.job_id]?.length || 0} ứng viên</span>
              </div>

              <div className={cx('job-actions')}>
                <button className={cx('action-btn', 'edit')} onClick={() => handleEditJob(job)}>
                  <i className="fa-solid fa-pen"></i>Chỉnh sửa
                </button>
                <button className={cx('action-btn', 'delete')} onClick={() => handleDeleteJob(job.job_id)}>
                  <i className="fa-solid fa-trash"></i>Xóa
                </button>
                <button className={cx('action-btn', 'view')} onClick={() => handleViewJob(job)}>
                  <i className="fa-solid fa-eye"></i>Xem Job
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Thêm phân trang */}
        {totalPages > 1 && (
          <div className={cx('pagination')}>
            <button 
              className={cx('pagination-btn')} 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            {getPageNumbers().map(number => (
              <button
                key={number}
                className={cx('pagination-btn', { active: currentPage === number })}
                onClick={() => setCurrentPage(number)}
              >
                {number}
              </button>
            ))}

            <button 
              className={cx('pagination-btn')} 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
      <EditJobModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        jobData={selectedJob} 
        onEdit={handleEditSubmit} 
        setSelectedJob={setSelectedJob} 
      />
      <JobDetailModal 
        isOpen={isJobDetailModalOpen} 
        onClose={() => setIsJobDetailModalOpen(false)} 
        jobDetails={selectedJobDetails} 
      />
    </div>
  );
}

export default RecruiterJobs;
