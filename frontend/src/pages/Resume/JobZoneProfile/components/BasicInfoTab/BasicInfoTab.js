import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './BasicInfoTab.module.scss';
import { FaEdit, FaTimes } from "react-icons/fa";
import { authAPI, userApis } from "~/utils/api";
import { toast } from 'react-hot-toast';

const cx = classNames.bind(styles);

const BasicInfoTab = ({ userDetails, candidateProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (candidateProfile) {
            setFormData(candidateProfile);
        }
    }, [candidateProfile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await authAPI().put(
                userApis.editCandidate(candidateProfile.candidate_id),
                formData
            );

            if (response.data.code === 1) {
                setIsEditing(false);
                toast.success('Cập nhật thông tin thành công');
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error('Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cx('form-section')}>
            <div className={cx('section-header')}>
                <h2>Thông tin cơ bản</h2>
                <button
                    className={cx('edit-btn', { cancel: isEditing })}
                    onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                >
                    {isEditing ? <FaTimes /> : <FaEdit />}
                </button>
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    <div className={cx('form-row')}>
                        <div className={cx('form-group')}>
                            <label>Ngày sinh</label>
                            <input
                                type="date"
                                name="date_of_birth"
                                value={formData.date_of_birth || ''}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className={cx('form-group')}>
                            <label>Giới tính</label>
                            <select
                                name="gender"
                                value={formData.gender || ''}
                                onChange={handleInputChange}
                            >
                                <option value="">Chọn giới tính</option>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>
                    </div>

                    <div className={cx('form-row')}>
                        <div className={cx('form-group')}>
                            <label>Tình trạng hôn nhân</label>
                            <select
                                name="marital_status"
                                value={formData.marital_status || ''}
                                onChange={handleInputChange}
                            >
                                <option value="">Chọn tình trạng</option>
                                <option value="Độc thân">Độc thân</option>
                                <option value="Đã kết hôn">Đã kết hôn</option>
                            </select>
                        </div>
                        <div className={cx('form-group')}>
                            <label>Quốc tịch</label>
                            <input
                                type="text"
                                name="nationality"
                                value={formData.nationality || ''}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className={cx('form-group')}>
                        <label>Giới thiệu bản thân</label>
                        <textarea
                            name="about_me"
                            value={formData.about_me || ''}
                            onChange={handleInputChange}
                            rows="4"
                        />
                    </div>

                    <div className={cx('form-group')}>
                        <label>Mục tiêu nghề nghiệp</label>
                        <textarea
                            name="career_objective"
                            value={formData.career_objective || ''}
                            onChange={handleInputChange}
                            rows="4"
                        />
                    </div>

                    <div className={cx('form-row')}>
                        <div className={cx('form-group')}>
                            <label>Vị trí hiện tại</label>
                            <input
                                type="text"
                                name="current_job_title"
                                value={formData.current_job_title || ''}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className={cx('form-group')}>
                            <label>Công ty hiện tại</label>
                            <input
                                type="text"
                                name="current_company"
                                value={formData.current_company || ''}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className={cx('form-row')}>
                        <div className={cx('form-group')}>
                            <label>Mức lương hiện tại (VNĐ)</label>
                            <input
                                type="number"
                                name="current_salary"
                                value={formData.current_salary || ''}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className={cx('form-group')}>
                            <label>Mức lương mong muốn (VNĐ)</label>
                            <input
                                type="number"
                                name="expected_salary"
                                value={formData.expected_salary || ''}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className={cx('form-row')}>
                        <div className={cx('form-group')}>
                            <label>Địa điểm làm việc mong muốn</label>
                            <input
                                type="text"
                                name="preferred_work_location"
                                value={formData.preferred_work_location || ''}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className={cx('form-group')}>
                            <label>Hình thức làm việc</label>
                            <select
                                name="employment_type"
                                value={formData.employment_type || ''}
                                onChange={handleInputChange}
                            >
                                <option value="">Chọn hình thức</option>
                                <option value="Toàn thời gian">Toàn thời gian</option>
                                <option value="Bán thời gian">Bán thời gian</option>
                                <option value="Freelance">Freelance</option>
                                <option value="Remote">Remote</option>
                            </select>
                        </div>
                    </div>

                    <div className={cx('form-actions')}>
                        <button type="submit" className={cx('save-btn')} disabled={loading}>
                            {loading ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className={cx('info-content')}>
                    <div className={cx('info-row')}>
                        <div className={cx('info-group')}>
                            <label>Ngày sinh</label>
                            <span>{formData.date_of_birth ? new Date(formData.date_of_birth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</span>
                        </div>
                        <div className={cx('info-group')}>
                            <label>Giới tính</label>
                            <span>{formData.gender || 'Chưa cập nhật'}</span>
                        </div>
                    </div>

                    <div className={cx('info-row')}>
                        <div className={cx('info-group')}>
                            <label>Tình trạng hôn nhân</label>
                            <span>{formData.marital_status || 'Chưa cập nhật'}</span>
                        </div>
                        <div className={cx('info-group')}>
                            <label>Quốc tịch</label>
                            <span>{formData.nationality || 'Chưa cập nhật'}</span>
                        </div>
                    </div>

                    <div className={cx('info-group', 'full-width')}>
                        <label>Giới thiệu bản thân</label>
                        <p>{formData.about_me || 'Chưa cập nhật'}</p>
                    </div>

                    <div className={cx('info-group', 'full-width')}>
                        <label>Mục tiêu nghề nghiệp</label>
                        <p>{formData.career_objective || 'Chưa cập nhật'}</p>
                    </div>

                    <div className={cx('info-row')}>
                        <div className={cx('info-group')}>
                            <label>Vị trí hiện tại</label>
                            <span>{formData.current_job_title || 'Chưa cập nhật'}</span>
                        </div>
                        <div className={cx('info-group')}>
                            <label>Công ty hiện tại</label>
                            <span>{formData.current_company || 'Chưa cập nhật'}</span>
                        </div>
                    </div>

                    <div className={cx('info-row')}>
                        <div className={cx('info-group')}>
                            <label>Mức lương hiện tại</label>
                            <span>{formData.current_salary ? `${formData.current_salary.toLocaleString()} VNĐ` : 'Chưa cập nhật'}</span>
                        </div>
                        <div className={cx('info-group')}>
                            <label>Mức lương mong muốn</label>
                            <span>{formData.expected_salary ? `${formData.expected_salary.toLocaleString()} VNĐ` : 'Chưa cập nhật'}</span>
                        </div>
                    </div>

                    <div className={cx('info-row')}>
                        <div className={cx('info-group')}>
                            <label>Địa điểm làm việc mong muốn</label>
                            <span>{formData.preferred_work_location || 'Chưa cập nhật'}</span>
                        </div>
                        <div className={cx('info-group')}>
                            <label>Hình thức làm việc</label>
                            <span>{formData.employment_type || 'Chưa cập nhật'}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BasicInfoTab; 