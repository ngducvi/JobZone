import React, { useEffect, useState } from "react";
import { authAPI, recruiterApis } from "~/utils/api";
import { useParams, Link } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./CandidateDetail.module.scss";
import images from "~/assets/images";
import useScrollTop from '~/hooks/useScrollTop';

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
            <p className={cx('title')}>{candidateProfile?.current_job_title}</p>
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
            <button className={cx('download-cv')}>
              <i className="fas fa-download"></i>Download CV
            </button>
            <button className={cx('contact-btn')}>
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
    </div>
  );
};

export default CandidateDetail;
