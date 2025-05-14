// SeeCv
import React, { useEffect, useState, useRef } from "react";
import classNames from "classnames/bind";
import styles from "./SeeCv.module.scss";
import { useLocation } from "react-router-dom";
import { authAPI, userApis } from '~/utils/api';
import { toast } from 'react-hot-toast';
import { FaEye, FaDownload, FaFilePdf, FaCopy } from 'react-icons/fa';
import useScrollTop from '~/hooks/useScrollTop';
const cx = classNames.bind(styles);

const SeeCv = () => {
  const location = useLocation();
  const { cv_id, template_id, is_recruiter_view, download_mode } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [templateFields, setTemplateFields] = useState([]);
  const [templateHtml, setTemplateHtml] = useState('');
  const [templateCss, setTemplateCss] = useState('');
  const [fieldValues, setFieldValues] = useState({});
  const [selectedColor, setSelectedColor] = useState('#013a74'); // Default primary color
  const [bgColor, setBgColor] = useState('rgba(240, 247, 255, 0.5)'); // Default background color
  const downloadButtonRef = useRef(null);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []); 

  // Focus on download button if download_mode is true
  useEffect(() => {
    if (download_mode && downloadButtonRef.current) {
      downloadButtonRef.current.focus();
      // Optional: Highlight the button visually
      downloadButtonRef.current.classList.add(cx("highlight-button"));
      // Remove highlight after 2 seconds
      setTimeout(() => {
        if (downloadButtonRef.current) {
          downloadButtonRef.current.classList.remove(cx("highlight-button"));
        }
      }, 2000);
    }
  }, [download_mode, loading]);

  useEffect(() => {
    if (!cv_id || !template_id) {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch template fields
        const fieldsResponse = await authAPI().get(
          userApis.getAllTemplateFieldsByTemplateId(template_id)
        );
        const templateFields = fieldsResponse.data.templateFields;
        setTemplateFields(templateFields);

        // Fetch field values
        const valuesResponse = await authAPI().get(
          userApis.getAllCvFieldValuesByCvId(cv_id)
        );
        
        // Create mapping of field_id to field values
        const values = {};
        templateFields.forEach(field => {
          // Find corresponding field value
          const fieldValue = valuesResponse.data.cvFieldValues.find(
            value => value.field_id === field.field_id
          );
          // Use field_name from template field and value from cv field value
          values[field.field_name] = fieldValue ? fieldValue.field_value : '';
        });
        setFieldValues(values);

        // Fetch template HTML and CSS
        const templateResponse = await authAPI().get(
          userApis.getTemplateById(template_id)
        );
        setTemplateHtml(templateResponse.data.template.template_html);
        setTemplateCss(templateResponse.data.template.template_css);
        console.log(templateResponse.data.template.template_html);
        console.log(templateResponse.data.template.template_css);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Có lỗi xảy ra khi tải CV");
        setLoading(false);
      }
    };

    fetchData();
  }, [cv_id, template_id]);

  const renderTemplate = () => {
    let html = templateHtml;
    
    // Replace placeholders with actual values
    Object.keys(fieldValues).forEach(key => {
      const placeholder = `{{${key}}}`;
      const value = fieldValues[key] || '';
      html = html.replace(new RegExp(placeholder, 'g'), value);
    });

    return { __html: html };
  };

  const TemplateStyle = () => {
    // Replace color variables in CSS
    const customCSS = templateCss
      .replace(/\$primary-color/g, selectedColor)
      .replace(/\$background-color/g, bgColor);

    return (
      <style>
        {`
          /* Reset CSS */
          .cv-preview * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          /* Template CSS with replaced colors */
          ${customCSS}
        `}
      </style>
    );
  };

  // Add handleDownloadPdf function
  const handleDownloadPdf = () => {
    // Implement PDF download logic here
    // This could be a call to a backend endpoint or a client-side PDF generation
    toast.success("Đang chuẩn bị tải xuống CV...");
    // For now, just show a message
    toast.info("Tính năng đang được phát triển");
  };

  if (loading) {
    return <div className={cx("loading")}>Loading...</div>;
  }

  return (
    <div className={cx("wrapper")}>
      <div className={cx("cv-header")}>
        <div className={cx("header-content")}>
          <div className={cx("header-icon")}>
            <FaEye />
          </div>
          <h1>Xem CV Online của {fieldValues.fullName || "NGUYỄN ANH QUÂN"}</h1>
          <p>Xem trước CV của bạn trước khi tải xuống hoặc chia sẻ</p>
        </div>
        
        <div className={cx("header-actions")}>
          <button 
            ref={downloadButtonRef}
            className={cx("action-btn", "pdf", { "highlight": download_mode })} 
            title="Tải CV dưới dạng PDF"
            onClick={handleDownloadPdf}
          >
            <div className={cx("btn-icon")}>
              <FaFilePdf />
            </div>
            <span>Tải CV PDF</span>
          </button>
          <button className={cx("action-btn", "copy")} title="Sao chép liên kết CV">
            <div className={cx("btn-icon")}>
              <FaCopy />
            </div>
            <span>Copy CV</span>
          </button>
        </div>
      </div>

      <div className={cx("cv-container")}>
        <div className={cx("paper-effect")}>
          <TemplateStyle />
          <div 
            className="cv-preview"
            dangerouslySetInnerHTML={renderTemplate()} 
          />
        </div>
      </div>
    </div>
  );
};

export default SeeCv;
