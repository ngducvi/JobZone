// JobZoneProfile page

import { useEffect, useState, useContext } from 'react';
import classNames from 'classnames/bind';
import styles from './JobZoneProfile.module.scss';
import { authAPI, userApis } from "~/utils/api";
import UserContext from "~/context/UserContext";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaBriefcase, FaCode, FaFileAlt, FaImage, FaAward, FaCloudUploadAlt, FaTrophy, FaGlobe, FaEdit, FaTimes, FaTrash } from "react-icons/fa";
import { toast } from 'react-hot-toast';

// Import các component con
import BasicInfoTab from './components/BasicInfoTab';
import EducationTab from './components/EducationTab';
import ExperienceTab from './components/ExperienceTab';
import CertificationsTab from './components/CertificationsTab/CertificationsTab';
import ProjectsTab from './components/ProjectsTab/ProjectsTab';
import LanguagesTab from './components/LanguagesTab/LanguagesTab';

const cx = classNames.bind(styles);

const JobZoneProfile = () => {
    const { user } = useContext(UserContext);
    const [activeTab, setActiveTab] = useState('basic');
    const [loading, setLoading] = useState(true);
    const [candidateProfile, setCandidateProfile] = useState(null);
    const [candidateEducation, setCandidateEducation] = useState([]);
    const [candidateExperiences, setCandidateExperiences] = useState([]);
    const [candidateCertifications, setCandidateCertifications] = useState([]);
    const [candidateProjects, setCandidateProjects] = useState([]);
    const [candidateLanguages, setCandidateLanguages] = useState([]);

    const menuItems = [
        { id: 'basic', icon: <FaUser />, label: 'Thông tin cơ bản' },
        { id: 'education', icon: <FaGraduationCap />, label: 'Học vấn' },
        { id: 'experience', icon: <FaBriefcase />, label: 'Kinh nghiệm' },
        { id: 'languages', icon: <FaGlobe />, label: 'Ngôn ngữ' },
        { id: 'certifications', icon: <FaAward />, label: 'Chứng chỉ' },
        { id: 'projects', icon: <FaCode />, label: 'Dự án' },
    ];

    useEffect(() => {
        const fetchCandidateProfile = async () => {
            try {
                if (!user) {
                    setLoading(false);
                    return;
                }
                
                setLoading(true);
                // Fetch profile first
                const profileRes = await authAPI().get(userApis.getCandidateProfile(user.id));
                const candidate_id = profileRes.data.candidate.candidate_id;
                
                if (!candidate_id) {
                    toast.error('Không tìm thấy thông tin ứng viên');
                    setLoading(false);
                    return;
                }

                // Then fetch other data using candidate_id
                const [
                    educationRes,
                    experiencesRes,
                    certificationsRes,
                    projectsRes,
                    languagesRes
                ] = await Promise.all([
                    authAPI().get(userApis.getCandidateEducationByCandidateId(candidate_id)),
                    authAPI().get(userApis.getCandidateExperiencesByCandidateId(candidate_id)),
                    authAPI().get(userApis.getCandidateCertificationsByCandidateId(candidate_id)),
                    authAPI().get(userApis.getCandidateProjectsByCandidateId(candidate_id)),
                    authAPI().get(userApis.getCandidateLanguagesByCandidateId(candidate_id))
                ]);

                setCandidateProfile(profileRes.data.candidate);
                console.log(profileRes.data.candidate);
                setCandidateEducation(educationRes.data.candidateEducation);
                setCandidateExperiences(experiencesRes.data.candidateExperiences);
                setCandidateCertifications(certificationsRes.data.candidateCertifications);
                setCandidateProjects(projectsRes.data.candidateProjects);
                setCandidateLanguages(languagesRes.data.candidateLanguages);

            } catch (error) {
                console.error("Error fetching candidate profile:", error);
                toast.error('Có lỗi khi tải thông tin ứng viên');
            } finally {
                setLoading(false);
            }
        };

        fetchCandidateProfile();
    }, [user]);

    const handleUpdateEducation = (updatedEducation) => {
        setCandidateEducation(updatedEducation);
    };

    if (!user) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('loading')}>Đang tải thông tin người dùng...</div>
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('profile-container')}>
                <div className={cx('profile-header')}>
                    <div className={cx('header-content')}>
                        <div className={cx('avatar-section')}>
                            <div className={cx('avatar')}>
                                <img src={user?.avatar || "https://via.placeholder.com/150"} alt="Profile" />
                            </div>
                            <button className={cx('upload-btn')}>
                                <FaCloudUploadAlt />
                                Tải ảnh lên
                            </button>
                        </div>
                        
                        <div className={cx('user-info')}>
                            <h2>{user?.name || 'Chưa cập nhật'}</h2>
                            <div className={cx('contact-details')}>
                                <div className={cx('contact-item')}>
                                    <FaEnvelope />
                                    <span>{user?.email || 'Chưa cập nhật'}</span>
                                </div>
                                <div className={cx('contact-item')}>
                                    <FaPhone />
                                    <span>{user?.phone || 'Chưa cập nhật'}</span>
                                </div>
                                <div className={cx('contact-item')}>
                                    <FaMapMarkerAlt />
                                    <span>{candidateProfile?.location || 'Chưa cập nhật'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={cx('profile-content')}>
                    <div className={cx('menu-section')}>
                        {menuItems.map(item => (
                            <div
                                key={item.id}
                                className={cx('menu-item', { active: activeTab === item.id })}
                                onClick={() => setActiveTab(item.id)}
                            >
                                <span className={cx('menu-icon')}>{item.icon}</span>
                                <span className={cx('menu-label')}>{item.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className={cx('content-section')}>
                        {activeTab === 'basic' && (
                            <BasicInfoTab userDetails={user} candidateProfile={candidateProfile} />
                        )}
                        {activeTab === 'education' && (
                            <EducationTab 
                                education={candidateEducation} 
                                candidateProfile={candidateProfile}
                                onUpdateEducation={handleUpdateEducation}
                            />
                        )}
                        {activeTab === 'experience' && (
                            <ExperienceTab 
                                experiences={candidateExperiences} 
                                candidateProfile={candidateProfile}
                            />
                        )}
                        {activeTab === 'languages' && (
                            <LanguagesTab 
                                languages={candidateLanguages} 
                                candidateProfile={candidateProfile}
                            />
                        )}
                        {activeTab === 'certifications' && (
                            <CertificationsTab 
                                certifications={candidateCertifications} 
                                candidateProfile={candidateProfile}
                            />
                        )}
                        {activeTab === 'projects' && (
                            <ProjectsTab 
                                projects={candidateProjects} 
                                candidateProfile={candidateProfile}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobZoneProfile;