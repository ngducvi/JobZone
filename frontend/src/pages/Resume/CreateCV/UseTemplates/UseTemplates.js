// UseTemplates page
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './UseTemplates.module.scss';
import { authAPI, userApis } from '~/utils/api';
import { FaUndo, FaRedo, FaSave, FaDownload, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import TemplateList from './TemplateList';
import CVGuide from './CVGuide';
import useScrollTop from '~/hooks/useScrollTop';
const cx = classNames.bind(styles);

const UseTemplates = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { template, selectedColor, bgColor } = location.state || {};
  const [formData, setFormData] = useState({});
  const [templateFields, setTemplateFields] = useState([]);
  const [currentColor, setCurrentColor] = useState(selectedColor);
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [showBackground, setShowBackground] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [lastSavedState, setLastSavedState] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [activeSidebarItem, setActiveSidebarItem] = useState('template');
  const [isSaving, setIsSaving] = useState(false);

  const colors = [
    '#013a74', // Blue
    '#e91e63', // Pink
    '#9c27b0', // Purple
    '#3f51b5', // Indigo
    '#009688', // Teal
    '#424242', // Dark Grey
    '#ff5722'  // Deep Orange
  ];

  const sidebarItems = [
    { id: 'template', label: 'Mẫu CV', icon: null, count: null },
    { id: 'guide', label: 'Hướng dẫn viết CV', icon: null, count: null },
  ];

 useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []); 
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
        
        // Khởi tạo history với state đầu tiên
        setHistory([initialData]);
        setCurrentIndex(0);
        setLastSavedState(initialData);
      } catch (error) {
        console.error("Error fetching template fields:", error);
      }
    };
    
    if (template) {
      fetchFields();
    }
  }, [template]);

  const handleInputChange = (fieldName, value) => {
    const newFormData = {
      ...formData,
      [fieldName]: value
    };
    
    // Cắt bỏ các state sau currentIndex nếu có
    const newHistory = history.slice(0, currentIndex + 1);
    
    // Thêm state mới vào history
    setHistory([...newHistory, newFormData]);
    setCurrentIndex(newHistory.length);
    setFormData(newFormData);
  };

  const handleLineSpacingChange = (value) => {
    setLineSpacing(parseFloat(value));
  };

  const toggleBackground = () => {
    setShowBackground(!showBackground);
  };

  const handleDirectEdit = (event) => {
    const editedContent = event.target.innerHTML;
    const fieldName = event.target.getAttribute('data-field');
    if (fieldName) {
      handleInputChange(fieldName, editedContent);
    }
  };

  const renderTemplate = () => {
    if (!template) return null;
    
    let html = template.template_html;
    Object.keys(formData).forEach(key => {
      const placeholder = `{{${key}}}`;
      const value = formData[key] || '';
      const editableValue = `<div data-field="${key}" ${isEditing ? 'contenteditable="true"' : ''} class="editable-content">${value}</div>`;
      html = html.replace(new RegExp(placeholder, 'g'), editableValue);
    });
    return html;
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFormData(history[currentIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFormData(history[currentIndex + 1]);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      // Tạo object chứa các field values
      const fieldValues = templateFields.map(field => ({
        field_id: field.field_id,
        field_value: formData[field.field_name] || ''
      }));

      // Gọi API để tạo CV mới với field values
      const response = await authAPI().post(userApis.createNewCV, {
        template_id: template.template_id,
        name: formData.fullName || 'CV mới',
        fieldValues: fieldValues
      });

      if (response.data.code === 1) {
        setLastSavedState(formData);
        toast.success('Đã lưu CV thành công!');
        
        navigate(`/user/manager-cv`);
      } else {
        toast.error('Có lỗi xảy ra khi lưu CV!');
      }
    } catch (error) {
      console.error('Error saving CV:', error);
      toast.error('Có lỗi xảy ra khi lưu CV!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSidebarItemClick = (item) => {
    setActiveSidebarItem(item.id);
    
    switch(item.id) {
      case 'template':
        setModalContent({
          title: 'Đổi mẫu CV',
          content: <TemplateList onSelect={handleTemplateChange} />
        });
        break;
     
      case 'guide':
        setModalContent({
          title: 'Hướng dẫn viết CV',
          content: <CVGuide />
        });
        break;  
    }
    setShowModal(true);
  };

  const handleTemplateChange = (newTemplate) => {
    // Cập nhật template hiện tại
    navigate(`/user/use-templates`, { 
      state: { 
        template: newTemplate,
        selectedColor: currentColor,
        bgColor 
      }
    }, { replace: true });
  };

  return (
    <div className={cx('wrapper')}>
      <div className={cx('sidebar')}>
        {sidebarItems.map(item => (
          <button
            key={item.id}
            className={cx('sidebar-item', { active: activeSidebarItem === item.id })}
            onClick={() => handleSidebarItemClick(item)}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.count && <div className={cx('count')}>{item.count}</div>}
          </button>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className={cx('modal-overlay')} onClick={() => setShowModal(false)}>
          <div className={cx('modal')} onClick={e => e.stopPropagation()}>
            <div className={cx('modal-header')}>
              <h2>{modalContent.title}</h2>
              <button className={cx('close-btn')} onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className={cx('modal-content')}>
              {modalContent.content}
            </div>
          </div>
        </div>
      )}

      <div className={cx('toolbar')}>
        <div className={cx('toolbar-left')}>
          <select 
            className={cx('spacing-select')}
            value={lineSpacing}
            onChange={(e) => handleLineSpacingChange(e.target.value)}
          >
            <option value="1">Khoảng cách dòng 1.0</option>
            <option value="1.5">Khoảng cách dòng 1.5</option>
            <option value="2">Khoảng cách dòng 2.0</option>
          </select>
          <button 
            className={cx('background-btn', { active: showBackground })}
            onClick={toggleBackground}
          >
            <FaDownload /> {showBackground ? 'Ẩn nền CV' : 'Hiển thị nền CV'}
          </button>
          <button 
            className={cx('edit-mode-btn', { active: isEditing })}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Tắt chỉnh sửa' : 'Bật chỉnh sửa'}
          </button>
        </div>
        <div className={cx('toolbar-center')}>
          <button 
            className={cx('undo-btn')} 
            onClick={handleUndo}
            disabled={currentIndex <= 0}
          >
            <FaUndo />
          </button>
          <button 
            className={cx('redo-btn')} 
            onClick={handleRedo}
            disabled={currentIndex >= history.length - 1}
          >
            <FaRedo />
          </button>
          <div className={cx('color-picker')}>
            {colors.map(color => (
              <button
                key={color}
                className={cx('color-btn', { active: color === currentColor })}
                style={{ backgroundColor: color }}
                onClick={() => setCurrentColor(color)}
              />
            ))}
          </div>
        </div>
        <div className={cx('toolbar-right')}>
          <button 
            className={cx('save-btn', {
              'has-changes': JSON.stringify(formData) !== JSON.stringify(lastSavedState),
              'saving': isSaving
            })}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <FaSpinner className={cx('spinner')} />
                Đang lưu...
              </>
            ) : (
              <>
                <FaSave />
                Lưu lại
              </>
            )}
          </button>
          <button className={cx('download-btn')}>
            <FaDownload /> Tải về
          </button>
        </div>
      </div>

      <div className={cx('editor-container')}>
        <div className={cx('form-section')}>
          <h2>Thông tin CV</h2>
          {templateFields.map(field => (
            <div key={field.field_id} className={cx('form-group')}>
              <label>{field.field_label}</label>
              {field.field_type === 'textarea' ? (
                <textarea
                  value={formData[field.field_name] || ''}
                  onChange={e => handleInputChange(field.field_name, e.target.value)}
                  placeholder={field.field_placeholder}
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
          ))}
        </div>
        
        <div className={cx('preview-section')}>
          <style>
            {`
              .cv-preview * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              .cv-preview {
                line-height: ${lineSpacing};
              }
              ${template?.template_css
                ?.replace(/\$primary-color/g, currentColor)
                ?.replace(/\$background-color/g, showBackground ? bgColor : 'transparent')}
              
              .editable-content:hover {
                ${isEditing ? 'outline: 2px dashed #013a74;' : ''}
              }
              .editable-content:focus {
                outline: 2px solid #013a74;
                padding: 2px;
              }
            `}
          </style>
          <div 
            className={cx('cv-preview', { 'no-background': !showBackground, 'editing-mode': isEditing })} 
            dangerouslySetInnerHTML={{ __html: renderTemplate() }}
            onBlur={handleDirectEdit}
          />
        </div>
      </div>
    </div>
  );
};

export default UseTemplates;
