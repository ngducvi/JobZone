import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./CreateCV.module.scss";
import { authAPI, userApis } from "~/utils/api";
import { FaEye, FaDownload, FaSearch, FaFilter, FaTimes, FaPalette, FaLanguage, FaSortAmountDown, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import images from "~/assets/images/index";

const cx = classNames.bind(styles);

const CreateCV = () => {
  const [activeTab, setActiveTab] = useState("style");
  const [language, setLanguage] = useState("Tiếng Việt");
  const [sortBy, setSortBy] = useState("all");
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#013a74');
  const [bgColor, setBgColor] = useState('rgba(240, 247, 255, 0.5)');
  const [cvLanguage, setCvLanguage] = useState("Tiếng Việt");
  const [cvPosition, setCvPosition] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const itemsPerPage = 6; // Display 6 templates per page
  const navigate = useNavigate();

  const colors = [
    '#013a74', // Blue
    '#e91e63', // Pink
    '#9c27b0', // Purple
    '#3f51b5', // Indigo
    '#009688', // Teal
    '#424242', // Dark Grey
    '#ff5722'  // Deep Orange
  ];

  const templateThumbnails = {
    'e3e5aaab-da55-11ef-b243-2cf05db24bc7': images.basicCVs,
    'cvtest': images.basicCVTemplate,
    'e3e658d7-da55-11ef-b243-2cf05db24bc7': images.creattiveCV,
    'template-basic-01': images.cvcoban,
    'template-basic-010': images.cvcobanqua,
    'template-creative-01': images.cvsangtao,
    'e3e643a7-da55-11ef-b243-2cf05db24bc7': images.professsionalcv,
    'template-basic-02': images.thanhlich,
    'template-creative-010': images.cvsangtao1,
    'template-creative-02': images.cvsangtaopink,
    'template-creative-03': images.cvsangtaoblue,
    'template-modern-02': images.hiendai1,
    'template-modern-03': images.tinhte2,
    'template-modern-04': images.hiendai4,
  };

  // basicCVs: require('~/assets/images/cv/BasicCVs.png'),   e3e5aaab-da55-11ef-b243-2cf05db24bc7
  // basicCVTemplate: require('~/assets/images/cv/BasicCVTemplate.png'), f4678296-da56-11ef-b243-2cf05db24bc7
  // creattiveCV: require('~/assets/images/cv/CreativeCV.png'),e3e658d7-da55-11ef-b243-2cf05db24bc7
  // cvcoban: require('~/assets/images/cv/CVCơ bản.png'),template-basic-01
  // cvcobanqua: require('~/assets/images/cv/CVCơbanqua.png'),template-basic-010
  // cvsangtao: require('~/assets/images/cv/CVSangTao.png'),template-creative-01
  // professsionalcv: require('~/assets/images/cv/ProfessionalCV.png'),e3e643a7-da55-11ef-b243-2cf05db24bc7
  // thanhlich: require('~/assets/images/cv/Thanhlich.png'),template-basic-02

  const getTemplateTypeName = (typeId) => {
    switch (typeId) {
      case "type-creative":
        return "Sáng tạo";
      case "type-modern":
        return "Hiện đại";
      case "type-professional":
        return "Chuyên nghiệp";
      case "type-simple":
        return "Đơn giản";
      default:
        return typeId;
    }
  };

  // Define filteredTemplates here before any useEffect that depends on it
  const filteredTemplates = templates
    .filter(
    (template) =>
      template.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.template_description
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'popular':
          return (b.downloads || 0) - (a.downloads || 0);
        default:
          return 0;
      }
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await authAPI().get(userApis.getAllCvTemplates);
        const responseFields = await authAPI().get(userApis.getAllTemplateFieldsByTemplateId(response.data.cvTemplates[0].template_id));

        setTemplates(response.data.cvTemplates);
        setTotalPages(Math.ceil(response.data.cvTemplates.length / itemsPerPage));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [itemsPerPage]);

  // Update total pages when filtering templates
  useEffect(() => {
    if (filteredTemplates.length > 0) {
      setTotalPages(Math.ceil(filteredTemplates.length / itemsPerPage));
      // Reset to first page when search changes
      if (currentPage > Math.ceil(filteredTemplates.length / itemsPerPage)) {
        setCurrentPage(1);
      }
    }
  }, [filteredTemplates.length, itemsPerPage, currentPage]);

  // Get current page templates
  const getCurrentPageTemplates = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTemplates.slice(startIndex, endIndex);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    // Scroll to top of templates grid
    window.scrollTo({
      top: document.querySelector(`.${cx("templates-grid")}`).offsetTop - 100,
      behavior: 'smooth'
    });
  };

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const handleUseTemplate = (template) => {
    navigate(`/user/use-templates`, {
      state: {
        template,
        selectedColor,
        bgColor
      }
    });
  };

  const PreviewSidebar = () => {
    return (
      <div className={cx("preview-sidebar")}>
        <div className={cx("sidebar-header")}>
          <h3>Tùy chỉnh CV</h3>
          <button className={cx("close-btn")} onClick={() => setShowPreview(false)}>
            <FaTimes />
          </button>
        </div>

        <div className={cx("sidebar-content")}>
          <div className={cx("sidebar-section")}>
            <label>
              <FaLanguage className={cx("icon")} />
              Ngôn ngữ
            </label>
            <select
              value={cvLanguage}
              onChange={(e) => setCvLanguage(e.target.value)}
              className={cx("select-input")}
            >
              <option value="Tiếng Việt">Tiếng Việt</option>
              <option value="English">English</option>
            </select>
          </div>

          <div className={cx("sidebar-section")}>
            <label>
              <FaSortAmountDown className={cx("icon")} />
              Vị trí ứng tuyển
            </label>
            <select
              value={cvPosition}
              onChange={(e) => setCvPosition(e.target.value)}
              className={cx("select-input")}
            >
              <option value="">Chọn vị trí</option>
              <option value="dev">Developer</option>
              <option value="design">Designer</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Sales</option>
            </select>
          </div>

          <div className={cx("sidebar-section")}>
            <label>
              <FaPalette className={cx("icon")} />
              Màu sắc
            </label>
            <div className={cx("color-picker")}>
              {colors.map(color => (
                <button
                  key={color}
                  className={cx("color-btn", { active: selectedColor === color })}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                >
                  {selectedColor === color && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={cx("sidebar-actions")}>
          <button 
            className={cx("action-btn", "primary")}
            onClick={() => handleUseTemplate(selectedTemplate)}
          >
            <FaDownload className={cx("icon")} />
            Dùng mẫu này
          </button>
          <button 
            className={cx("action-btn", "secondary")}
            onClick={() => setShowPreview(false)}
          >
            Đóng lại
          </button>
        </div>
      </div>
    );
  };

  const PreviewModal = ({ template, onClose }) => {
    const [formData, setFormData] = useState({});
    const [templateFields, setTemplateFields] = useState([]);

    useEffect(() => {
      const fetchFields = async () => {
        try {
          const response = await authAPI().get(
            userApis.getAllTemplateFieldsByTemplateId(template.template_id)
          );
          setTemplateFields(response.data.templateFields);

          // Khởi tạo formData với placeholder values
          const initialData = {};
          response.data.templateFields.forEach(field => {
            initialData[field.field_name] = field.field_placeholder || '';
          });
          setFormData(initialData);
        } catch (error) {
          console.error("Error fetching template fields:", error);
        }
      };
      fetchFields();
    }, [template.template_id]);

    const handleInputChange = (fieldName, value) => {
      setFormData(prev => ({
        ...prev,
        [fieldName]: value
      }));
    };

    const renderTemplate = () => {
      let html = template.template_html;

      // Thay thế các placeholder bằng giá trị thực
      Object.keys(formData).forEach(key => {
        const placeholder = `{{${key}}}`;
        const value = formData[key] || '';
        html = html.replace(new RegExp(placeholder, 'g'), value);
      });

      return html;
    };

    const TemplateStyle = () => {
      // Thay thế các biến màu trong CSS
      const customCSS = template.template_css
        .replace(/\$primary-color/g, selectedColor)
        .replace(/\$background-color/g, bgColor);

      return (
        <style>
          {`
            /* Reset CSS mặc định */
            .cv-preview * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            /* CSS từ database với màu tùy chỉnh */
            ${customCSS}
          `}
        </style>
      );
    };

    const renderFields = () => {
      return templateFields.map(field => (
        <div key={field.field_id} className={cx("form-field")}>
          <label>{field.field_label}</label>
          {field.field_type === 'textarea' ? (
            <textarea
              value={formData[field.field_name] || ''}
              onChange={e => handleInputChange(field.field_name, e.target.value)}
              placeholder={field.field_placeholder}
            />
          ) : field.field_type === 'date' ? (
            <input
              type="date"
              value={formData[field.field_name] || ''}
              onChange={e => handleInputChange(field.field_name, e.target.value)}
            />
          ) : (
            <input
              type="text"
              value={formData[field.field_name] || ''}
              onChange={e => handleInputChange(field.field_name, e.target.value)}
              placeholder={field.field_placeholder}
            />
          )}
        </div>
      ));
    };

    return (
      <div className={cx("preview-modal-overlay")} onClick={onClose}>
        <div className={cx("preview-modal")} onClick={e => e.stopPropagation()}>
          <button className={cx("close-button")} onClick={onClose}>
            <FaTimes />
          </button>
          <div className={cx("preview-content")}>
            <div className={cx("preview-main")}>
              <TemplateStyle />
              <div
                className={cx("cv-preview")}
                dangerouslySetInnerHTML={{ __html: renderTemplate() }}
              />
            </div>
            <PreviewSidebar />
          </div>
        </div>
      </div>
    );
  };

  // Get pagination range with ellipsis
  const getPaginationRange = () => {
    const totalNumbers = 5; // Number of page numbers to show
    const totalBlocks = totalNumbers + 2; // Total blocks including ellipsis
    
    if (totalPages <= totalBlocks) {
      // If we have less pages than we want to show, display all pages
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Calculate middle of the displayed numbers
    const leftSiblingIndex = Math.max(currentPage - 1, 1);
    const rightSiblingIndex = Math.min(currentPage + 1, totalPages);
    
    // Calculate if we should show the ellipsis
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;
    
    if (!shouldShowLeftDots && shouldShowRightDots) {
      // No left dots, but right dots
      const leftRange = Array.from({ length: totalNumbers }, (_, i) => i + 1);
      return [...leftRange, '...', totalPages];
    }
    
    if (shouldShowLeftDots && !shouldShowRightDots) {
      // Left dots, but no right dots
      const rightRange = Array.from(
        { length: totalNumbers },
        (_, i) => totalPages - totalNumbers + i + 1
      );
      return [1, '...', ...rightRange];
    }
    
    if (shouldShowLeftDots && shouldShowRightDots) {
      // Both left and right dots
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [1, '...', ...middleRange, '...', totalPages];
    }
    
    // Default case
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  };

  return (
    <div className={cx("wrapper")}>
      <div className={cx("header")}>
        <div className={cx("header-content")}>
          <h1>Mẫu CV Chuyên Nghiệp</h1>
          <p>Tạo CV ấn tượng với hơn 100+ mẫu thiết kế chuyên nghiệp</p>
          
          <div className={cx("search-container")}>
            <div className={cx("search-bar")}>
              <FaSearch className={cx("search-icon")} />
              <input
                type="text"
                placeholder="Tìm kiếm mẫu CV..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className={cx("filter-btn", { active: showFilters })}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter className={cx("icon")} />
              Bộ lọc
            </button>
          </div>
        </div>
      </div>

      <div className={cx("content")}>
        <div className={cx("filters", { show: showFilters })}>
          <div className={cx("filter-group")}>
            <label>
              <FaLanguage className={cx("icon")} />
              Ngôn ngữ
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={cx("filter-select")}
            >
              <option value="Tiếng Việt">Tiếng Việt</option>
              <option value="English">English</option>
            </select>
          </div>

          <div className={cx("filter-group")}>
            <label>
              <FaSortAmountDown className={cx("icon")} />
              Sắp xếp
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={cx("filter-select")}
            >
              <option value="all">Tất cả</option>
              <option value="newest">Mới nhất</option>
              <option value="popular">Phổ biến</option>
            </select>
          </div>
        </div>

        <div className={cx("templates-grid")}>
          {loading ? (
            Array(6).fill(0).map((_, index) => (
              <div key={index} className={cx("template-card", "skeleton")} />
            ))
          ) : filteredTemplates.length === 0 ? (
            <div className={cx("no-results")}>
              <img src={images.noResults} alt="No results" />
              <h3>Không tìm thấy mẫu CV phù hợp</h3>
              <p>Vui lòng thử tìm kiếm với từ khóa khác</p>
            </div>
          ) : (
            getCurrentPageTemplates().map((template) => (
              <div
                key={template.template_id}
                className={cx("template-card")}
                onMouseEnter={() => setHoveredCard(template.template_id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className={cx("template-image")}>
                  <img 
                    src={templateThumbnails[template.template_id] || images.coverletter} 
                    alt={template.template_name} 
                  />
                  {hoveredCard === template.template_id && (
                    <div className={cx("template-overlay")}>
                      <div className={cx("overlay-buttons")}>
                        <button
                          className={cx("preview-btn")}
                          onClick={() => handlePreview(template)}
                        >
                          <FaEye className={cx("icon")} />
                          Xem trước
                        </button>
                        <button
                          className={cx("use-template-btn")}
                          onClick={() => handleUseTemplate(template)}
                        >
                          <FaDownload className={cx("icon")} />
                          Sử dụng
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className={cx("template-info")}>
                  <div className={cx("template-header")}>
                    <div className={cx("template-types")}>
                      {template.type_id.slice(0, 2).map((type, index) => (
                        <span key={type} className={cx("template-type")}>
                          {getTemplateTypeName(type)}
                        </span>
                      ))}
                      {template.type_id.length > 2 && (
                        <span className={cx("template-type", "more")}>
                          +{template.type_id.length - 2}
                        </span>
                      )}
                    </div>
                    <span className={cx("template-downloads")}>
                      <FaDownload className={cx("icon")} />
                      {template.downloads || 0}
                    </span>
                  </div>
                  <h3 className={cx("template-name")}>{template.template_name}</h3>
                  <p className={cx("template-description")}>
                    {template.template_description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {!loading && filteredTemplates.length > 0 && (
          <div className={cx("results-info")}>
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTemplates.length)} trong tổng số {filteredTemplates.length} mẫu
          </div>
        )}

        {totalPages > 1 && (
          <div className={cx("pagination")}>
            <button 
              className={cx("pagination-btn", "prev", { disabled: currentPage === 1 })}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FaChevronLeft className={cx("icon")} />
            </button>
            
            <div className={cx("pagination-numbers")}>
              {getPaginationRange().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className={cx("ellipsis")}>...</span>
                ) : (
                  <button
                    key={`page-${page}`}
                    className={cx("page-number", { active: currentPage === page })}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>
            
            <button 
              className={cx("pagination-btn", "next", { disabled: currentPage === totalPages })}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FaChevronRight className={cx("icon")} />
            </button>
          </div>
        )}
      </div>

      {showPreview && (
        <PreviewModal
          template={selectedTemplate}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default CreateCV;
