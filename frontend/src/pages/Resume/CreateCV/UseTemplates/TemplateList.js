import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './UseTemplates.module.scss';
import { FaEye, FaDownload } from 'react-icons/fa';
import { authAPI, userApis } from '~/utils/api';
import images from '~/assets/images';

const cx = classNames.bind(styles);

const TemplateList = ({ onSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await authAPI().get(userApis.getAllCvTemplates);
        setTemplates(response.data.cvTemplates);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
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

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  if (loading) {
    return (
      <div className={cx('templates-grid')}>
        {Array(6).fill(0).map((_, index) => (
          <div key={index} className={cx("template-card", "skeleton")} />
        ))}
      </div>
    );
  }

  return (
    <div className={cx('templates-grid')}>
      {templates.map((template) => (
        <div
          key={template.template_id}
          className={cx('template-card')}
          onMouseEnter={() => setHoveredCard(template.template_id)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className={cx('template-image')}>
            <img
                // src={template.template_thumbnail || images.cv_template_1}
                src={images.cv_template_1}
              alt={template.template_name }
            />
            {hoveredCard === template.template_id && (
              <div className={cx('template-overlay')}>
                <div className={cx('overlay-buttons')}>
                  <button 
                    className={cx('preview-btn')}
                    onClick={() => handlePreview(template)}
                  >
                    <FaEye /> Xem trước
                  </button>
                  <button 
                    className={cx('use-template-btn')}
                    onClick={() => onSelect(template)}
                  >
                    <FaDownload /> Sử dụng mẫu này
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className={cx('template-info')}>
            <div className={cx('template-header')}>
              <div className={cx('template-type-container')}>
                {template.type_id.slice(0, 2).map((type, index) => (
                  <span key={type} className={cx('template-type')}>
                    {getTemplateTypeName(type)}
                  </span>
                ))}
                {template.type_id.length > 2 && (
                  <span className={cx('template-type', 'more-types')}>
                    +{template.type_id.length - 2}
                  </span>
                )}
              </div>
              <span className={cx('template-downloads')}>
                <FaDownload /> 1.2k
              </span>
            </div>
            <h3 className={cx('template-name')}>{template.template_name}</h3>
            <p className={cx('template-description')}>{template.template_description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TemplateList; 