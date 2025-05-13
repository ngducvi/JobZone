import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames/bind";
import styles from "./SearchCandidate.module.scss";
import { authAPI, recruiterApis } from "~/utils/api";
import images from "~/assets/images";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaUserCheck, FaSpinner, FaChartBar, FaSearch, FaRobot, FaLock } from "react-icons/fa";

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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const locationRef = useRef(null);
  const filtersRef = useRef(null);

  // New state variables for similar candidate search
  const [showIdealCandidateForm, setShowIdealCandidateForm] = useState(false);
  const [idealCandidate, setIdealCandidate] = useState({
    skills: "",
    experience: "",
    position: "",
    company: "",
    education: "",
    salary: "",
    location: "",
    industry: "",
  });
  const [searchCriteria, setSearchCriteria] = useState([
    "Kỹ năng phù hợp",
    "Kinh nghiệm phù hợp",
    "Ngành nghề phù hợp",
  ]);
  const [isFindingSimilar, setIsFindingSimilar] = useState(false);
  const [similarResults, setSimilarResults] = useState(null);
  const [selectedAIModel, setSelectedAIModel] = useState("gpt-4o-mini");

  const [userPlan, setUserPlan] = useState('Basic');
  const [companyInfo, setCompanyInfo] = useState(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);

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
    fetchUserPlan();
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

  const fetchUserPlan = async () => {
    try {
      setIsLoadingPlan(true);
      // Fetch company info
      const responseCompany = await authAPI().get(
        recruiterApis.getAllRecruiterCompanies
      );
      if (responseCompany.data.companies && responseCompany.data.companies.length > 0) {
        const company = responseCompany.data.companies[0];
        setCompanyInfo(company);
        setUserPlan(company.plan || 'Basic');
      }
    } catch (error) {
      console.error("Error fetching user plan:", error);
    } finally {
      setIsLoadingPlan(false);
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
      
      if (filtersRef.current && !filtersRef.current.contains(event.target) && !event.target.closest(`.${cx('filters-toggle')}`)) {
        setShowMobileFilters(false);
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

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 992);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Handle ideal candidate form change
  const handleIdealCandidateChange = (e) => {
    const { name, value } = e.target;
    setIdealCandidate(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle search criteria change
  const handleCriteriaChange = (e, criterion) => {
    const { checked } = e.target;
    if (checked) {
      setSearchCriteria(prev => [...prev, criterion]);
    } else {
      setSearchCriteria(prev => prev.filter(item => item !== criterion));
    }
  };

  // Find similar candidates
  const findSimilarCandidates = async () => {
    if (userPlan !== 'ProMax') {
      toast.error('Tính năng tìm kiếm AI chỉ khả dụng cho gói ProMax. Vui lòng nâng cấp để sử dụng.');
      return;
    }
    
    try {
      setIsFindingSimilar(true);
      
      // Validate form
      if (!idealCandidate.skills && !idealCandidate.position && !idealCandidate.company) {
        toast.error("Vui lòng nhập ít nhất một trong các trường: Kỹ năng, Vị trí, Công ty");
        setIsFindingSimilar(false);
        return;
      }

      const response = await authAPI().post(recruiterApis.findSimilarCandidates, {
        idealCandidate,
        searchCriteria,
        model: selectedAIModel
      });

      if (response.data && response.data.similar_candidates) {
        setSimilarResults(response.data);
        setFilteredCandidates(
          response.data.similar_candidates.map(result => {
            const candidate = allCandidates.find(c => c.candidate_id === result.candidate_id);
            return {
              ...candidate,
              match_score: result.match_score,
              match_reasons: result.match_reasons,
              gap_analysis: result.gap_analysis
            };
          })
        );
        toast.success(`Tìm thấy ${response.data.similar_candidates.length} ứng viên phù hợp`);
      } else {
        toast.error("Không tìm thấy ứng viên phù hợp");
      }
    } catch (error) {
      console.error("Error finding similar candidates:", error);
      toast.error("Có lỗi xảy ra khi tìm ứng viên tương tự");
    } finally {
      setIsFindingSimilar(false);
    }
  };

  // Toggle ideal candidate form
  const toggleIdealCandidateForm = () => {
    if (userPlan !== 'ProMax') {
      toast.error('Tính năng tìm kiếm AI chỉ khả dụng cho gói ProMax. Vui lòng nâng cấp để sử dụng.');
      return;
    }
    setShowIdealCandidateForm(prev => !prev);
  };

  // Reset search
  const resetSearch = () => {
    setIdealCandidate({
      skills: "",
      experience: "",
      position: "",
      company: "",
      education: "",
      salary: "",
      location: "",
      industry: "",
    });
    setSimilarResults(null);
    setFilteredCandidates(allCandidates);
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
                  <i className={`fa-solid fa-chevron-down ${cx("chevron-icon", showLocationDropdown && "rotated")}`}></i>
                </div>

                {showLocationDropdown && (
                  <>
                    <div className={cx("location-overlay")} onClick={() => setShowLocationDropdown(false)} />
                    <div className={cx("location-dropdown")}>
                      {isMobile && (
                        <div className={cx("mobile-dropdown-header")}>
                          <h3>Chọn địa điểm</h3>
                          <button onClick={() => setShowLocationDropdown(false)}>
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      )}
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

        {/* AI Candidate Search Section */}
        <div className={cx("ai-search-section", { "locked": userPlan !== 'ProMax' })}>
          <div className={cx("container")}>
            <div className={cx("ai-search-header")}>
              <h2>
                <FaRobot className={cx("ai-icon")} />
                Tìm kiếm ứng viên bằng AI
              </h2>
              {userPlan !== 'ProMax' ? (
                <div className={cx("plan-upgrade-message")}>
                  <FaLock />
                  <span>Tính năng chỉ khả dụng cho gói ProMax</span>
                  <button 
                    onClick={() => navigate('/recruiter/pricing')}
                    className={cx("upgrade-button")}
                  >
                    Nâng cấp
                  </button>
                </div>
              ) : (
                <button 
                  className={cx("toggle-ai-search")} 
                  onClick={toggleIdealCandidateForm}
                >
                  {showIdealCandidateForm ? "Ẩn tìm kiếm AI" : "Mở tìm kiếm AI"}
                </button>
              )}
            </div>

            {showIdealCandidateForm && userPlan === 'ProMax' && (
              <div className={cx("ideal-candidate-form")}>
                <div className={cx("form-header")}>
                  <h3>Mô tả ứng viên lý tưởng</h3>
                  <p>Hệ thống AI sẽ phân tích và tìm ứng viên phù hợp nhất với mô tả của bạn</p>
                </div>

                <div className={cx("form-row")}>
                  <div className={cx("form-group")}>
                    <label>Kỹ năng cần có</label>
                    <textarea
                      name="skills"
                      placeholder="VD: JavaScript, React, Node.js, 3 năm kinh nghiệm frontend"
                      value={idealCandidate.skills}
                      onChange={handleIdealCandidateChange}
                    />
                  </div>
                  <div className={cx("form-group")}>
                    <label>Kinh nghiệm mong muốn</label>
                    <input
                      type="text"
                      name="experience"
                      placeholder="VD: 3-5 năm kinh nghiệm dev"
                      value={idealCandidate.experience}
                      onChange={handleIdealCandidateChange}
                    />
                  </div>
                </div>

                <div className={cx("form-row")}>
                  <div className={cx("form-group")}>
                    <label>Vị trí công việc</label>
                    <input
                      type="text"
                      name="position"
                      placeholder="VD: Frontend Developer, Project Manager"
                      value={idealCandidate.position}
                      onChange={handleIdealCandidateChange}
                    />
                  </div>
                  <div className={cx("form-group")}>
                    <label>Công ty hiện tại/trước đó</label>
                    <input
                      type="text"
                      name="company"
                      placeholder="VD: Google, Microsoft, FPT"
                      value={idealCandidate.company}
                      onChange={handleIdealCandidateChange}
                    />
                  </div>
                </div>

                <div className={cx("form-row")}>
                  <div className={cx("form-group")}>
                    <label>Trình độ học vấn</label>
                    <input
                      type="text"
                      name="education"
                      placeholder="VD: Đại học, Cao đẳng CNTT"
                      value={idealCandidate.education}
                      onChange={handleIdealCandidateChange}
                    />
                  </div>
                  <div className={cx("form-group")}>
                    <label>Mức lương mong muốn</label>
                    <input
                      type="text"
                      name="salary"
                      placeholder="VD: 20-30 triệu"
                      value={idealCandidate.salary}
                      onChange={handleIdealCandidateChange}
                    />
                  </div>
                </div>

                <div className={cx("form-row")}>
                  <div className={cx("form-group")}>
                    <label>Địa điểm</label>
                    <input
                      type="text"
                      name="location"
                      placeholder="VD: TP.HCM, Hà Nội"
                      value={idealCandidate.location}
                      onChange={handleIdealCandidateChange}
                    />
                  </div>
                  <div className={cx("form-group")}>
                    <label>Ngành nghề</label>
                    <input
                      type="text"
                      name="industry"
                      placeholder="VD: IT, Marketing, Tài chính"
                      value={idealCandidate.industry}
                      onChange={handleIdealCandidateChange}
                    />
                  </div>
                </div>

                <div className={cx("form-row")}>
                  <div className={cx("form-group", "full-width")}>
                    <label>Tiêu chí ưu tiên</label>
                    <div className={cx("criteria-options")}>
                      {[
                        "Kỹ năng phù hợp",
                        "Kinh nghiệm phù hợp",
                        "Ngành nghề phù hợp",
                        "Mức lương phù hợp",
                        "Địa điểm phù hợp",
                        "Trình độ học vấn phù hợp",
                        "Công ty làm việc trước đây"
                      ].map((criterion) => (
                        <label key={criterion} className={cx("criteria-checkbox")}>
                          <input
                            type="checkbox"
                            checked={searchCriteria.includes(criterion)}
                            onChange={(e) => handleCriteriaChange(e, criterion)}
                          />
                          <span>{criterion}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={cx("form-row")}>
                  <div className={cx("form-group")}>
                    <label>Mô hình AI</label>
                    <select
                      value={selectedAIModel}
                      onChange={(e) => setSelectedAIModel(e.target.value)}
                      className={cx("model-select")}
                    >
                      <option value="gpt-4o-mini">GPT-4o Mini (Nhanh)</option>
                      <option value="gpt-4o">GPT-4o (Chất lượng cao)</option>
                      <option value="claude-haiku">Claude Haiku (Nhanh)</option>
                      <option value="claude-3-opus">Claude 3 Opus (Chất lượng cao)</option>
                    </select>
                  </div>
                </div>

                <div className={cx("form-actions")}>
                  <button
                    className={cx("ai-search-button")}
                    onClick={findSimilarCandidates}
                    disabled={isFindingSimilar}
                  >
                    {isFindingSimilar ? (
                      <>
                        <FaSpinner className={cx("spinner")} /> Đang phân tích...
                      </>
                    ) : (
                      <>
                        <FaSearch /> Tìm ứng viên tương tự
                      </>
                    )}
                  </button>
                  <button
                    className={cx("reset-button")}
                    onClick={resetSearch}
                    disabled={isFindingSimilar}
                  >
                    <i className="fas fa-undo"></i> Đặt lại
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={cx("container")}>
          <div className={cx("content")}>
            <aside className={cx("filters", showMobileFilters && "active")} ref={filtersRef}>
              {isMobile && (
                <div className={cx("filters-header")}>
                  <h2>Bộ lọc tìm kiếm</h2>
                  <button className={cx("close-filters")} onClick={() => setShowMobileFilters(false)}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
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
                  {similarResults ? (
                    <span className={cx("ai-results-summary")}>
                      AI đã tìm thấy {filteredCandidates.length} ứng viên phù hợp
                      {similarResults.analysis && (
                        <span>
                          {" "}({similarResults.analysis.high_match_candidates} ứng viên phù hợp cao)
                        </span>
                      )}
                    </span>
                  ) : (
                    <>Tìm thấy {filteredCandidates.length} ứng viên</>
                  )}
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

              {similarResults && similarResults.analysis && (
                <div className={cx("ai-analysis-results")}>
                  <div className={cx("ai-analysis-header")}>
                    <h3>Phân tích AI</h3>
                    <button className={cx("close-analysis")} onClick={() => setSimilarResults(null)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className={cx("analysis-content")}>
                    <div className={cx("analysis-stats")}>
                      <div className={cx("stat-item")}>
                        <span className={cx("stat-value")}>{similarResults.analysis.total_candidates}</span>
                        <span className={cx("stat-label")}>Tổng ứng viên</span>
                      </div>
                      <div className={cx("stat-item", "high")}>
                        <span className={cx("stat-value")}>{similarResults.analysis.high_match_candidates}</span>
                        <span className={cx("stat-label")}>Phù hợp cao</span>
                      </div>
                      <div className={cx("stat-item", "medium")}>
                        <span className={cx("stat-value")}>{similarResults.analysis.medium_match_candidates}</span>
                        <span className={cx("stat-label")}>Phù hợp vừa</span>
                      </div>
                      <div className={cx("stat-item", "low")}>
                        <span className={cx("stat-value")}>{similarResults.analysis.low_match_candidates}</span>
                        <span className={cx("stat-label")}>Phù hợp thấp</span>
                      </div>
                    </div>
                    
                    {similarResults.analysis.key_skills_missing && similarResults.analysis.key_skills_missing.length > 0 && (
                      <div className={cx("missing-skills")}>
                        <h4>Kỹ năng ít gặp</h4>
                        <div className={cx("skills-list")}>
                          {similarResults.analysis.key_skills_missing.map((skill, index) => (
                            <span key={index} className={cx("missing-skill-tag")}>{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {similarResults.analysis.recommendations && similarResults.analysis.recommendations.length > 0 && (
                      <div className={cx("recommendations")}>
                        <h4>Đề xuất</h4>
                        <ul>
                          {similarResults.analysis.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className={cx("candidates")}>
                {filteredCandidates.map((candidate) => {
                  // console.log("Candidate data:", candidate);
                  return (
                    <div 
                      key={candidate.candidate_id} 
                      className={cx("candidate-card", {
                        "ai-matched": candidate.match_score !== undefined,
                        "high-match": candidate.match_score >= 80,
                        "medium-match": candidate.match_score >= 60 && candidate.match_score < 80,
                        "low-match": candidate.match_score !== undefined && candidate.match_score < 60,
                      })}
                    >
                      {candidate.match_score !== undefined && (
                        <div className={cx("match-indicator")}>
                          <span className={cx("match-score")}>{candidate.match_score}%</span>
                          <span className={cx("match-label")}>phù hợp</span>
                        </div>
                      )}
                      
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

                        {candidate.match_reasons && candidate.match_reasons.length > 0 && (
                          <div className={cx("match-reasons")}>
                            <h4>Lý do phù hợp:</h4>
                            <ul>
                              {candidate.match_reasons.slice(0, 2).map((reason, index) => (
                                <li key={index}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}
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
      
      {isMobile && (
        <button 
          className={cx("filters-toggle")} 
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <i className="fas fa-filter"></i>
        </button>
      )}
    </div>
  );
};

export default SearchCandidate;
