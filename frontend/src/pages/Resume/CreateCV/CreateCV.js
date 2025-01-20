import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./CreateCV.module.scss";
import { authAPI, userApis } from "~/utils/api";
import { FaEye, FaDownload, FaSearch, FaFilter } from "react-icons/fa";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await authAPI().get(userApis.getAllCvTemplates);
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
      
      Object.keys(formData).forEach(key => {
        html = html.replace(
          new RegExp(`{{${key}}}`, 'g'), 
          formData[key] || ''
        );
      });

      return html;
    };

    const TemplateStyle = () => {
      return (
        <style>
          {`
            /* Reset CSS mặc định */
            .cv-preview * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            /* CSS từ database */
            ${template.template_css}
            
            /* CSS cho form inputs */
            [contenteditable="true"] {
              outline: none;
              padding: 2px;
              transition: all 0.3s;
            }
            
            [contenteditable="true"]:hover {
              background: rgba(0, 0, 0, 0.05);
            }
            
            [contenteditable="true"]:focus {
              background: rgba(0, 0, 0, 0.1);
            }
          `}
        </style>
      );
    };

    return (
      <div className={cx("preview-modal-overlay")} onClick={onClose}>
        <div className={cx("preview-modal")} onClick={e => e.stopPropagation()}>
          <div className={cx("preview-content")}>
            <div className={cx("preview-cv")}>
              <TemplateStyle />
              
              <div 
                className={cx("cv-preview")}
                dangerouslySetInnerHTML={{ 
                  __html: renderTemplate()
                    .replace(
                      /<(div|span|p|h1|h2|h3)([^>]*)>/g, 
                      '<$1$2 contenteditable="true">'
                    ) 
                }}
              />
            </div>

            <div className={cx("preview-sidebar")}>
              <h2 className={cx("preview-title")}>
                {template.template_name}
              </h2>

              <div className={cx("preview-form")}>
                <div className={cx("form-group")}>
                  <label>Ngôn ngữ</label>
                  <select defaultValue="Tiếng Việt">
                    <option>Tiếng Việt</option>
                    <option>English</option>
                  </select>
                </div>

                <div className={cx("form-group")}>
                  <label>Màu sắc</label>
                  <div className={cx("color-options")}>
                    <button className={cx("color-btn", "active")} style={{background: "#013a74"}}></button>
                    <button className={cx("color-btn")} style={{background: "#02a346"}}></button>
                    <button className={cx("color-btn")} style={{background: "#4A90E2"}}></button>
                    <button className={cx("color-btn")} style={{background: "#9C27B0"}}></button>
                    <button className={cx("color-btn")} style={{background: "#2E7D32"}}></button>
                    <button className={cx("color-btn")} style={{background: "#455A64"}}></button>
                  </div>
                </div>

                <div className={cx("preview-actions")}>
                  <button className={cx("use-template-btn")}>
                    <FaDownload /> Dùng mẫu này
                  </button>
                  <button className={cx("close-btn")} onClick={onClose}>
                    Đóng lại
                  </button>
                </div>
              </div>
            </div>
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
                        <button className={cx("use-template-btn")}>
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
                  <button className={cx("use-template-btn")}>
                    <FaDownload /> Sử dụng mẫu này
                  </button>
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
