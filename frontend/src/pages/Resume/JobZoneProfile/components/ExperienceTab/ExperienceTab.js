import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './ExperienceTab.module.scss';
import { FaEdit, FaTimes, FaTrash } from "react-icons/fa";
import { toast } from 'react-hot-toast';
import { authAPI, userApis } from "~/utils/api";

const cx = classNames.bind(styles);

const ExperienceTab = ({ experiences, candidateProfile }) => {
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [experienceList, setExperienceList] = useState(experiences);

    useEffect(() => {
        setExperienceList(experiences);
    }, [experiences]);

    // Format dates from ISO to YYYY-MM-DD
    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toISOString().split('T')[0];
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEdit = (exp) => {
        setEditingId(exp.id);
        setFormData(exp);
    };

    const handleSubmit = async (e, expId) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await authAPI().put(
                userApis.editCandidateExperience(expId),
                formData
            );

            if (response.data.code === 1) {
                setExperienceList(prev => 
                    prev.map(exp => 
                        exp.id === expId ? response.data.candidateExperience : exp
                    )
                );
                setEditingId(null);
                toast.success('Cập nhật thông tin kinh nghiệm thành công');
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error('Có lỗi xảy ra khi cập nhật thông tin kinh nghiệm');
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
            const newExperience = {
                ...formData,
                candidate_id: candidateProfile.candidate_id,
                start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
                end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
                position: formData.job_title
            };

            const response = await authAPI().post(
                userApis.createCandidateExperienceWithCandidateId(candidateProfile.candidate_id),
                newExperience
            );

            if (response.data.code === 1) {
                const formattedExperience = {
                    ...response.data.candidateExperience,
                    start_date: formatDate(response.data.candidateExperience.start_date),
                    end_date: formatDate(response.data.candidateExperience.end_date)
                };
                setExperienceList(prev => [...prev, formattedExperience]);
                setShowModal(false);
                setFormData({});
                toast.success('Thêm thông tin kinh nghiệm thành công');
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error('Có lỗi xảy ra khi thêm thông tin kinh nghiệm');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (expId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thông tin kinh nghiệm này?')) {
            try {
                setLoading(true);
                const response = await authAPI().delete(
                    userApis.deleteCandidateExperienceById(expId)
                );

                if (response.data.code === 1) {
                    setExperienceList(prev => prev.filter(exp => exp.id !== expId));
                    toast.success('Xóa thông tin kinh nghiệm thành công');
                }
            } catch (error) {
                console.error("Error:", error);
                toast.error('Có lỗi xảy ra khi xóa thông tin kinh nghiệm');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className={cx('form-section')}>
            <div className={cx('section-header')}>
                <h2>Kinh nghiệm làm việc</h2>
                <button className={cx('add-btn')} onClick={() => setShowModal(true)}>
                    + Thêm kinh nghiệm
                </button>
            </div>

            {experienceList?.map((exp) => (
                <div key={exp.id} className={cx('experience-item')}>
                    <div className={cx('item-header')}>
                        <h3>{exp.company_name}</h3>
                        <div className={cx('action-buttons')}>
                            <button 
                                className={cx('edit-btn', { 'cancel': editingId === exp.id })} 
                                onClick={() => editingId === exp.id ? setEditingId(null) : handleEdit(exp)}
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
                            {editingId !== exp.id && (
                                <button 
                                    className={cx('delete-btn')}
                                    onClick={() => handleDelete(exp.id)}
                                    disabled={loading}
                                >
                                    <FaTrash className={cx('icon')} />
                                    Xóa
                                </button>
                            )}
                        </div>
                    </div>

                    {editingId === exp.id ? (
                        <form onSubmit={(e) => handleSubmit(e, exp.id)}>
                            <div className={cx('form-group')}>
                                <label>Công ty</label>
                                <input
                                    type="text"
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={cx('form-group')}>
                                <label>Chức vụ</label>
                                <input
                                    type="text"
                                    name="job_title"
                                    value={formData.job_title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Bắt đầu</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date || formatDate(exp.start_date)}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className={cx('form-group')}>
                                    <label>Kết thúc</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date || formatDate(exp.end_date)}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className={cx('form-group')}>
                                <label>Mô tả công việc</label>
                                <textarea
                                    name="job_description"
                                    value={formData.job_description}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={cx('form-group')}>
                                <label>Thành tích đạt được</label>
                                <textarea
                                    name="achievements"
                                    value={formData.achievements}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <button type="submit" className={cx('save-btn')} disabled={loading}>
                                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </form>
                    ) : (
                        <div className={cx('experience-content')}>
                            <div className={cx('experience-main')}>
                                <p className={cx('job-title')}>{exp.job_title}</p>
                                <div className={cx('experience-dates')}>
                                    <span>Từ: {formatDate(exp.start_date)}</span>
                                    {exp.end_date && <span>Đến: {formatDate(exp.end_date)}</span>}
                                </div>
                            </div>
                            <div className={cx('experience-details')}>
                                <p className={cx('description')}>{exp.job_description}</p>
                                {exp.achievements && (
                                    <div className={cx('achievements')}>
                                        <h4>Thành tích:</h4>
                                        <p>{exp.achievements}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {showModal && (
                <div className={cx('modal-overlay')}>
                    <div className={cx('modal')}>
                        <div className={cx('modal-header')}>
                            <h3>Thêm kinh nghiệm làm việc</h3>
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
                                <label>Công ty</label>
                                <input
                                    type="text"
                                    name="company_name"
                                    value={formData.company_name || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={cx('form-group')}>
                                <label>Chức vụ</label>
                                <input
                                    type="text"
                                    name="job_title"
                                    value={formData.job_title || ''}
                                    onChange={handleInputChange}
                                    required
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
                                <label>Mô tả công việc</label>
                                <textarea
                                    name="job_description"
                                    value={formData.job_description || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={cx('form-group')}>
                                <label>Thành tích đạt được</label>
                                <textarea
                                    name="achievements"
                                    value={formData.achievements || ''}
                                    onChange={handleInputChange}
                                />
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

export default ExperienceTab; 