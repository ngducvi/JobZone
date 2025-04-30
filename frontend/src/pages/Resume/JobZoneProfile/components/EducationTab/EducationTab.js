import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './EducationTab.module.scss';
import { FaEdit, FaTimes, FaTrash } from "react-icons/fa";
import { toast } from 'react-hot-toast';
import { authAPI, userApis } from "~/utils/api";

const cx = classNames.bind(styles);

const EducationTab = ({ education, candidateProfile }) => {
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [educationList, setEducationList] = useState(education);

    useEffect(() => {
        setEducationList(education);
    }, [education]);

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

    const handleEdit = (edu) => {
        setEditingId(edu.id);
        setFormData(edu);
    };

    const handleSubmit = async (e, eduId) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await authAPI().put(
                userApis.editCandidateEducation(eduId),
                formData
            );

            if (response.data.code === 1) {
                setEducationList(prev => 
                    prev.map(edu => 
                        edu.id === eduId ? response.data.candidateEducation : edu
                    )
                );
                setEditingId(null);
                toast.success('Cập nhật thông tin học vấn thành công');
            }
        } catch (error) {
            console.error("Error:", error);
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
                ...formData,
                candidate_id: candidateProfile.candidate_id,
                start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
                end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null
            };

            const response = await authAPI().post(
                userApis.createCandidateEducationWithCandidateId(candidateProfile.candidate_id),
                newEducation
            );

            if (response.data.code === 1) {
                const formattedEducation = {
                    ...response.data.candidateEducation,
                    start_date: formatDate(response.data.candidateEducation.start_date),
                    end_date: formatDate(response.data.candidateEducation.end_date)
                };
                setEducationList(prev => [...prev, formattedEducation]);
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

    const handleDelete = async (eduId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thông tin học vấn này?')) {
            try {
                setLoading(true);
                const response = await authAPI().delete(
                    userApis.deleteCandidateEducationById(eduId)
                );

                if (response.data.code === 1) {
                    setEducationList(prev => prev.filter(edu => edu.id !== eduId));
                    toast.success('Xóa thông tin học vấn thành công');
                }
            } catch (error) {
                console.error("Error:", error);
                toast.error('Có lỗi xảy ra khi xóa thông tin học vấn');
            } finally {
                setLoading(false);
            }
        }
    };
    
    return (
        <div className={cx('form-section')}>
            <div className={cx('section-header')}>
                <h2>Học vấn</h2>
                <button className={cx('add-btn')} onClick={() => setShowModal(true)}>
                    + Thêm học vấn
                </button>
            </div>

            {educationList?.map((edu) => (
                <div key={edu.id} className={cx('education-item')}>
                    <div className={cx('item-header')}>
                        <h3>{edu.institution}</h3>
                        <div className={cx('action-buttons')}>
                            <button 
                                className={cx('edit-btn', { 'cancel': editingId === edu.id })} 
                                onClick={() => editingId === edu.id ? setEditingId(null) : handleEdit(edu)}
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
                            {editingId !== edu.id && (
                                <button 
                                    className={cx('delete-btn')}
                                    onClick={() => handleDelete(edu.id)}
                                    disabled={loading}
                                >
                                    <FaTrash className={cx('icon')} />
                                    Xóa
                                </button>
                            )}
                        </div>
                    </div>

                    {editingId === edu.id ? (
                        <form onSubmit={(e) => handleSubmit(e, edu.id)}>
                            <div className={cx('form-group')}>
                                <label>Trường</label>
                                <input
                                    type="text"
                                    name="institution"
                                    value={formData.institution}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Bằng cấp</label>
                                    <input
                                        type="text"
                                        name="degree"
                                        value={formData.degree}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className={cx('form-group')}>
                                    <label>Chuyên ngành</label>
                                    <input
                                        type="text"
                                        name="field_of_study"
                                        value={formData.field_of_study}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Bắt đầu</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date || formatDate(edu.start_date)}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className={cx('form-group')}>
                                    <label>Kết thúc</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date || formatDate(edu.end_date)}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className={cx('form-group')}>
                                <label>Điểm số/GPA</label>
                                <input
                                    type="text"
                                    name="grade"
                                    value={formData.grade}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className={cx('form-group')}>
                                <label>Hoạt động và thành tích</label>
                                <textarea
                                    name="activities"
                                    value={formData.activities}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <button type="submit" className={cx('save-btn')} disabled={loading}>
                                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </form>
                    ) : (
                        <div className={cx('education-content')}>
                            <div className={cx('education-main')}>
                                <p className={cx('degree')}>{edu.degree}</p>
                                <p className={cx('field')}>{edu.field_of_study}</p>
                            </div>
                            <div className={cx('education-details')}>
                                <div className={cx('education-dates')}>
                                    <span>Từ: {formatDate(edu.start_date)}</span>
                                    {edu.end_date && <span>Đến: {formatDate(edu.end_date)}</span>}
                                </div>
                                {edu.grade && <p className={cx('grade')}>Điểm số/GPA: {edu.grade}</p>}
                                {edu.activities && <p className={cx('activities')}>{edu.activities}</p>}
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {showModal && (
                <div className={cx('modal-overlay')}>
                    <div className={cx('modal')}>
                        <div className={cx('modal-header')}>
                            <h3>Thêm thông tin học vấn</h3>
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
                                <label>Trường</label>
                                <input
                                    type="text"
                                    name="institution"
                                    value={formData.institution || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Bằng cấp</label>
                                    <input
                                        type="text"
                                        name="degree"
                                        value={formData.degree || ''}
                                        onChange={handleInputChange}
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
                                    />
                                </div>
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
                                <label>Điểm số/GPA</label>
                                <input
                                    type="text"
                                    name="grade"
                                    value={formData.grade || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className={cx('form-group')}>
                                <label>Hoạt động và thành tích</label>
                                <textarea
                                    name="activities"
                                    value={formData.activities || ''}
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

export default EducationTab; 