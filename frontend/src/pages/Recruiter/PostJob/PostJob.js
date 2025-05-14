// PostJob page
import React, { useState, useEffect, useContext, useRef } from "react";
import classNames from "classnames/bind";
import styles from "./PostJob.module.scss";
import { authAPI, recruiterApis, userApis } from "~/utils/api";
import { useNavigate } from "react-router-dom";
import UserContext from "~/context/UserContext";
import { toast } from "react-toastify";
import { EventSourcePolyfill } from "event-source-polyfill";
import { FaRobot, FaSpinner, FaChartBar } from "react-icons/fa";
import ModelAI from "~/components/ModelAI";

const cx = classNames.bind(styles);

// Preview Modal Component
const PreviewJobModal = ({ isOpen, onClose, jobDetails, companyInfo }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");

  const analyzeJobPost = async () => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    const token = localStorage.getItem("token");
    
    const prompt = `Là một chuyên gia tuyển dụng, hãy phân tích job post sau và đưa ra nhận xét về ưu điểm và nhược điểm:

Tiêu đề: ${jobDetails.title}
Mô tả: ${jobDetails.description}
Yêu cầu: ${jobDetails.jobRequirements}
Quyền lợi: ${jobDetails.benefits}
Mức lương: ${jobDetails.salary}
Kinh nghiệm: ${jobDetails.experience}
Cấp độ: ${jobDetails.rank}
Địa điểm: ${jobDetails.location}
Hình thức: ${jobDetails.jobType}

Hãy phân tích theo các tiêu chí sau:
1. Tính hấp dẫn của job post
2. Tính rõ ràng và đầy đủ của thông tin
3. Tính cạnh tranh của mức lương và phúc lợi
4. Tính phù hợp giữa yêu cầu và quyền lợi
5. Đề xuất cải thiện`;

    try {
      const eventSource = new EventSourcePolyfill(
        `${process.env.REACT_APP_API_URL}/openai/chat-stream?prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(selectedModel)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'text/event-stream',
          },
          withCredentials: false,
          heartbeatTimeout: 60000,
        }
      );

      let aiResponse = "";

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          aiResponse += data;
          setAnalysis(aiResponse);
        } catch (error) {
          console.error('Error parsing event data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        setIsAnalyzing(false);
      };

    } catch (error) {
      console.error('Error:', error);
      toast.error("Đã xảy ra lỗi khi phân tích job post");
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatContent = (text) => {
    if (!text) return <p>Chưa cập nhật</p>;
    return text.split("\n").map((paragraph, index) => {
      if (paragraph.trim().startsWith("- ")) {
        return (
          <ul key={index}>
            <li>{paragraph.trim().substring(2)}</li>
          </ul>
        );
      }
      return <p key={index}>{paragraph}</p>;
    });
  };

  return (
    <div className={cx("modal-overlay")}>
      <div className={cx("modal-content")}>
        <button className={cx("close-btn")} onClick={onClose}>
          <i className="fa-solid fa-times"></i>
        </button>

        <div className={cx("job-main")}>
          <div className={cx("job-header")}>
            <div className={cx("company-info")}>
              <div className={cx("company-logo")}>
                <img
                  src={companyInfo.logo}
                  alt="Company logo"
                  className={cx("logo-preview")}
                  style={{ width: "70px", height: "70px",
                    objectFit: "cover",
                    borderRadius: "50%",
                    border: "1px solid #ccc",
                    padding: "2px",
                   }}
                />
              </div>
              <div className={cx("company-name")}>
                {companyInfo.company_name}
                <div className={cx("posting-date")}>
                  Hạn nộp: {formatDate(jobDetails.deadline)}
                </div>
              </div>
            </div>

            <h1 className={cx("job-title")}>{jobDetails.title}</h1>

            <div className={cx("job-meta")}>
              <div className={cx("meta-item")}>
                <i className="fa-solid fa-money-bill"></i>
                {jobDetails.salary}
              </div>
              <div className={cx("meta-item")}>
                <i className="fa-solid fa-location-dot"></i>
                {jobDetails.location}
              </div>
              <div className={cx("meta-item")}>
                <i className="fa-solid fa-briefcase"></i>
                {jobDetails.jobType}
              </div>
              <div className={cx("meta-item")}>
                <i className="fa-solid fa-clock"></i>
                {jobDetails.experience}
              </div>
            </div>
          </div>

          <div className={cx("job-content")}>
            <div className={cx("job-section")}>
              <h3>
                <i className="fa-solid fa-circle-info"></i>
                Mô tả công việc
              </h3>
              <div className={cx("section-content")}>
                {formatContent(jobDetails.description)}
              </div>
            </div>

            <div className={cx("job-section")}>
              <h3>
                <i className="fa-solid fa-list-check"></i>
                Yêu cầu công việc
              </h3>
              <div className={cx("section-content")}>
                {formatContent(jobDetails.jobRequirements)}
              </div>
            </div>

            <div className={cx("job-section")}>
              <h3>
                <i className="fa-solid fa-gift"></i>
                Quyền lợi
              </h3>
              <div className={cx("section-content")}>
                {formatContent(jobDetails.benefits)}
              </div>
            </div>
          </div>
        </div>

        <div className={cx("company-sidebar")}>
          <div className={cx("sidebar-section")}>
            <h4>Thông tin chung</h4>
            <div className={cx("company-stats")}>
              <div className={cx("stat-item")}>
                <i className="fa-solid fa-users"></i>
                100-499 nhân viên
              </div>
              <div className={cx("stat-item")}>
                <i className="fa-solid fa-building"></i>
                Bán lẻ - Hàng tiêu dùng - FMCG
              </div>
              <div className={cx("stat-item")}>
                <i className="fa-solid fa-location-dot"></i>
                {jobDetails.location}
              </div>
            </div>
            <a href="#" className={cx("company-link")}>
              Xem trang công ty
              <i className="fa-solid fa-arrow-right"></i>
            </a>
          </div>

          <div className={cx("analysis-section")}>
            <h4>Phân tích AI</h4>
            <button 
              className={cx("analyze-btn")} 
              onClick={analyzeJobPost}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <FaSpinner className={cx("spinner")} />
                  Đang phân tích...
                </>
              ) : (
                <>
                  <FaChartBar />
                  Phân tích job post
                </>
              )}
            </button>
            {analysis && (
              <div className={cx("analysis-content")}>
                <h5>Kết quả phân tích:</h5>
                <div className={cx("analysis-text")}>
                  {analysis.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={cx("action-buttons")}>
            <button className={cx("apply-btn")}>
              <i className="fa-solid fa-paper-plane"></i>
              Ứng tuyển ngay
            </button>
            <button className={cx("save-btn")}>
              <i className="fa-regular fa-bookmark"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function PostJob() {
  const { user } = useContext(UserContext);
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [specialisms, setSpecialisms] = useState("");
  const [salary, setSalary] = useState("");
  const [username, setUsername] = useState("");
  const [jobType, setJobType] = useState("");
  const [careerLevel, setCareerLevel] = useState("");
  const [experience, setExperience] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [location, setLocation] = useState("");
  const [benefits, setBenefits] = useState("");
  const [jobRequirements, setJobRequirements] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [recruiter, setRecruiter] = useState({});
  const [companyInfo, setCompanyInfo] = useState({});
  const [companyId, setCompanyId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedProvinces, setSelectedProvinces] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const locationRef = useRef(null);
  const navigate = useNavigate();

  // State for hierarchical categories
  const [categories, setCategories] = useState([]);
  const [currentCategoryLevel, setCurrentCategoryLevel] = useState(1);
  const [currentParentId, setCurrentParentId] = useState('root');
  const [categoryPath, setCategoryPath] = useState([{ id: 'root', name: 'Tất cả' }]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState("Chọn danh mục nghề");

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await authAPI().get(userApis.getCurrentUser);
        const responseCompany = await authAPI().get(
          recruiterApis.getAllRecruiterCompanies
        );
        setCompanyId(responseCompany.data.companies[0].company_id);
        setUsername(response.data.user.username);
        setRecruiter(response.data.user.username);
        setCompanyInfo(responseCompany.data.companies[0]);
        
        // Initial fetch of top-level categories
        await fetchCategoriesByParentId('root');
      } catch (error) {
        setError("Không thể tải thông tin người dùng.");
      }
    };
    fetchData();
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

  const getLocationDisplay = () => {
    if (selectedProvinces.length === 0) return "Chọn địa điểm làm việc";
    const provinceNames = selectedProvinces
      .map((id) => provinces.find((p) => p.id === id)?.name)
      .filter(Boolean);
    return provinceNames.join(", ");
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
    setLocation(locationText);
    setShowLocationModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Kiểm tra xem danh mục đã được chọn chưa
    if (!categoryId) {
      setError("Vui lòng chọn danh mục nghề trước khi đăng tin.");
      // Cuộn trang đến vị trí phần tử input danh mục
      const categoryInput = document.querySelector(`.${cx("category-input")}`);
      if (categoryInput) {
        categoryInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    console.log("Submitting job data:", {
      jobTitle,
      description,
      email,
      specialisms,
      salary,
      username,
      jobType,
      careerLevel,
      experience,
      location,
      benefits,
      jobRequirements,
      deadline,
      company_id: companyId,
      category_id: categoryId,
    });

    try {
      await authAPI().post(recruiterApis.postJob, {
        title: jobTitle,
        description,
        email,
        specialisms,
        salary,
        working_time: jobType,
        username,
        careerLevel,
        experience,
        location,
        benefits,
        job_requirements: jobRequirements,
        deadline,
        company_id: companyId,
        created_by: username,
        last_modified_by: username,
        category_id: categoryId,
      });
      setSuccess("Đăng tin tuyển dụng thành công!");
      navigate("/recruiter/jobs");
    } catch (err) {
      console.error("Error posting job:", err.response.data); // In ra thông báo lỗi chi tiết
      setError("Đã xảy ra lỗi khi đăng tin tuyển dụng. Vui lòng thử lại.");
    }
  };

  const handlePreview = () => {
    setIsPreviewModalOpen(true);
     console.log("Submitting job data:", {
      jobTitle,
      description,
      email,
      specialisms,
      salary,
      username,
      jobType,
      careerLevel,
      experience,
      location,
      benefits,
      jobRequirements,
      deadline,
      company_id: companyId,
      category_id: categoryId,
    });
  };

  const handleAIAssist = async () => {
    if (!jobTitle) {
      toast.error("Vui lòng nhập vị trí công việc trước khi sử dụng AI hỗ trợ");
      return;
    }

    if (!selectedModel) {
      toast.error("Vui lòng chọn model AI");
      return;
    }

    setIsAILoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
      setIsAILoading(false);
      return;
    }

    const prompt = `Là một chuyên gia tuyển dụng, hãy tạo một bản mô tả công việc chi tiết cho vị trí "${jobTitle}". 
    Hãy cung cấp thông tin theo format sau:
    
    1. Mô tả công việc:
    - Tổng quan về vị trí
    - Các trách nhiệm chính
    - Môi trường làm việc
    
    2. Yêu cầu công việc:
    - Kỹ năng cần thiết
    - Kinh nghiệm yêu cầu
    - Trình độ học vấn
    
    3. Quyền lợi:
    - Lương thưởng
    - Phúc lợi
    - Cơ hội phát triển
    
    4. Thông tin bổ sung:
    - Địa điểm làm việc
    - Hình thức làm việc
    - Thời gian làm việc`;

    let eventSource;
    try {
      eventSource = new EventSourcePolyfill(
        `${process.env.REACT_APP_API_URL}/openai/chat-stream?prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(selectedModel)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'text/event-stream',
          },
          withCredentials: false,
          heartbeatTimeout: 60000,
        }
      );

      let aiResponse = "";

      eventSource.onopen = () => {
        console.log("EventSource connection opened");
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          aiResponse += data;
        } catch (error) {
          console.error('Error parsing event data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        setIsAILoading(false);

        if (aiResponse) {
          try {
            // Parse AI response and update form fields
            const sections = aiResponse.split('\n\n');
            sections.forEach(section => {
              if (section.includes('Mô tả công việc:')) {
                setDescription(section.replace('Mô tả công việc:', '').trim());
              } else if (section.includes('Yêu cầu công việc:')) {
                setJobRequirements(section.replace('Yêu cầu công việc:', '').trim());
              } else if (section.includes('Quyền lợi:')) {
                setBenefits(section.replace('Quyền lợi:', '').trim());
              }
            });
            toast.success("Đã tạo nội dung thành công!");
          } catch (error) {
            console.error('Error parsing AI response:', error);
            toast.error("Có lỗi xảy ra khi xử lý nội dung");
          }
        } else {
          toast.error("Không thể kết nối với AI. Vui lòng thử lại sau.");
        }
      };

    } catch (error) {
      console.error('Error:', error);
      toast.error("Đã xảy ra lỗi khi sử dụng AI hỗ trợ");
      setIsAILoading(false);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  };

  return (
    <div className={cx("wrapper")}>
      <h1>Đăng Tin Tuyển Dụng</h1>
      {error && <p className={cx("error-message")}>{error}</p>}
      {success && <p className={cx("success-message")}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div className={cx("form-group")}>
          <label htmlFor="jobTitle">Tiêu đề công việc</label>
          <div className={cx("input-with-ai")}>
          <input
            type="text"
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required
          />
            <div className={cx("ai-controls")}>
              <ModelAI selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
              <button
                type="button"
                className={cx("ai-assist-btn")}
                onClick={handleAIAssist}
                disabled={isAILoading || !jobTitle || !selectedModel}
              >
                {isAILoading ? (
                  <>
                    <FaSpinner className={cx("spinner")} />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <FaRobot />
                    AI Hỗ trợ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="description">Mô tả công việc</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="location">Địa điểm làm việc</label>
          <div className={cx("location-input")} onClick={() => setShowLocationModal(true)}>
            <i className="fa-solid fa-map-marker-alt"></i>
            <span className={cx("location-text")}>{location || "Chọn địa điểm làm việc"}</span>
            <i className="fa-solid fa-chevron-right"></i>
          </div>
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="benefits">Quyền lợi</label>
          <textarea
            id="benefits"
            value={benefits}
            onChange={(e) => setBenefits(e.target.value)}
            required
          />
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="jobRequirements">Yêu cầu công việc</label>
          <textarea
            id="jobRequirements"
            value={jobRequirements}
            onChange={(e) => setJobRequirements(e.target.value)}
            required
          />
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="deadline">Hạn nộp đơn</label>
          <input
            type="date"
            id="deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="email">Địa chỉ email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="specialisms">Chuyên môn</label>
          <input
            type="text"
            id="specialisms"
            value={specialisms}
            onChange={(e) => setSpecialisms(e.target.value)}
            required
          />
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="salary">Mức lương</label>
          <select
            id="salary"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            required
          >
            <option value="">Chọn mức lương</option>
            <option value="duoi-10-trieu">Dưới 10 triệu</option>
            <option value="10-15-trieu">10 - 15 triệu</option>
            <option value="15-20-trieu">15 - 20 triệu</option>
            <option value="20-25-trieu">20 - 25 triệu</option>
            <option value="25-30-trieu">25 - 30 triệu</option>
            <option value="30-50-trieu">30 - 50 triệu</option>
            <option value="tren-50-trieu">Trên 50 triệu</option>
            <option value="thoa-thuan">Thỏa thuận</option>
          </select>
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="username">Tên người đăng</label>
          <input type="text" id="username" value={username} required disabled />
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="jobType">Hình thức làm việc</label>
          <select
            id="jobType"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            required
          >
            <option value="">Chọn hình thức</option>
            <option value="tat-ca">Tất cả</option>
            <option value="toan-thoi-gian">Toàn thời gian</option>
            <option value="ban-thoi-gian">Bán thời gian</option>
            <option value="thuc-tap">Thực tập</option>
            <option value="khac">Khác</option>
          </select>
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="careerLevel">Cấp độ nghề nghiệp</label>
          <select
            id="careerLevel"
            value={careerLevel}
            onChange={(e) => setCareerLevel(e.target.value)}
            required
          >
            <option value="">Chọn cấp độ</option>
            <option value="nhan-vien">Nhân viên</option>
            <option value="truong-nhom">Trưởng nhóm</option>
            <option value="truong-pho-phong">Trưởng/Phó phòng</option>
            <option value="quan-ly-giam-sat">Quản lý / Giám sát</option>
            <option value="truong-chi-nhanh">Trưởng chi nhánh</option>
            <option value="pho-giam-doc">Phó giám đốc</option>
            <option value="giam-doc">Giám đốc</option>
            <option value="thuc-tap-sinh">Thực tập sinh</option>
          </select>
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="experience">Kinh nghiệm</label>
          <select
            id="experience"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            required
          >
            <option value="">Chọn kinh nghiệm</option>
            <option value="khong-yeu-cau">Không yêu cầu</option>
            <option value="duoi-1-nam">Dưới 1 năm</option>
            <option value="1-nam">1 năm</option>
            <option value="2-nam">2 năm</option>
            <option value="3-nam">3 năm</option>
            <option value="4-nam">4 năm</option>
            <option value="5-nam">5 năm</option>
          </select>
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="companyType">Loại công ty</label>
          <select
            id="companyType"
            value={companyType}
            onChange={(e) => setCompanyType(e.target.value)}
            required
          >
            <option value="">Chọn loại công ty</option>
            <option value="tat-ca">Tất cả</option>
            <option value="pro-company">Pro Company</option>
          </select>
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="categoryId">Danh mục</label>
          <div 
            className={cx("category-input", { selected: categoryId !== "" })} 
            onClick={() => setShowCategoryModal(true)}
          >
            <i className="fa-solid fa-list-ul"></i>
            <span className={cx("category-text")}>{categoryName}</span>
            <i className="fa-solid fa-chevron-right"></i>
          </div>
          {categoryId === "" && <div className={cx("error-hint")}>Vui lòng chọn một danh mục nghề</div>}
        </div>
        <div className={cx("button-group")}>
          <button type="submit" className={cx("submit-btn")}>
            Đăng tin
          </button>
          <button
            type="button"
            className={cx("preview-btn")}
            onClick={handlePreview}
          >
            Xem trước
          </button>
        </div>
      </form>

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div className={cx("modal-overlay")}>
          <div className={cx("modal-content", "category-modal")}>
            <div className={cx("modal-header")}>
              <h3>Chọn danh mục nghề</h3>
              <button className={cx("close-btn")} onClick={() => setShowCategoryModal(false)}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className={cx("modal-body")}>
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
                {categories.map((category) => (
                  <div
                    key={category.category_id}
                    className={cx("category-item", {
                      "has-children": category.level < 3,
                      "active": categoryId === category.category_id || 
                              categoryPath.some(item => item.id === category.category_id)
                    })}
                    onClick={() => handleCategorySelect(category)}
                  >
                    <div className={cx("category-content")}>
                      <span className={cx("category-name")}>{category.category_name}</span>
                      {category.level < 3 && (
                        <i className="fas fa-chevron-right"></i>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={cx("modal-footer")}>
              <button className={cx("cancel-btn")} onClick={() => setShowCategoryModal(false)}>
                Hủy
              </button>
              <button className={cx("confirm-btn")} onClick={handleConfirmCategory}>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PreviewJobModal component */}
      <PreviewJobModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        jobDetails={{
          title: jobTitle,
          description,
          salary,
          location,
          experience,
          jobType,
          rank: careerLevel,
          deadline,
          benefits,
          jobRequirements,
          workingLocation: location,
          status: "Đã đăng",
          categoryId,
        }}
        companyInfo={companyInfo}
      />

      {/* Location Selection Modal */}
      {showLocationModal && (
        <div className={cx("modal-overlay")}>
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
}

export default PostJob;
