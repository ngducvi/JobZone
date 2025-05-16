// JobZoneProfile page

import { useEffect, useState, useContext } from 'react';
import classNames from 'classnames/bind';
import styles from './JobZoneProfile.module.scss';
import { authAPI, userApis } from "~/utils/api";
import UserContext from "~/context/UserContext";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaBriefcase, FaCode, FaFileAlt, FaImage, FaAward, FaCloudUploadAlt, FaTrophy, FaGlobe, FaEdit, FaTimes, FaTrash, FaInfoCircle } from "react-icons/fa";
import { toast } from 'react-hot-toast';
import images from '~/assets/images';

// Import các component con
import BasicInfoTab from './components/BasicInfoTab';
import EducationTab from './components/EducationTab';
import ExperienceTab from './components/ExperienceTab';
import CertificationsTab from './components/CertificationsTab/CertificationsTab';
import ProjectsTab from './components/ProjectsTab/ProjectsTab';
import LanguagesTab from './components/LanguagesTab/LanguagesTab';
import SkillTab from './components/SkillTab/SkillTab';

const cx = classNames.bind(styles);

const JobZoneProfile = () => {
    const { user } = useContext(UserContext);
    const [activeTab, setActiveTab] = useState('basic');
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [candidateProfile, setCandidateProfile] = useState(null);
    const [candidateEducation, setCandidateEducation] = useState([]);
    const [candidateExperiences, setCandidateExperiences] = useState([]);
    const [candidateCertifications, setCandidateCertifications] = useState([]);
    const [candidateProjects, setCandidateProjects] = useState([]);
    const [candidateLanguages, setCandidateLanguages] = useState([]);
    const [candidateSkills, setCandidateSkills] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    const menuItems = [
        { id: 'basic', icon: <FaUser />, label: 'Thông tin cơ bản' },
        { id: 'education', icon: <FaGraduationCap />, label: 'Học vấn' },
        { id: 'experience', icon: <FaBriefcase />, label: 'Kinh nghiệm' },
        { id: 'skills', icon: <FaCode />, label: 'Kỹ năng' },
        { id: 'languages', icon: <FaGlobe />, label: 'Ngôn ngữ' },
        { id: 'certifications', icon: <FaAward />, label: 'Chứng chỉ' },
        { id: 'projects', icon: <FaCode />, label: 'Dự án' },
    ];

    // Check if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

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
                console.log('Profile response:', profileRes.data);
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
                    languagesRes,
                    skillsRes
                ] = await Promise.all([
                    authAPI().get(userApis.getCandidateEducationByCandidateId(candidate_id)),
                    authAPI().get(userApis.getCandidateExperiencesByCandidateId(candidate_id)),
                    authAPI().get(userApis.getCandidateCertificationsByCandidateId(candidate_id)),
                    authAPI().get(userApis.getCandidateProjectsByCandidateId(candidate_id)),
                    authAPI().get(userApis.getCandidateLanguagesByCandidateId(candidate_id)),
                    authAPI().get(userApis.getCandidateSkillsByCandidateId(candidate_id))
                ]);

                setCandidateProfile(profileRes.data.candidate);
                setCandidateEducation(educationRes.data.candidateEducation);
                setCandidateExperiences(experiencesRes.data.candidateExperiences);
                setCandidateCertifications(certificationsRes.data.candidateCertifications);
                setCandidateProjects(projectsRes.data.candidateProjects);
                setCandidateLanguages(languagesRes.data.candidateLanguages);
                // Parse skills string into array of objects
                const skillsData = skillsRes.data.data.skills;
                if (typeof skillsData === 'string') {
                    const skillsArray = skillsData.split(',').map(skill => ({
                        skill_id: skill.trim(),
                        skill_name: skill.trim(),
                        skill_level: 'intermediate',
                        candidate_skill_id: Date.now() + Math.random() // Temporary ID
                    }));
                    setCandidateSkills(skillsArray);
                } else if (Array.isArray(skillsData)) {
                    setCandidateSkills(skillsData);
                } else {
                    setCandidateSkills([]);
                }

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

    const handleUploadImage = async (file) => {
        setIsUploading(true);
        try {
            if (!candidateProfile?.candidate_id) {
                toast.error('Không tìm thấy thông tin ứng viên');
                return;
            }

            const formData = new FormData();
            formData.append('profile_picture', file);

            const response = await authAPI().put(
                userApis.editProfilePictureWithCandidateId(candidateProfile.candidate_id),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.data.code === 1) {
                toast.success('Cập nhật ảnh đại diện thành công');
                setCandidateProfile({
                    ...candidateProfile,
                    profile_picture: response.data.profile_picture
                });
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Có lỗi xảy ra khi tải ảnh lên');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Kích thước file không được vượt quá 5MB');
                return;
            }

            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                toast.error('Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc GIF');
                return;
            }

            setSelectedFile(URL.createObjectURL(file));
            handleUploadImage(file);
        }
    };

    if (!user) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('loading')}>Đang tải thông tin người dùng...</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('loading')}>Đang tải thông tin hồ sơ...</div>
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('profile-container')}>
                <div className={cx('profile-header')}>
                    <div className={cx('header-content')}>
                        <div className={cx('avatar-section')}>
                            <div className={cx('avatar', { uploading: isUploading })}>
                                <img 
                                    src={selectedFile || candidateProfile?.profile_picture || images.avatar} 
                                    alt="Profile" 
                                />
                                {isUploading && <div className={cx('loading-overlay')}>
                                    <span>Đang tải...</span>
                                </div>}
                            </div>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                style={{ display: 'none' }} 
                                id="file-upload" 
                            />
                            <label htmlFor="file-upload" className={cx('upload-btn')}>
                                <FaCloudUploadAlt />
                                {!isMobile ? 'Tải ảnh lên' : 'Tải ảnh'}
                            </label>
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
                <div className={cx('notification-floating')}>
                    <FaInfoCircle className={cx('notification-icon')} />
                    <div className={cx('notification-text')}>
                        <strong>Lưu ý:</strong> Thông tin hồ sơ ảnh hưởng đến phân tích AI và nhà tuyển dụng. Hãy đảm bảo thông tin chính xác!
                    </div>
                </div>
                <div className={cx('profile-content')}>
                    <div className={cx('menu-section')}>
                        {menuItems.map(item => (
                            <div
                                key={item.id}
                                className={cx('menu-item', { active: activeTab === item.id })}
                                onClick={() => setActiveTab(item.id)}
                                aria-label={`Tab ${item.label}`}
                                role="button"
                            >
                                <span className={cx('menu-icon')}>{item.icon}</span>
                                <span className={cx('menu-label')}>{isMobile && window.innerWidth <= 480 ? '' : item.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className={cx('content-section')}>
                        {activeTab === 'basic' && (
                            <BasicInfoTab userDetails={user} candidateProfile={candidateProfile} isMobile={isMobile} />
                        )}
                        {activeTab === 'education' && (
                            <EducationTab 
                                education={candidateEducation} 
                                candidateProfile={candidateProfile}
                                onUpdateEducation={handleUpdateEducation}
                                isMobile={isMobile}
                            />
                        )}
                        {activeTab === 'experience' && (
                            <ExperienceTab 
                                experiences={candidateExperiences} 
                                candidateProfile={candidateProfile}
                                isMobile={isMobile}
                            />
                        )}
                        {activeTab === 'skills' && (
                            <SkillTab 
                                skills={candidateSkills}
                                candidateProfile={candidateProfile}
                                onUpdateSkills={setCandidateSkills}
                                isMobile={isMobile}
                            />
                        )}
                        {activeTab === 'languages' && (
                            <LanguagesTab 
                                languages={candidateLanguages} 
                                candidateProfile={candidateProfile}
                                isMobile={isMobile}
                            />
                        )}
                        {activeTab === 'certifications' && (
                            <CertificationsTab 
                                certifications={candidateCertifications} 
                                candidateProfile={candidateProfile}
                                isMobile={isMobile}
                            />
                        )}
                        {activeTab === 'projects' && (
                            <ProjectsTab 
                                projects={candidateProjects} 
                                candidateProfile={candidateProfile}
                                isMobile={isMobile}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobZoneProfile;