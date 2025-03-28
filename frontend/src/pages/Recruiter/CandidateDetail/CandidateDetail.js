import React, { useEffect, useState } from "react";
import { authAPI, recruiterApis, userApis } from "~/utils/api";
import { useParams, Link } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./CandidateDetail.module.scss";
import images from "~/assets/images";
import useScrollTop from '~/hooks/useScrollTop';
import { toast } from "react-hot-toast";
import html2pdf from 'html2pdf.js';

const cx = classNames.bind(styles);

const CandidateDetail = () => {
  const { candidate_id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [candidateExperiences, setCandidateExperiences] = useState(null);
  const [candidateEducation, setCandidateEducation] = useState(null);
  const [candidateCertifications, setCandidateCertifications] = useState(null);
  const [candidateProjects, setCandidateProjects] = useState(null);
  const [candidateLanguages, setCandidateLanguages] = useState(null);
  const [candidateCvs, setCandidateCvs] = useState(null);
  const [user, setUser] = useState(null);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showCvModal, setShowCvModal] = useState(false);
  const [selectedCv, setSelectedCv] = useState(null);
  const [userCvs, setUserCvs] = useState(null);
  const [templateFields, setTemplateFields] = useState([]);
  const [templateHtml, setTemplateHtml] = useState('');
  const [templateCss, setTemplateCss] = useState('');
  const [fieldValues, setFieldValues] = useState({});
  const [selectedColor, setSelectedColor] = useState('#013a74');
  const [bgColor, setBgColor] = useState('rgba(240, 247, 255, 0.5)');

  useEffect(() => {
    const fetchCandidateDetail = async () => {
      try {
        const response = await authAPI().get(recruiterApis.getCandidateDetailByCandidateId(candidate_id));
        setCandidate(response.data);
        console.log(response.data);
        setCandidateProfile(response.data.candidate);
        setUser(response.data.user);
        setCandidateExperiences(response.data.candidateExperiences);
        setCandidateEducation(response.data.candidateEducation);
        setCandidateCertifications(response.data.candidateCertifications);
        setCandidateProjects(response.data.candidateProjects);
        setCandidateLanguages(response.data.candidateLanguages);
        setCandidateCvs(response.data.candidateCvs);
        setUserCvs(response.data.userCvs);
      } catch (error) {
        console.error("Error fetching candidate details:", error);
      }
    };
    fetchCandidateDetail();
  }, [candidate_id]);

  const formatSalary = (salary) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(salary);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const handleContactClick = () => {
    setShowContactModal(true);
  };

  const handleCloseModal = () => {
    setShowContactModal(false);
  };

  const handleViewCV = () => {
    setShowCvModal(true);
  };

  const handleCloseCvModal = () => {
    setShowCvModal(false);
    setSelectedCv(null);
  };

  const handleViewCvDetail = async (cv) => {
    try {
      // Fetch template fields
      const fieldsResponse = await authAPI().get(
        userApis.getAllTemplateFieldsByTemplateId(cv.template_id)
      );
      const templateFields = fieldsResponse.data.templateFields;
      setTemplateFields(templateFields);

      // Fetch field values
      const valuesResponse = await authAPI().get(
        userApis.getAllCvFieldValuesByCvId(cv.cv_id)
      );
      
      // Create mapping of field_id to field values
      const values = {};
      templateFields.forEach(field => {
        const fieldValue = valuesResponse.data.cvFieldValues.find(
          value => value.field_id === field.field_id
        );
        values[field.field_name] = fieldValue ? fieldValue.field_value : '';
      });
      setFieldValues(values);

      // Fetch template HTML and CSS
      const templateResponse = await authAPI().get(
        userApis.getTemplateById(cv.template_id)
      );
      setTemplateHtml(templateResponse.data.template.template_html);
      setTemplateCss(templateResponse.data.template.template_css);

      setSelectedCv(cv);
    } catch (error) {
      console.error("Error fetching CV details:", error);
      toast.error("Có lỗi xảy ra khi tải CV");
    }
  };

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

  const downloadPDF = () => {
    const cvElement = document.querySelector('.cv-preview');
    if (!cvElement) return;

    const opt = {
      margin: [10, 10],
      filename: `CV-${user?.name || 'Candidate'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };

    // Show loading toast
    const loadingToast = toast.loading('Đang tạo PDF...');

    html2pdf().set(opt).from(cvElement).save()
      .then(() => {
        toast.dismiss(loadingToast);
        toast.success('Tải CV thành công!');
      })
      .catch(err => {
        toast.dismiss(loadingToast);
        toast.error('Có lỗi xảy ra khi tải CV');
        console.error('PDF download error:', err);
      });
  };

  if (!candidate) return <div>Loading...</div>;

  return (
    <div className={cx('wrapper')}>
      <div className={cx('profile-header')}>
        <div className={cx('profile-banner')} />
        <div className={cx('profile-info')}>
          <div className={cx('avatar')}>
            <img src={candidateProfile?.profile_picture || images.avatar} alt="Profile" />
          </div>
          <div className={cx('info')}>
            <div className={cx('name-section')}>
              <h1>{user?.name}</h1>
              <span className={cx('status', { 
                'active': Boolean(candidateProfile?.is_actively_searching),
                'inactive': !Boolean(candidateProfile?.is_actively_searching)
              })}>
                {Boolean(candidateProfile?.is_actively_searching) ? 'Đang tìm việc' : 'Không tìm việc'}
              </span>
            </div>
            {/* <p className={cx('title')}>{candidateProfile?.current_job_title}</p> */}
            <div className={cx('meta')}>
              <span><i className="fas fa-map-marker-alt"></i>{candidateProfile?.location}</span>
              <span><i className="fas fa-building"></i>{candidateProfile?.current_company}</span>
              <span><i className="fas fa-briefcase"></i>{candidateProfile?.experience}</span>
              <span><i className="fas fa-money-bill"></i>{formatSalary(candidateProfile?.expected_salary)}</span>
            </div>
            <div className={cx('skills')}>
              {candidateProfile?.skills?.split(',').map((skill, index) => (
                <span key={index} className={cx('skill-tag')}>{skill.trim()}</span>
              ))}
            </div>
          </div>
          <div className={cx('actions')}>
            <button 
              className={cx('view-cv-btn')} 
              onClick={handleViewCV}
            >
              <i className="fas fa-file-alt"></i>Xem CV
            </button>
            <button 
              className={cx('contact-btn')} 
              onClick={handleContactClick}
            >
              <i className="fas fa-envelope"></i>Liên hệ
            </button>
          </div>
        </div>
      </div>

      <div className={cx('profile-content')}>
        <div className={cx('main-column')}>
          <section className={cx('about')}>
            <h2><i className="fas fa-user"></i>Giới thiệu</h2>
            <div className={cx('about-content')}>
              <p>{candidateProfile?.about_me}</p>
              <div className={cx('career-objective')}>
                <h3>Mục tiêu nghề nghiệp</h3>
                <p>{candidateProfile?.career_objective}</p>
              </div>
              <div className={cx('basic-info')}>
                <div className={cx('info-item')}>
                  <span>Ngày sinh</span>
                  <p>{formatDate(candidateProfile?.date_of_birth)}</p>
                </div>
                <div className={cx('info-item')}>
                  <span>Giới tính</span>
                  <p>{candidateProfile?.gender}</p>
                </div>
                <div className={cx('info-item')}>
                  <span>Quốc tịch</span>
                  <p>{candidateProfile?.nationality}</p>
                </div>
                <div className={cx('info-item')}>
                  <span>Email</span>
                  <p>{user?.email}</p>
                </div>
                <div className={cx('info-item')}>
                  <span>Số điện thoại</span>
                  <p>{user?.phone}</p>
                </div>
                <div className={cx('info-item')}>
                  <span>Loại hình công việc</span>
                  <p>{candidateProfile?.employment_type}</p>
                </div>
              </div>
            </div>
          </section>

          <section className={cx('experience')}>
            <h2><i className="fas fa-briefcase"></i>Experience</h2>
            <div className={cx('timeline')}>
              {candidateExperiences?.map(exp => (
                <div key={exp.id} className={cx('timeline-item')}>
                  <div className={cx('timeline-marker')}></div>
                  <div className={cx('timeline-content')}>
                    <h3>{exp.job_title}</h3>
                    <p className={cx('company')}>{exp.company_name}</p>
                    <p className={cx('period')}>
                      {new Date(exp.start_date).toLocaleDateString()} - 
                      {exp.is_current ? 'Present' : new Date(exp.end_date).toLocaleDateString()}
                    </p>
                    <div className={cx('description')}>{exp.job_description}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={cx('projects')}>
            <h2><i className="fas fa-project-diagram"></i>Projects</h2>
            <div className={cx('project-grid')}>
              {candidateProjects?.map(project => (
                <div key={project.id} className={cx('project-card')}>
                  <h3>{project.project_name}</h3>
                  <p className={cx('role')}>{project.role}</p>
                  <p className={cx('description')}>{project.description}</p>
                  <div className={cx('tech-stack')}>
                    {project.technologies_used.split(',').map((tech, index) => (
                      <span key={index} className={cx('tech-tag')}>{tech.trim()}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className={cx('side-column')}>
          <section className={cx('education')}>
            <h2><i className="fas fa-graduation-cap"></i>Education</h2>
            {candidateEducation?.map(edu => (
              <div key={edu.id} className={cx('education-card')}>
                <h3>{edu.degree} in {edu.field_of_study}</h3>
                <p className={cx('institution')}>{edu.institution}</p>
                <p className={cx('period')}>
                  {new Date(edu.start_date).toLocaleDateString()} - 
                  {new Date(edu.end_date).toLocaleDateString()}
                </p>
                <p className={cx('grade')}>GPA: {edu.grade}</p>
              </div>
            ))}
          </section>

          <section className={cx('certifications')}>
            <h2><i className="fas fa-certificate"></i>Certifications</h2>
            {candidateCertifications?.map(cert => (
              <div key={cert.id} className={cx('cert-card')}>
                <h3>{cert.certification_name}</h3>
                <p>{cert.issuing_organization}</p>
                <p className={cx('period')}>
                  Issued: {new Date(cert.issue_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </section>

          <section className={cx('languages')}>
            <h2><i className="fas fa-language"></i>Languages</h2>
            {candidateLanguages?.map(lang => (
              <div key={lang.id} className={cx('language-item')}>
                <span>{lang.language}</span>
                <div className={cx('proficiency-bar')}>
                  <div 
                    className={cx('proficiency-level')} 
                    data-level={lang.proficiency}
                  ></div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className={cx('modal-overlay')} onClick={handleCloseModal}>
          <div className={cx('contact-modal')} onClick={e => e.stopPropagation()}>
            <div className={cx('modal-header')}>
              <h2>Thông tin liên hệ</h2>
              <button className={cx('close-btn')} onClick={handleCloseModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className={cx('modal-content')}>
              <div className={cx('contact-info')}>
                <div className={cx('info-item')}>
                  <i className="fas fa-user"></i>
                  <div>
                    <label>Họ và tên</label>
                    <p>{user?.name}</p>
                  </div>
                </div>

                <div className={cx('info-item')}>
                  <i className="fas fa-envelope"></i>
                  <div>
                    <label>Email</label>
                    <p>{user?.email}</p>
                    {user?.is_email_verified && (
                      <span className={cx('verified-badge')}>
                        <i className="fas fa-check-circle"></i> Đã xác thực
                      </span>
                    )}
                  </div>
                </div>

                <div className={cx('info-item')}>
                  <i className="fas fa-phone"></i>
                  <div>
                    <label>Số điện thoại</label>
                    <p>{user?.phone || 'Chưa cập nhật'}</p>
                    {user?.is_phone_verified && (
                      <span className={cx('verified-badge')}>
                        <i className="fas fa-check-circle"></i> Đã xác thực
                      </span>
                    )}
                  </div>
                </div>

                <div className={cx('info-item')}>
                  <i className="fas fa-user-circle"></i>
                  <div>
                    <label>Username</label>
                    <p>{user?.username}</p>
                  </div>
                </div>

                <div className={cx('info-item')}>
                  <i className="fas fa-clock"></i>
                  <div>
                    <label>Ngày tham gia</label>
                    <p>{new Date(user?.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCvModal && (
        <div className={cx('modal-overlay')} onClick={handleCloseCvModal}>
          <div className={cx('cv-modal')} onClick={e => e.stopPropagation()}>
            <div className={cx('modal-header')}>
              <div className={cx('header-content')}>
                <h2>CV của {user?.name}</h2>
                <p>{candidateProfile?.current_job_title || 'Chưa cập nhật vị trí'}</p>
              </div>
              <button className={cx('close-btn')} onClick={handleCloseCvModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className={cx('modal-content')}>
              {/* CV tải lên */}
              {candidateCvs && candidateCvs.filter(cv => cv.is_template).length > 0 && (
                <div className={cx('cv-section')}>
                  <div className={cx('section-header')}>
                    <i className="fas fa-file-upload"></i>
                    <h3>CV tải lên</h3>
                  </div>
                  <div className={cx('cv-list')}>
                    {candidateCvs
                      .filter(cv => cv.is_template)
                      .map((cv) => (
                        <div key={cv.cv_id} className={cx('cv-item')}>
                          <div className={cx('cv-info')}>
                            <div className={cx('cv-icon')}>
                              <i className="fas fa-file-pdf"></i>
                            </div>
                            <div className={cx('cv-details')}>
                              <h4>{cv.cv_name}</h4>
                              <span>
                                <i className="far fa-clock"></i>
                                Tải lên: {new Date(cv.created_at).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>
                          <div className={cx('cv-actions')}>
                            <button 
                              className={cx('view-btn')}
                              onClick={() => window.open(cv.cv_link, '_blank')}
                            >
                              <i className="fas fa-eye"></i>
                              Xem
                            </button>
                            <button 
                              className={cx('download-btn')}
                              onClick={downloadPDF}
                            >
                              <i className="fas fa-download"></i>
                              Tải PDF
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* CV tạo trên web */}
              {userCvs && userCvs.filter(cv => cv.is_template).length > 0 && (
                <div className={cx('cv-section')}>
                  <div className={cx('section-header')}>
                    <i className="fas fa-pencil-alt"></i>
                    <h3>CV tạo trên web</h3>
                  </div>
                  <div className={cx('cv-grid')}>
                    {userCvs
                      .filter(cv => cv.is_template)
                      .map((cv) => (
                        <div key={cv.cv_id} className={cx('cv-card')}>
                          <div className={cx('cv-preview')}>
                            <div className={cx('preview-overlay')}>
                              <div className={cx('preview-actions')}>
                                <button 
                                  className={cx('preview-btn')}
                                  onClick={() => handleViewCvDetail(cv)}
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                              </div>
                            </div>
                            <img 
                              src={images.default_cv} 
                              alt={cv.cv_name}
                              onError={(e) => {
                                e.target.src = images.default_cv;
                              }}
                            />
                          </div>
                          <div className={cx('cv-info')}>
                            <h4>{cv.cv_name}</h4>
                            <span>
                              <i className="far fa-clock"></i>
                              Cập nhật: {new Date(cv.updated_at).toLocaleDateString('vi-VN')}
                            </span>
                            <div className={cx('cv-actions')}>
                              <button 
                                className={cx('view-btn')}
                                onClick={() => handleViewCvDetail(cv)}
                              >
                                <i className="fas fa-eye"></i>
                                Xem chi tiết
                              </button>
                              <button 
                                className={cx('download-btn')}
                                onClick={downloadPDF}
                              >
                                <i className="fas fa-download"></i>
                                Tải PDF
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedCv && (
        <div className={cx('cv-preview-modal')} onClick={handleCloseCvModal}>
          <div className={cx('preview-content')} onClick={e => e.stopPropagation()}>
            <div className={cx('preview-header')}>
              <div className={cx('header-content')}>
                <div className={cx('header-icon')}>
                  <i className="fas fa-eye"></i>
                </div>
                <h2>Xem CV Online của {fieldValues.fullName || user?.name}</h2>
                <p>Xem trước CV trước khi tải xuống</p>
              </div>
              
              <div className={cx('header-actions')}>
                <button 
                  className={cx('action-btn', 'pdf')} 
                  title="Tải CV dưới dạng PDF"
                  onClick={downloadPDF}
                >
                  <div className={cx('btn-icon')}>
                    <i className="fas fa-file-pdf"></i>
                  </div>
                  <span>Tải CV PDF</span>
                </button>
                <button className={cx('close-btn')} onClick={handleCloseCvModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            <div className={cx('preview-container')}>
              <div className={cx('paper-effect')}>
                <TemplateStyle />
                <div 
                  className="cv-preview"
                  dangerouslySetInnerHTML={renderTemplate()} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDetail;
