import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames/bind";
import styles from "./SearchCandidate.module.scss";
import { authAPI, recruiterApis } from "~/utils/api";
import images from "~/assets/images";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const cx = classNames.bind(styles);

const SearchCandidate = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    experience: "all",
    salary: "all",
    employment_type: "all",
    location: "all",
    skills: [],
    availability: "all",
    education: "all",
    industry: 'all',
    gender: 'all',
    expected_salary: 'all',
    employment_type: 'all',
    experience: 'all'
  });
  const [allCandidates, setAllCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationRef = useRef(null);

  const experienceOptions = [
    { value: "all", label: "Tất cả kinh nghiệm" },
    { value: "1 year", label: "1 năm" },
    { value: "2 years", label: "2 năm" },
    { value: "3 years", label: "3 năm" },
    { value: "4 years", label: "4 năm" },
    { value: "5 years", label: "5 năm trở lên" }
  ];

  const salaryOptions = [
    { value: "all", label: "Tất cả mức lương" },
    { value: "0-10000000", label: "Dưới 10 triệu" },
    { value: "10000000-20000000", label: "10-20 triệu" },
    { value: "20000000-30000000", label: "20-30 triệu" },
    { value: "30000000-50000000", label: "30-50 triệu" },
    { value: "50000000", label: "Trên 50 triệu" },
  ];
  const industryOptions = [
    { value: "all", label: "Tất cả ngành nghề" },
    { value: "IT", label: "Công nghệ thông tin" },
    { value: "Marketing", label: "Marketing" },
    { value: "Finance", label: "Tài chính - Ngân hàng" },
    { value: "Education", label: "Giáo dục" },
    { value: "Healthcare", label: "Y tế" },
    { value: "Engineering", label: "Kỹ thuật" },
    { value: "Sales", label: "Kinh doanh" },
    { value: "Hospitality", label: "Nhà hàng - Khách sạn" },
    { value: "Logistics", label: "Logistics" },
    { value: "Media", label: "Truyền thông" },
    { value: "Construction", label: "Xây dựng" },
    { value: "Other", label: "Khác" },
  ];

  const employmentTypeOptions = [
    { value: "all", label: "Tất cả" },
    { value: "Part-time", label: "Bán thời gian" },
    { value: "Full-time", label: "Toàn thời gian" },
    { value: "Freelance", label: "Freelance" },
    { value: "Contract", label: "Hợp đồng" },
  ];
  const expectedSalaryOptions = [
    { value: "all", label: "Tất cả" },
    { value: "0-10000000", label: "Dưới 10 triệu" },
    { value: "10000000-20000000", label: "10-20 triệu" },
    { value: "20000000-30000000", label: "20-30 triệu" },
    { value: "30000000-50000000", label: "30-50 triệu" },
    { value: "50000000", label: "Trên 50 triệu" },
  ];
  const degreeOptions = [
    { value: "all", label: "Tất cả" },
    { value: "Bachelor", label: "Bachelor" },
    { value: "Master", label: "Master" },
    { value: "PhD", label: "PhD" },
    { value: "High School", label: "High School" },
  ];

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await authAPI().get(recruiterApis.getAllCandidate);
      setAllCandidates(response.data.candidates);
      setFilteredCandidates(response.data.candidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Có lỗi xảy ra khi tải danh sách ứng viên");
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const normalizeSkills = (skillsString) => {
    if (!skillsString) return [];
    return skillsString.split(',').map(skill => skill.trim().toLowerCase());
  };

  const handleSearch = () => {
    try {
    setIsSearching(true);
      
      let filtered = [...allCandidates];

      if (keyword.trim()) {
        const searchTerms = keyword.toLowerCase().trim().split(',').map(term => term.trim());
        
        filtered = filtered.filter(candidate => {
          const matchesJobOrCompany = 
            (candidate.current_job_title && candidate.current_job_title.toLowerCase().includes(searchTerms[0])) ||
            (candidate.current_company && candidate.current_company.toLowerCase().includes(searchTerms[0]));

          if (matchesJobOrCompany) return true;

          const candidateSkills = normalizeSkills(candidate.skills);
          
          return searchTerms.every(term => 
            candidateSkills.some(skill => skill.includes(term))
          );
        });
      }

      if (filters.industry && filters.industry !== 'all') {
        filtered = filtered.filter(candidate => 
          candidate.industry === filters.industry
        );
      }

      if (filters.gender && filters.gender !== 'all') {
        filtered = filtered.filter(candidate => 
          candidate.gender === filters.gender
        );
      }

      if (filters.expected_salary && filters.expected_salary !== 'all') {
        filtered = filtered.filter(candidate => {
          const salary = parseFloat(candidate.expected_salary || 0);
          const [min, max] = filters.expected_salary.split('-').map(Number);
          
          if (max) {
            return salary >= min && salary <= max;
          } else {
            return salary >= min;
          }
        });
      }

      if (searchName.trim()) {
        const searchTerm = searchName.toLowerCase().trim();
        filtered = filtered.filter(candidate => 
          candidate.user.name.toLowerCase().includes(searchTerm) ||
          (candidate.skills && candidate.skills.toLowerCase().includes(searchTerm))
        );
      }

      if (searchLocation.trim()) {
        const locationTerm = searchLocation.toLowerCase().trim();
        filtered = filtered.filter(candidate => 
          candidate.location && candidate.location.toLowerCase().includes(locationTerm)
        );
      }

      if (filters.employment_type && filters.employment_type !== 'all') {
        filtered = filtered.filter(candidate => 
          candidate.employment_type === filters.employment_type
        );
      }

      if (filters.experience && filters.experience !== 'all') {
        filtered = filtered.filter(candidate => {
          if (!candidate.experience) return false;
          
          const years = candidate.experience.split(' ')[0];
          const selectedYears = filters.experience.split(' ')[0];

          if (filters.experience === '5 years') {
            return parseInt(years) >= 5;
          } else {
            return years === selectedYears;
          }
        });
      }

      if (selectedProvince) {
        const province = provinces.find(p => p.code === selectedProvince);
        filtered = filtered.filter(candidate => 
          candidate.location && candidate.location.includes(province.name)
        );

        if (selectedDistrict) {
          const district = districts.find(d => d.code === selectedDistrict);
          filtered = filtered.filter(candidate => 
            candidate.location && candidate.location.includes(district.name)
          );
        }
      }

      setFilteredCandidates(filtered);
      toast.success(`Tìm thấy ${filtered.length} ứng viên phù hợp`);

    } catch (error) {
      console.error("Error filtering candidates:", error);
      toast.error("Có lỗi xảy ra khi lọc ứng viên");
    } finally {
    setIsSearching(false);
    }
  };

  const handleCandidateClick = (candidateId) => {
    console.log("Clicking candidate with ID:", candidateId);
    navigate(`/recruiter/candidate-detail/${candidateId}`);
  };

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch("https://provinces.open-api.vn/api/p/");
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  const handleProvinceSelect = async (provinceId) => {
    setSelectedProvince(provinceId);
    setSelectedDistrict(null);
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceId}?depth=2`);
      const data = await response.json();
      setDistricts(data.districts);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const handleDistrictSelect = (districtId) => {
    setSelectedDistrict(districtId);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClearLocation = () => {
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setShowLocationDropdown(false);
    
    let filtered = [...allCandidates];

    if (keyword.trim()) {
      const searchTerms = keyword.toLowerCase().trim().split(',').map(term => term.trim());
      filtered = filtered.filter(candidate => {
        const matchesJobOrCompany = 
          (candidate.current_job_title && candidate.current_job_title.toLowerCase().includes(searchTerms[0])) ||
          (candidate.current_company && candidate.current_company.toLowerCase().includes(searchTerms[0]));

        if (matchesJobOrCompany) return true;

        const candidateSkills = normalizeSkills(candidate.skills);
        return searchTerms.every(term => 
          candidateSkills.some(skill => skill.includes(term))
        );
      });
    }

    if (filters.industry && filters.industry !== 'all') {
      filtered = filtered.filter(candidate => candidate.industry === filters.industry);
    }

    if (filters.gender && filters.gender !== 'all') {
      filtered = filtered.filter(candidate => candidate.gender === filters.gender);
    }

    if (filters.employment_type && filters.employment_type !== 'all') {
      filtered = filtered.filter(candidate => candidate.employment_type === filters.employment_type);
    }

    if (filters.experience && filters.experience !== 'all') {
      filtered = filtered.filter(candidate => candidate.experience === filters.experience);
    }

    setFilteredCandidates(filtered);
    toast.success('Đã xóa bộ lọc địa điểm');
  };

  return (
    <div className={cx("wrapper")}>
      <div className={cx("candidate-search")}>
        <div className={cx("search-header")}>
          <div className={cx("container")}>
            <div className={cx("search-form")}>
              <div className={cx("search-input")}>
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, kỹ năng..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <div className={cx("location-group")} ref={locationRef}>
                <div className={cx("location-input")} onClick={() => setShowLocationDropdown(true)}>
                  <i className="fa-solid fa-map-marker-alt"></i>
                  <span className={cx("location-text")}>
                    {selectedProvince 
                      ? `${provinces.find(p => p.code === selectedProvince)?.name}${
                          selectedDistrict 
                            ? `, ${districts.find(d => d.code === selectedDistrict)?.name}` 
                            : ''
                        }`
                      : 'Chọn địa điểm'
                    }
                  </span>
                  <i className={cx("chevron-icon", showLocationDropdown && "rotated")}></i>
                </div>

                {showLocationDropdown && (
                  <>
                    <div className={cx("location-overlay")} onClick={() => setShowLocationDropdown(false)} />
                    <div className={cx("location-dropdown")}>
                      <div className={cx("provinces-list")}>
                        <div className={cx("dropdown-header")}>
                          <h4>Chọn Tỉnh/Thành phố</h4>
                          <input type="text" placeholder="Tìm kiếm tỉnh thành..." className={cx("search-input")} />
                        </div>
                        <div className={cx("dropdown-content")}>
                          {provinces.map((province) => (
                            <label key={province.code} className={cx("checkbox-item")}>
                              <input
                                type="radio"
                                checked={selectedProvince === province.code}
                                onChange={() => handleProvinceSelect(province.code)}
                              />
                              <span>{province.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className={cx("districts-list")}>
                        <div className={cx("dropdown-header")}>
                          <h4>Chọn Quận/Huyện</h4>
                          <input type="text" placeholder="Tìm kiếm quận huyện..." className={cx("search-input")} />
                        </div>
                        <div className={cx("dropdown-content")}>
                          {districts.map((district) => (
                            <label key={district.code} className={cx("checkbox-item")}>
                <input
                                type="radio"
                                checked={selectedDistrict === district.code}
                                onChange={() => handleDistrictSelect(district.code)}
                              />
                              <span>{district.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button 
                className={cx("search-button", { searching: isSearching })}
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Đang tìm...
                  </>
                ) : (
                  <>
                    <i className="fas fa-search"></i> Tìm kiếm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className={cx("container")}>
          <div className={cx("content")}>
            <aside className={cx("filters")}>
              <div className={cx("filter-section")}>
                <h3>Tìm kiếm theo từ khóa</h3>
                <div className={cx("filter-input")}>
                  <input
                    type="text"
                    placeholder="Nhập kỹ năng (VD: JavaScript, React)"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                  />
                  <div className={cx("search-hint")}>
                    Gợi ý: Nhập nhiều kỹ năng, phân cách bằng dấu phẩy
              </div>
                </div>
              </div>

              <div className={cx("filter-section")}>
                <h3>Ngành nghề</h3>
                <select 
                  className={cx("filter-select")}
                  value={filters.industry}
                  onChange={(e) => handleFilterChange('industry', e.target.value)}
                >
                  {industryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={cx("filter-section")}>
                <h3>Mức lương mong muốn</h3>
                <select 
                  className={cx("filter-select")}
                  value={filters.expected_salary}
                  onChange={(e) => handleFilterChange('expected_salary', e.target.value)}
                >
                  {expectedSalaryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={cx("filter-section")}>
                <h3>Bằng cấp</h3>
                <select className={cx("filter-select")}>
                  {degreeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={cx("filter-section")}>
                <h3>Giới tính</h3>
                <select 
                  className={cx("filter-select")}
                  value={filters.gender}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                </select>
              </div>

              <div className={cx("filter-section")}>
                <h3>Quốc tịch</h3>
                <select className={cx("filter-select")}>
                  <option value="all">Tất cả</option>
                  <option value="Vietnamese">Việt Nam</option>
                  <option value="Other">Khác</option>
                </select>
              </div>

              <div className={cx("filter-section")}>
                <h3>Hình thức làm việc</h3>
                <select 
                  className={cx("filter-select")}
                  value={filters.employment_type}
                  onChange={(e) => handleFilterChange('employment_type', e.target.value)}
                >
                  {employmentTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={cx("filter-section")}>
                <h3>Kinh nghiệm</h3>
                <select 
                  className={cx("filter-select")}
                  value={filters.experience}
                  onChange={(e) => handleFilterChange('experience', e.target.value)}
                >
                  {experienceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </aside>

            <main className={cx("candidate-list")}>
              <div className={cx("candidate-list-header")}>
                <div className={cx("total-candidates")}>
                  Tìm thấy {filteredCandidates.length} ứng viên
                </div>
                {selectedProvince && (
                  <button 
                    className={cx("clear-location")} 
                    onClick={handleClearLocation}
                  >
                    <span>
                      {provinces.find(p => p.code === selectedProvince)?.name}
                      {selectedDistrict && `, ${districts.find(d => d.code === selectedDistrict)?.name}`}
                    </span>
                    <i className="fas fa-times"></i>
                  </button>
                )}
                <div className={cx("sort-section")}>
                  <select className={cx("sort-select")}>
                    <option value="relevance">Mức độ phù hợp</option>
                    <option value="recent">Mới nhất</option>
                    <option value="experience">Kinh nghiệm</option>
                  </select>
                </div>
              </div>

              <div className={cx("candidates")}>
                {filteredCandidates.map((candidate) => {
                  console.log("Candidate data:", candidate);
                  return (
                    <div 
                      key={candidate.candidate_id} 
                      className={cx("candidate-card")}
                    >
                      <div className={cx("candidate-avatar")}>
                        <img
                          src={candidate.profile_picture || images.avatar}
                          alt="Avatar"
                        />
                      </div>
                      
                      <div className={cx("candidate-info")}>
                        <h3 className={cx("candidate-name")}>
                          {candidate.user.name}
                        </h3>
                        <div className={cx("candidate-meta")}>
                          <span>
                            <i className="fas fa-map-marker-alt"></i>
                            {candidate.location || "Chưa cập nhật"}
                          </span>
                          <span>
                            {candidate.current_job_title || "Chưa cập nhật"}
                          </span>
                        </div>
                        <div className={cx("skills")}>
                          {candidate.skills
                            ?.split(",")
                            ?.slice(0, 3)
                            ?.map((skill, index) => (
                              <span key={index} className={cx("skill-tag")}>
                                {skill.trim()}
                              </span>
                            )) || (
                            <span className={cx("skill-tag")}>
                              Chưa cập nhật kỹ năng
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        className={cx("view-profile-btn")}
                        onClick={() =>
                          handleCandidateClick(candidate.candidate_id)
                        }
                      >
                        Xem hồ sơ
                      </button>
                    </div>
                  );
                })}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchCandidate;
