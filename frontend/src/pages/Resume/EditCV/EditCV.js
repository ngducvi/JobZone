// EditCV page

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './EditCV.module.scss';
import { authAPI, userApis } from '~/utils/api';
import { FaUndo, FaRedo, FaSave, FaDownload, FaEye, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import useScrollTop from '~/hooks/useScrollTop';

const cx = classNames.bind(styles);

const EditCV = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cv_id, template_id } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [templateFields, setTemplateFields] = useState([]);
  const [templateHtml, setTemplateHtml] = useState('');
  const [templateCss, setTemplateCss] = useState('');
  const [fieldValues, setFieldValues] = useState({});
  const [selectedColor, setSelectedColor] = useState('#013a74');
  const [bgColor, setBgColor] = useState('rgba(240, 247, 255, 0.5)');
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [showBackground, setShowBackground] = useState(true);
  const [isEditing, setIsEditing] = useState(true);
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [lastSavedState, setLastSavedState] = useState(null);
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

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  useEffect(() => {
    if (!cv_id || !template_id) {
      navigate('/user/manager-cv');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch template fields
        const fieldsResponse = await authAPI().get(
          userApis.getAllTemplateFieldsByTemplateId(template_id)
        );
        setTemplateFields(fieldsResponse.data.templateFields);

        // Fetch field values
        const valuesResponse = await authAPI().get(
          userApis.getAllCvFieldValuesByCvId(cv_id)
        );
        
        // Create mapping of field_id to field values
        const values = {};
        fieldsResponse.data.templateFields.forEach(field => {
          const fieldValue = valuesResponse.data.cvFieldValues.find(
            value => value.field_id === field.field_id
          );
          values[field.field_name] = fieldValue ? fieldValue.field_value : '';
        });
        setFieldValues(values);
        setHistory([values]);
        setCurrentIndex(0);
        setLastSavedState(values);

        // Fetch template HTML and CSS
        const templateResponse = await authAPI().get(
          userApis.getTemplateById(template_id)
        );
        setTemplateHtml(templateResponse.data.template.template_html);
        setTemplateCss(templateResponse.data.template.template_css);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Có lỗi xảy ra khi tải CV");
        setLoading(false);
      }
    };

    fetchData();
  }, [cv_id, template_id, navigate]);

  const handleInputChange = (fieldName, value) => {
    const newFieldValues = {
      ...fieldValues,
      [fieldName]: value
    };
    
    const newHistory = history.slice(0, currentIndex + 1);
    setHistory([...newHistory, newFieldValues]);
    setCurrentIndex(newHistory.length);
    setFieldValues(newFieldValues);
  };

  const handleLineSpacingChange = (value) => {
    setLineSpacing(parseFloat(value));
  };

  const toggleBackground = () => {
    setShowBackground(!showBackground);
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFieldValues(history[currentIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFieldValues(history[currentIndex + 1]);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    
    // Define fieldValuesToUpdate outside the try block so it's accessible in the catch block
      const fieldValuesToUpdate = templateFields.map(field => ({
        field_id: field.field_id,
        field_value: fieldValues[field.field_name] || ''
      }));

    try {
      // Gọi API để cập nhật CV
      const response = await authAPI().put(userApis.updateCV(cv_id), {
        name: fieldValues.fullName || 'CV mới',
        fieldValues: fieldValuesToUpdate
      });

      if (response.data.code === 1) {
        setLastSavedState(fieldValues);
        toast.success('Đã cập nhật CV thành công!');
      } else {
        toast.error('Có lỗi xảy ra khi cập nhật CV!');
      }
    } catch (error) {
      console.error('Error updating CV:', error);
      
      // Check if error is a deadlock error or other transient DB error
      const isDeadlockError = error?.response?.data?.message?.includes('Deadlock');
      
      if (isDeadlockError) {
        // For deadlock errors, the operation might have been successful anyway
        // Wait a moment and try to fetch the CV data again to verify
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Fetch CV data to check if our changes were saved
          const verifyResponse = await authAPI().get(userApis.getAllCvFieldValuesByCvId(cv_id));
          
          if (verifyResponse.data && verifyResponse.data.cvFieldValues) {
            // Verify if the changes were actually saved
            const savedValues = verifyResponse.data.cvFieldValues;
            let allValuesSaved = true;
            
            // Check if all our field values match the saved values
            for (const field of fieldValuesToUpdate) {
              const savedField = savedValues.find(v => v.field_id === field.field_id);
              if (!savedField || savedField.field_value !== field.field_value) {
                allValuesSaved = false;
                break;
              }
            }
            
            if (allValuesSaved) {
              // If all values were saved despite the error, consider it a success
              setLastSavedState(fieldValues);
              toast.success('CV đã được cập nhật thành công, mặc dù có lỗi từ máy chủ!');
              return;
            }
          }
        } catch (verifyError) {
          console.error('Error verifying save status:', verifyError);
        }
      }
      
      toast.error('Có lỗi xảy ra khi cập nhật CV! Vui lòng thử lại sau.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    navigate('/user/see-cv', {
      state: {
        cv_id,
        template_id
      }
    });
  };

  const renderTemplate = () => {
    let html = templateHtml;
    
    Object.keys(fieldValues).forEach(key => {
      const placeholder = `{{${key}}}`;
      const value = fieldValues[key] || '';
      const editableValue = `<div data-field="${key}" ${isEditing ? 'contenteditable="true"' : ''} class="editable-content">${value}</div>`;
      html = html.replace(new RegExp(placeholder, 'g'), editableValue);
    });

    return { __html: html };
  };

  if (loading) {
    return <div className={cx("loading")}>Loading...</div>;
  }

    return (
    <div className={cx("wrapper")}>
      <div className={cx("header-section")}>
        <div className={cx("header-content")}>
          <div className={cx("header-icon")}>
            <i className="fa-solid fa-pen-to-square"></i>
          </div>
          <h1>Chỉnh sửa CV</h1>
          <p>Chỉnh sửa và cập nhật thông tin CV của bạn</p>
        </div>
      </div>

      <div className={cx("toolbar")}>
        <div className={cx("toolbar-left")}>
          <select 
            className={cx("spacing-select")}
            value={lineSpacing}
            onChange={(e) => handleLineSpacingChange(e.target.value)}
          >
            <option value="1">Khoảng cách dòng 1.0</option>
            <option value="1.5">Khoảng cách dòng 1.5</option>
            <option value="2">Khoảng cách dòng 2.0</option>
          </select>
          <button 
            className={cx("background-btn", { active: showBackground })}
            onClick={toggleBackground}
          >
            {showBackground ? 'Ẩn nền CV' : 'Hiển thị nền CV'}
          </button>
        </div>
        <div className={cx("toolbar-center")}>
          <button 
            className={cx("undo-btn")} 
            onClick={handleUndo}
            disabled={currentIndex <= 0}
          >
            <FaUndo />
          </button>
          <button 
            className={cx("redo-btn")} 
            onClick={handleRedo}
            disabled={currentIndex >= history.length - 1}
          >
            <FaRedo />
          </button>
          <div className={cx("color-picker")}>
            {colors.map(color => (
              <button
                key={color}
                className={cx("color-btn", { active: color === selectedColor })}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
        </div>
        <div className={cx("toolbar-right")}>
          <button 
            className={cx('save-btn', {
              'has-changes': JSON.stringify(fieldValues) !== JSON.stringify(lastSavedState),
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
          <button className={cx("preview-btn")} onClick={handlePreview}>
            <FaEye /> Xem trước
          </button>
        </div>
      </div>

      <div className={cx("editor-container")}>
        <div className={cx("form-section")}>
          <h2>Thông tin CV</h2>
          {templateFields.map(field => (
            <div key={field.field_id} className={cx("form-group")}>
              <label>{field.field_label}</label>
              {field.field_type === 'textarea' ? (
                <textarea
                  value={fieldValues[field.field_name] || ''}
                  onChange={e => handleInputChange(field.field_name, e.target.value)}
                  placeholder={field.field_placeholder}
                />
              ) : (
                <input
                  type="text"
                  value={fieldValues[field.field_name] || ''}
                  onChange={e => handleInputChange(field.field_name, e.target.value)}
                  placeholder={field.field_placeholder}
                />
              )}
            </div>
          ))}
        </div>
        
        <div className={cx("preview-section")}>
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
              ${templateCss
                ?.replace(/\$primary-color/g, selectedColor)
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
            className={cx("cv-preview", { 'no-background': !showBackground, 'editing-mode': isEditing })} 
            dangerouslySetInnerHTML={renderTemplate()}
          />
        </div>
      </div>
        </div>
    );
};

export default EditCV;
