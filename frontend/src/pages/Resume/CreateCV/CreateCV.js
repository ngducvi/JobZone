import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./CreateCV.module.scss";
import { authAPI, userApis } from "~/utils/api";
import { FaEye, FaDownload, FaSearch, FaFilter, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

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
  const [bgColor, setBgColor] = useState('rgba(240, 247, 255, 0.5)'); // Màu nền mặc định
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
        console.log(response.data.cvTemplates);
        const responseFields = await authAPI().get(userApis.getAllTemplateFieldsByTemplateId(response.data.cvTemplates[0].template_id));
        console.log(responseFields.data.templateFields);

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
    // Chuyển hướng đến trang UseTemplates với template được chọn
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
        <div className={cx("sidebar-section")}>
          <h3>Mẫu CV Trang trọng</h3>
        </div>

        <div className={cx("sidebar-section")}>
          <label>Ngôn ngữ</label>
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
          <label>Vị trí ứng tuyển</label>
          <select 
            value={cvPosition}
            onChange={(e) => setCvPosition(e.target.value)}
            className={cx("select-input")}
          >
            <option value="">Chọn vị trí</option>
            <option value="dev">Developer</option>
            <option value="design">Designer</option>
            {/* Thêm các option khác */}
          </select>
        </div>

        <div className={cx("sidebar-section")}>
          <label>Màu sắc</label>
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

        <div className={cx("sidebar-actions")}>
          <button className={cx("action-btn", "primary")}>
            Dùng mẫu này
          </button>
          <button className={cx("action-btn", "secondary")} >
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
        <h1>Danh sách mẫu CV xin việc chuẩn 2023</h1>
        <p>
          Các mẫu CV được thiết kế chuẩn theo từng ngành nghề.
          <br />
          Phù hợp với cả sinh viên và người đi làm.
        </p>

        <div className={cx("search-bar")}>
          <FaSearch className={cx("search-icon")} />
          <input
            type="text"
            placeholder="Tìm kiếm mẫu CV..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className={cx("filter-toggle", { active: showFilters })}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Bộ lọc
          </button>
        </div>
      </div>

      <div className={cx("content-wrapper")}>
        <div className={cx("tabs-container")}>
          <div className={cx("tabs")}>
            <button
              className={cx("tab", { active: activeTab === "style" })}
              onClick={() => setActiveTab("style")}
            >
              Mẫu CV theo style
            </button>
            <button
              className={cx("tab", { active: activeTab === "position" })}
              onClick={() => setActiveTab("position")}
            >
              Mẫu CV theo vị trí ứng tuyển
            </button>
          </div>

          <div className={cx("filters", { show: showFilters })}>
            <select
              className={cx("filter-select")}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="Tiếng Việt">Tiếng Việt</option>
              <option value="English">English</option>
            </select>

            <select
              className={cx("filter-select")}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="all">Tất cả thiết kế</option>
              <option value="newest">Mới cập nhật</option>
              <option value="popular">Được dùng nhiều nhất</option>
            </select>
          </div>
        </div>

        <div className={cx("templates-grid")}>
          {loading ? (
            Array(6)
              .fill(0)
              .map((_, index) => (
                <div key={index} className={cx("template-card", "skeleton")} />
              ))
          ) : filteredTemplates.length === 0 ? (
            <div className={cx("no-results")}>
              <img src="/images/no-results.svg" alt="No results" />
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
                  <img
                    src={`${process.env.REACT_APP_API_URL}/uploads/templates/${template.template_thumbnail}`}
                    alt={template.template_name}
                  />
                  {hoveredCard === template.template_id && (
                    <div className={cx("template-overlay")}>
                      <div className={cx("overlay-buttons")}>
                        <button 
                          className={cx("preview-btn")}
                          onClick={() => handlePreview(template)}
                        >
                          <FaEye /> Xem trước
                        </button>
                        <button 
                          className={cx("use-template-btn")}
                          onClick={() => handleUseTemplate(template)}
                        >
                          <FaDownload /> Sử dụng mẫu này
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className={cx("template-info")}>
                  <div className={cx("template-header")}>
                    <div className={cx("template-type-container")}>
                      {template.type_id.slice(0, 2).map((type, index) => (
                        <span key={type} className={cx("template-type")}>
                          {getTemplateTypeName(type)}
                        </span>
                      ))}
                      {template.type_id.length > 2 && (
                        <span className={cx("template-type", "more-types")}>
                          +{template.type_id.length - 2}
                        </span>
                      )}
                    </div>
                    <span className={cx("template-downloads")}>
                      <FaDownload /> 1.2k
                    </span>
                  </div>
                  <h3 className={cx("template-name")}>
                    {template.template_name}
                  </h3>

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
