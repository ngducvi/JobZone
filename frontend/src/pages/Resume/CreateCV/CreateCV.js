import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./CreateCV.module.scss";
import { authAPI, userApis } from "~/utils/api";
import { FaEye, FaDownload, FaSearch, FaFilter, FaTimes, FaPalette, FaLanguage, FaSortAmountDown } from "react-icons/fa";
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await authAPI().get(userApis.getAllCvTemplates);
        const responseFields = await authAPI().get(userApis.getAllTemplateFieldsByTemplateId(response.data.cvTemplates[0].template_id));

        setTemplates(response.data.cvTemplates);
        setTotalPages(response.data.totalPages);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const filteredTemplates = templates.filter(
    (template) =>
      template.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.template_description
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

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
            filteredTemplates.map((template) => (
              <div
                key={template.template_id}
                className={cx("template-card")}
                onMouseEnter={() => setHoveredCard(template.template_id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className={cx("template-image")}>
                  <img src={images.coverletter} alt={template.template_name} />
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
