// JobZoneProfile page

import { useEffect, useState, useContext } from 'react';
import classNames from 'classnames/bind';
import styles from './JobZoneProfile.module.scss';
import { authAPI, userApis } from "~/utils/api";
import UserContext from "~/context/UserContext";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaBriefcase, FaCode, FaFileAlt, FaImage, FaAward, FaCloudUploadAlt, FaTrophy, FaGlobe, FaEdit, FaTimes } from "react-icons/fa";
import { toast } from 'react-hot-toast';

const cx = classNames.bind(styles);

const BasicInfoTab = ({ userDetails, candidateProfile }) => {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className={cx('form-section')}>
            <div className={cx('section-header')}>
                <h2>Thông tin cơ bản</h2>
                <button 
                    className={cx('edit-btn')} 
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? (
                        <>
                            <FaTimes className={cx('icon')} />
                            Hủy
                        </>
                    ) : (
                        <>
                            <FaEdit className={cx('icon')} />
                            Chỉnh sửa
                        </>
                    )}
                </button>
            </div>

            {/* Thông tin cá nhân */}
            <div className={cx('form-group')}>
                <label>Họ và tên</label>
                <input 
                    type="text" 
                    defaultValue={userDetails?.name} 
                    placeholder="Nhập họ và tên"
                    readOnly={!isEditing}
                />
            </div>
            <div className={cx('form-row')}>
                <div className={cx('form-group')}>
                    <label>Ngày sinh</label>
                    <input 
                        type="date" 
                        defaultValue={candidateProfile?.date_of_birth} 
                        readOnly={!isEditing}
                    />
                </div>
                <div className={cx('form-group')}>
                    <label>Giới tính</label>
                    <select defaultValue={candidateProfile?.gender} disabled={!isEditing}>
                        <option value="Male">Nam</option>
                        <option value="Female">Nữ</option>
                        <option value="Other">Khác</option>
                    </select>
                </div>
            </div>

            {/* Thông tin liên hệ */}
            <div className={cx('form-group')}>
                <label>Email</label>
                <input 
                    type="email" 
                    defaultValue={userDetails?.email} 
                    placeholder="Nhập email"
                    readOnly={!isEditing}
                />
            </div>
            <div className={cx('form-group')}>
                <label>Số điện thoại</label>
                <input 
                    type="tel" 
                    defaultValue={userDetails?.phone} 
                    placeholder="Nhập số điện thoại"
                    readOnly={!isEditing}
                />
            </div>
            <div className={cx('form-group')}>
                <label>Địa chỉ hiện tại</label>
                <input 
                    type="text" 
                    defaultValue={candidateProfile?.location} 
                    placeholder="Nhập địa chỉ"
                    readOnly={!isEditing}
                />
            </div>

            {/* Mong muốn công việc */}
            <div className={cx('form-row')}>
                <div className={cx('form-group')}>
                    <label>Mức lương mong muốn (VNĐ)</label>
                    <input 
                        type="number" 
                        defaultValue={candidateProfile?.expected_salary}
                        readOnly={!isEditing}
                    />
                </div>
                <div className={cx('form-group')}>
                    <label>Hình thức làm việc</label>
                    <select defaultValue={candidateProfile?.employment_type} disabled={!isEditing}>
                        <option value="Full-time">Toàn thời gian</option>
                        <option value="Part-time">Bán thời gian</option>
                        <option value="Contract">Hợp đồng</option>
                        <option value="Freelance">Freelance</option>
                    </select>
                </div>
            </div>

            <div className={cx('form-row')}>
                <div className={cx('form-group')}>
                    <label>Thời gian báo trước</label>
                    <input 
                        type="text" 
                        defaultValue={candidateProfile?.notice_period}
                        placeholder="VD: 1 tháng"
                        readOnly={!isEditing}
                    />
                </div>
                <div className={cx('form-group')}>
                    <label>Địa điểm làm việc mong muốn</label>
                    <input 
                        type="text" 
                        defaultValue={candidateProfile?.preferred_work_location}
                        placeholder="VD: Hồ Chí Minh, Hà Nội"
                        readOnly={!isEditing}
                    />
                </div>
            </div>

            {/* Giới thiệu và mục tiêu */}
            <div className={cx('form-group')}>
                <label>Giới thiệu bản thân</label>
                <textarea 
                    defaultValue={candidateProfile?.about_me} 
                    placeholder="Giới thiệu ngắn gọn về bản thân"
                    readOnly={!isEditing}
                />
            </div>
            <div className={cx('form-group')}>
                <label>Mục tiêu nghề nghiệp</label>
                <textarea 
                    defaultValue={candidateProfile?.career_objective}
                    placeholder="Mục tiêu nghề nghiệp của bạn"
                    readOnly={!isEditing}
                />
            </div>

            {isEditing && (
                <button className={cx('save-btn')}>
                    Lưu thay đổi
                </button>
            )}
        </div>
    );
};

const EducationTab = ({ education, onUpdateEducation, candidateProfile }) => {
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const { user } = useContext(UserContext);

    // Format dates from ISO to YYYY-MM-DD
    const formatDate = (isoDate) => {
        if (!isoDate) return '';
        return new Date(isoDate).toISOString().split('T')[0];
    };

    const handleStartEdit = (edu) => {
        setFormData({
            candidate_id: edu.candidate_id,
            institution: edu.institution,
            field_of_study: edu.field_of_study,
            degree: edu.degree,
            start_date: formatDate(edu.start_date),
            end_date: formatDate(edu.end_date),
        });
        setEditingId(edu.id);
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (eduId) => {
        try {
            setLoading(true);
            console.log("Sending data:", formData); // Để debug

            const response = await authAPI().put(
                userApis.editCandidateEducation(eduId),
                formData
            );

            console.log("Response:", response); // Để debug

            if (response.data.code === 1) {
                onUpdateEducation && onUpdateEducation(response.data.candidateEducation);
                setEditingId(null);
                toast.success('Cập nhật thông tin học vấn thành công');
            }
        } catch (error) {
            console.error("Error:", error); // Để debug
            toast.error('Có lỗi xảy ra khi cập nhật thông tin học vấn');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        try {
            if (!candidateProfile?.candidate_id) {
                toast.error('Không tìm thấy mã ứng viên');
                return;
            }

            setLoading(true);
            const newEducation = {
                institution: formData.institution,
                degree: formData.degree,
                field_of_study: formData.field_of_study,
                start_date: formData.start_date,
                end_date: formData.end_date,
                grade: formData.grade,
                activities: formData.activities
            };

            const response = await authAPI().post(
                userApis.createCandidateEducationWithCandidateId(candidateProfile.candidate_id),
                newEducation
            );
            console.log("response",response.data.candidateEducation);

            if (response.data.code === 1) {
                onUpdateEducation(prev => [...prev, response.data.candidateEducation]);
                setShowModal(false);
                setFormData({});
                toast.success('Thêm thông tin học vấn thành công');
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error('Có lỗi xảy ra khi thêm thông tin học vấn');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('form-section')}>
            <h2>Học vấn</h2>
            {education?.map((edu) => (
                <div key={edu.id} className={cx('education-item')}>
                    <div className={cx('item-header')}>
                        <h3>{edu.institution}</h3>
                        <button 
                            className={cx('edit-btn', { 'cancel': editingId === edu.id })} 
                            onClick={() => editingId === edu.id ? handleCancel() : handleStartEdit(edu)}
                        >
                            {editingId === edu.id ? (
                                <>
                                    <FaTimes className={cx('icon')} />
                                    Hủy
                                </>
                            ) : (
                                <>
                                    <FaEdit className={cx('icon')} />
                                    Chỉnh sửa
                                </>
                            )}
                        </button>
                    </div>

                    <div className={cx('form-group')}>
                        <label>Trường</label>
                        <input 
                            type="text" 
                            name="institution"
                            value={formData.institution || edu.institution}
                            onChange={handleInputChange}
                            readOnly={editingId !== edu.id}
                        />
                    </div>
                    <div className={cx('form-group')}>
                        <label>Chuyên ngành</label>
                        <input 
                            type="text" 
                            name="field_of_study"
                            value={formData.field_of_study || edu.field_of_study}
                            onChange={handleInputChange}
                            readOnly={editingId !== edu.id}
                        />
                    </div>
                    <div className={cx('form-row')}>
                        <div className={cx('form-group')}>
                            <label>Bắt đầu</label>
                            <input 
                                type="date" 
                                name="start_date"
                                value={formData.start_date || edu.start_date}
                                onChange={handleInputChange}
                                readOnly={editingId !== edu.id}
                            />
                        </div>
                        <div className={cx('form-group')}>
                            <label>Kết thúc</label>
                            <input 
                                type="date" 
                                name="end_date"
                                value={formData.end_date || edu.end_date}
                                onChange={handleInputChange}
                                readOnly={editingId !== edu.id}
                            />
                        </div>
                    </div>
                    <div className={cx('form-group')}>
                        <label>Bằng cấp</label>
                        <select 
                            name="degree"
                            value={formData.degree || edu.degree}
                            onChange={handleInputChange}
                            disabled={editingId !== edu.id}
                        >
                            <option value="High School">THPT</option>
                            <option value="Associate">Cao đẳng</option>
                            <option value="Bachelor">Đại học</option>
                            <option value="Master">Thạc sĩ</option>
                            <option value="PhD">Tiến sĩ</option>
                        </select>
                    </div>
                  
                    {editingId === edu.id && (
                        <button className={cx('save-btn')} onClick={() => handleSubmit(edu.id)}>
                            Lưu thay đổi
                        </button>
                    )}
                </div>
            ))}
            <button 
                className={cx('add-btn')} 
                onClick={() => setShowModal(true)}
            >
                + Thêm học vấn
            </button>

            {showModal && (
                <div className={cx('modal-overlay')}>
                    <div className={cx('modal')}>
                        <div className={cx('modal-header')}>
                            <h3>Thêm học vấn mới</h3>
                            <button 
                                className={cx('close-btn')}
                                onClick={() => {
                                    setShowModal(false);
                                    setFormData({});
                                }}
                            >
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className={cx('modal-content')}>
                            <div className={cx('form-group')}>
                                <label>Mã ứng viên</label>
                                <input 
                                    type="text"
                                    value={candidateProfile?.candidate_id || 'Đang tải...'}
                                    disabled
                                    className={cx('disabled-input')}
                                />
                            </div>

                            <div className={cx('form-group')}>
                                <label>Trường</label>
                                <input 
                                    type="text"
                                    name="institution"
                                    value={formData.institution || ''}
                                    onChange={handleInputChange}
                                    placeholder="Nhập tên trường"
                                    required
                                />
                            </div>

                            <div className={cx('form-group')}>
                                <label>Chuyên ngành</label>
                                <input 
                                    type="text"
                                    name="field_of_study"
                                    value={formData.field_of_study || ''}
                                    onChange={handleInputChange}
                                    placeholder="Nhập chuyên ngành"
                                />
                            </div>

                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Bắt đầu</label>
                                    <input 
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className={cx('form-group')}>
                                    <label>Kết thúc</label>
                                    <input 
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className={cx('form-group')}>
                                <label>Bằng cấp</label>
                                <select 
                                    name="degree"
                                    value={formData.degree || ''}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Chọn bằng cấp</option>
                                    <option value="High School">THPT</option>
                                    <option value="Associate">Cao đẳng</option>
                                    <option value="Bachelor">Đại học</option>
                                    <option value="Master">Thạc sĩ</option>
                                    <option value="PhD">Tiến sĩ</option>
                                </select>
                            </div>
                        </div>

                        <div className={cx('modal-footer')}>
                            <button 
                                className={cx('cancel-btn')}
                                onClick={() => {
                                    setShowModal(false);
                                    setFormData({});
                                }}
                            >
                                Hủy
                            </button>
                            <button 
                                className={cx('save-btn')}
                                onClick={handleAdd}
                                disabled={loading}
                            >
                                {loading ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ExperienceTab = ({ experiences }) => {
    const [editingId, setEditingId] = useState(null);

    return (
        <div className={cx('form-section')}>
            <h2>Kinh nghiệm làm việc</h2>
            {experiences?.map((exp) => (
                <div key={exp.id} className={cx('experience-item')}>
                    <div className={cx('item-header')}>
                        <h3>{exp.company_name}</h3>
                        <button 
                            className={cx('edit-btn', { 'cancel': editingId === exp.id })} 
                            onClick={() => setEditingId(editingId === exp.id ? null : exp.id)}
                        >
                            {editingId === exp.id ? (
                                <>
                                    <FaTimes className={cx('icon')} />
                                    Hủy
                                </>
                            ) : (
                                <>
                                    <FaEdit className={cx('icon')} />
                                    Chỉnh sửa
                                </>
                            )}
                        </button>
                    </div>

                    <div className={cx('form-group')}>
                        <label>Công ty</label>
                        <input 
                            type="text" 
                            defaultValue={exp.company_name}
                            readOnly={editingId !== exp.id}
                        />
                    </div>
                    <div className={cx('form-group')}>
                        <label>Vị trí</label>
                        <input 
                            type="text" 
                            defaultValue={exp.position}
                            readOnly={editingId !== exp.id}
                        />
                    </div>
                    <div className={cx('form-row')}>
                        <div className={cx('form-group')}>
                            <label>Bắt đầu</label>
                            <input 
                                type="date" 
                                defaultValue={exp.start_date}
                                readOnly={editingId !== exp.id}
                            />
                        </div>
                        <div className={cx('form-group')}>
                            <label>Kết thúc</label>
                            <input 
                                type="date" 
                                defaultValue={exp.end_date}
                                readOnly={editingId !== exp.id}
                            />
                        </div>
                    </div>
                    <div className={cx('form-group')}>
                        <label>Mô tả công việc</label>
                        <textarea 
                            defaultValue={exp.job_description                            }
                            placeholder="Mô tả chi tiết công việc và trách nhiệm..."
                            readOnly={editingId !== exp.id}
                        />
                    </div>
                    <div className={cx('form-group')}>
                        <label>Thành tựu</label>
                        <textarea 
                            defaultValue={exp.achievements}
                            placeholder="Các thành tựu đạt được trong công việc..."
                            readOnly={editingId !== exp.id}
                        />
                    </div>

                    {editingId === exp.id && (
                        <button className={cx('save-btn')}>
                            Lưu thay đổi
                        </button>
                    )}
                </div>
            ))}
            <button className={cx('add-btn')}>+ Thêm kinh nghiệm</button>
        </div>
    );
};

const CertificationsTab = ({ certifications }) => {
    const [editingId, setEditingId] = useState(null);

    return (
        <div className={cx('form-section')}>
            <h2>Chứng chỉ</h2>
            {certifications?.map((cert) => (
                <div key={cert.id} className={cx('certification-item')}>
                    <div className={cx('item-header')}>
                        <h3>{cert.certification_name}</h3>
                        <button 
                            className={cx('edit-btn', { 'cancel': editingId === cert.id })} 
                            onClick={() => setEditingId(editingId === cert.id ? null : cert.id)}
                        >
                            {editingId === cert.id ? (
                                <>
                                    <FaTimes className={cx('icon')} />
                                    Hủy
                                </>
                            ) : (
                                <>
                                    <FaEdit className={cx('icon')} />
                                    Chỉnh sửa
                                </>
                            )}
                        </button>
                    </div>

                    <div className={cx('form-group')}>
                        <label>Tên chứng chỉ</label>
                        <input 
                            type="text" 
                            defaultValue={cert.certification_name}
                            readOnly={editingId !== cert.id}
                        />
                    </div>
                    <div className={cx('form-group')}>
                        <label>Tổ chức cấp</label>
                        <input 
                            type="text" 
                            defaultValue={cert.issuing_organization}
                            readOnly={editingId !== cert.id}
                        />
                    </div>
                    <div className={cx('form-row')}>
                        <div className={cx('form-group')}>
                            <label>Ngày cấp</label>
                            <input 
                                type="date" 
                                defaultValue={cert.issue_date}
                                readOnly={editingId !== cert.id}
                            />
                        </div>
                        <div className={cx('form-group')}>
                            <label>Ngày hết hạn</label>
                            <input 
                                type="date" 
                                defaultValue={cert.expiry_date}
                                readOnly={editingId !== cert.id}
                            />
                        </div>
                    </div>
                    <div className={cx('form-group')}>
                        <label>Mã chứng chỉ</label>
                        <input 
                            type="text" 
                            defaultValue={cert.credential_id}
                            readOnly={editingId !== cert.id}
                        />
                    </div>
                    <div className={cx('form-group')}>
                        <label>Link xác thực</label>
                        <input 
                            type="url" 
                            defaultValue={cert.credential_url}
                            readOnly={editingId !== cert.id}
                        />
                    </div>

                    {editingId === cert.id && (
                        <button className={cx('save-btn')}>
                            Lưu thay đổi
                        </button>
                    )}
                </div>
            ))}
            <button className={cx('add-btn')}>+ Thêm chứng chỉ</button>
        </div>
    );
};

const ProjectsTab = ({ projects }) => {
    const [editingId, setEditingId] = useState(null);

    return (
        <div className={cx('form-section')}>
            <h2>Dự án</h2>
            {projects?.map((project) => (
                <div key={project.id} className={cx('project-item')}>
                    <div className={cx('item-header')}>
                        <h3>{project.project_name}</h3>
                        <button 
                            className={cx('edit-btn', { 'cancel': editingId === project.id })} 
                            onClick={() => setEditingId(editingId === project.id ? null : project.id)}
                        >
                            {editingId === project.id ? (
                                <>
                                    <FaTimes className={cx('icon')} />
                                    Hủy
                                </>
                            ) : (
                                <>
                                    <FaEdit className={cx('icon')} />
                                    Chỉnh sửa
                                </>
                            )}
                        </button>
                    </div>

                    <div className={cx('form-group')}>
                        <label>Tên dự án</label>
                        <input 
                            type="text" 
                            defaultValue={project.project_name}
                            readOnly={editingId !== project.id}
                        />
                    </div>
                    <div className={cx('form-group')}>
                        <label>Vai trò</label>
                        <input 
                            type="text" 
                            defaultValue={project.role}
                            readOnly={editingId !== project.id}
                        />
                    </div>
                    <div className={cx('form-row')}>
                        <div className={cx('form-group')}>
                            <label>Bắt đầu</label>
                            <input 
                                type="date" 
                                defaultValue={project.start_date}
                                readOnly={editingId !== project.id}
                            />
                        </div>
                        <div className={cx('form-group')}>
                            <label>Kết thúc</label>
                            <input 
                                type="date" 
                                defaultValue={project.end_date}
                                readOnly={editingId !== project.id}
                            />
                        </div>
                    </div>
                    <div className={cx('form-group')}>
                        <label>Mô tả dự án</label>
                        <textarea 
                            defaultValue={project.description}
                            readOnly={editingId !== project.id}
                        />
                    </div>
                    <div className={cx('form-group')}>
                        <label>Công nghệ sử dụng</label>
                        <input 
                            type="text" 
                            defaultValue={project.technologies_used}
                            readOnly={editingId !== project.id}
                        />
                    </div>
                    <div className={cx('form-group')}>
                        <label>Link dự án</label>
                        <input 
                            type="url" 
                            defaultValue={project.project_url}
                            readOnly={editingId !== project.id}
                        />
                    </div>

                    {editingId === project.id && (
                        <button className={cx('save-btn')}>
                            Lưu thay đổi
                        </button>
                    )}
                </div>
            ))}
            <button className={cx('add-btn')}>+ Thêm dự án</button>
        </div>
    );
};

const LanguagesTab = ({ languages }) => {
    const [editingId, setEditingId] = useState(null);

    return (
        <div className={cx('form-section')}>
            <h2>Ngôn ngữ</h2>
            {languages?.map((lang) => (
                <div key={lang.id} className={cx('language-item')}>
                    <div className={cx('item-header')}>
                        <h3>{lang.language}</h3>
                        <button 
                            className={cx('edit-btn', { 'cancel': editingId === lang.id })} 
                            onClick={() => setEditingId(editingId === lang.id ? null : lang.id)}
                        >
                            {editingId === lang.id ? (
                                <>
                                    <FaTimes className={cx('icon')} />
                                    Hủy
                                </>
                            ) : (
                                <>
                                    <FaEdit className={cx('icon')} />
                                    Chỉnh sửa
                                </>
                            )}
                        </button>
                    </div>
                    
                    <div className={cx('form-group')}>
                        <label>Ngôn ngữ</label>
                        <input 
                            type="text" 
                            defaultValue={lang.language} 
                            readOnly={editingId !== lang.id}
                        />
                    </div>
                    <div className={cx('form-row')}>
                        <div className={cx('form-group')}>
                            <label>Trình độ</label>
                            <select 
                                defaultValue={lang.proficiency_level}
                                disabled={editingId !== lang.id}
                            >
                                <option value="Beginner">Cơ bản</option>
                                <option value="Intermediate">Trung cấp</option>
                                <option value="Advanced">Nâng cao</option>
                                <option value="Native">Bản ngữ</option>
                            </select>
                        </div>
                        <div className={cx('form-group')}>
                            <label>Chứng chỉ (nếu có)</label>
                            <input 
                                type="text" 
                                defaultValue={lang.certification}
                                readOnly={editingId !== lang.id}
                            />
                        </div>
                    </div>
                    <div className={cx('form-group')}>
                        <label>Mô tả thêm</label>
                        <textarea 
                            defaultValue={lang.description} 
                            placeholder="Ví dụ: Điểm IELTS 7.0, Có thể giao tiếp tốt..."
                            readOnly={editingId !== lang.id}
                        />
                    </div>
                    
                    {editingId === lang.id && (
                        <button className={cx('save-btn')}>
                            Lưu thay đổi
                        </button>
                    )}
                </div>
            ))}
            <button className={cx('add-btn')}>+ Thêm ngôn ngữ</button>
        </div>
    );
};

const JobZoneProfile = () => {
    const { user } = useContext(UserContext);
    const [candidateProfile, setCandidateProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('basic');
    
    // Thêm các state mới
    const [candidateEducation, setCandidateEducation] = useState([]);
    const [candidateExperiences, setCandidateExperiences] = useState([]);
    const [candidateCertifications, setCandidateCertifications] = useState([]);
    const [candidateProjects, setCandidateProjects] = useState([]);
    const [candidateLanguages, setCandidateLanguages] = useState([]);
    const [candidateEducations, setCandidateEducations] = useState([]);
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
        setCandidateEducation(prev => 
            prev.map(edu => 
                edu.id === updatedEducation.id ? updatedEducation : edu
            )
        );
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
                    <div className={cx('avatar-section')}>
                        <div className={cx('avatar')}>
                            <img src="https://via.placeholder.com/150" alt="Profile" />
                        </div>
                        <button className={cx('upload-btn')}>
                            <FaCloudUploadAlt />
                            Tải ảnh lên
                        </button>
                    </div>
                    <div className={cx('stats-section')}>
                        <div className={cx('stat-item')}>
                            <span className={cx('stat-number')}>0</span>
                            <span className={cx('stat-label')}>Việc làm đã ứng tuyển</span>
                        </div>
                        <div className={cx('stat-item')}>
                            <span className={cx('stat-number')}>0</span>
                            <span className={cx('stat-label')}>Việc làm đã lưu</span>
                        </div>
                        <div className={cx('stat-item')}>
                            <span className={cx('stat-number')}>0</span>
                            <span className={cx('stat-label')}>Việc làm đã xem</span>
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
                                onUpdateEducation={handleUpdateEducation}
                                candidateProfile={candidateProfile}
                            />
                        )}
                        {activeTab === 'experience' && (
                            <ExperienceTab experiences={candidateExperiences} />
                        )}
                        {activeTab === 'languages' && (
                            <LanguagesTab languages={candidateLanguages} />
                        )}
                        {activeTab === 'certifications' && (
                            <CertificationsTab certifications={candidateCertifications} />
                        )}
                        {activeTab === 'projects' && (
                            <ProjectsTab projects={candidateProjects} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobZoneProfile;