import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './LanguagesTab.module.scss';
import { FaEdit, FaTimes, FaTrash } from "react-icons/fa";
import { toast } from 'react-hot-toast';
import { authAPI, userApis } from "~/utils/api";

const cx = classNames.bind(styles);

const LanguagesTab = ({ languages, candidateProfile }) => {
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [languagesList, setLanguagesList] = useState(languages);

    useEffect(() => {
        setLanguagesList(languages);
    }, [languages]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEdit = (lang) => {
        setEditingId(lang.id);
        setFormData(lang);
    };

    const handleSubmit = async (e, langId) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await authAPI().put(
                userApis.editCandidateLanguages(langId),
                formData
            );

            if (response.data.code === 1) {
                setLanguagesList(prev => 
                    prev.map(lang => 
                        lang.id === langId ? response.data.candidateLanguages : lang
                    )
                );
                setEditingId(null);
                toast.success('Cập nhật thông tin ngôn ngữ thành công');
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error('Có lỗi xảy ra khi cập nhật thông tin ngôn ngữ');
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
            const response = await authAPI().post(
                userApis.createCandidateLanguagesWithCandidateId(candidateProfile.candidate_id),
                {
                    ...formData,
                    candidate_id: candidateProfile.candidate_id
                }
            );

            if (response.data.code === 1) {
                setLanguagesList(prev => [...prev, response.data.candidateLanguages]);
                setShowModal(false);
                setFormData({});
                toast.success('Thêm thông tin ngôn ngữ thành công');
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error('Có lỗi xảy ra khi thêm thông tin ngôn ngữ');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (langId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thông tin ngôn ngữ này?')) {
            try {
                setLoading(true);
                const response = await authAPI().delete(
                    userApis.deleteCandidateLanguagesById(langId)
                );

                if (response.data.code === 1) {
                    setLanguagesList(prev => prev.filter(lang => lang.id !== langId));
                    toast.success('Xóa thông tin ngôn ngữ thành công');
                }
            } catch (error) {
                console.error("Error:", error);
                toast.error('Có lỗi xảy ra khi xóa thông tin ngôn ngữ');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className={cx('form-section')}>
            <div className={cx('section-header')}>
                <h2>Ngôn ngữ</h2>
                <button className={cx('add-btn')} onClick={() => setShowModal(true)}>
                    Thêm ngôn ngữ
                </button>
            </div>

            {languagesList?.map((lang) => (
                <div key={lang.id} className={cx('language-item')}>
                    <div className={cx('item-header')}>
                        <h3>{lang.language}</h3>
                        <div className={cx('action-buttons')}>
                            <button
                                className={cx('edit-btn', { cancel: editingId === lang.id })}
                                onClick={() => editingId === lang.id ? setEditingId(null) : handleEdit(lang)}
                            >
                                {editingId === lang.id ? <FaTimes /> : <FaEdit />}
                            </button>
                            <button
                                className={cx('delete-btn')}
                                onClick={() => handleDelete(lang.id)}
                                disabled={loading}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>

                    {editingId === lang.id ? (
                        <form onSubmit={(e) => handleSubmit(e, lang.id)}>
                            <div className={cx('form-group')}>
                                <label>Ngôn ngữ</label>
                                <input
                                    type="text"
                                    name="language"
                                    value={formData.language || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={cx('form-group')}>
                                <label>Trình độ</label>
                                <select
                                    name="proficiency"
                                    value={formData.proficiency || ''}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Chọn trình độ</option>
                                    <option value="Basic">Cơ bản</option>
                                    <option value="Intermediate">Trung cấp</option>
                                    <option value="Advanced">Nâng cao</option>
                                    <option value="Native">Bản ngữ</option>
                                </select>
                            </div>
                            <div className={cx('form-actions')}>
                                <button type="submit" className={cx('save-btn')} disabled={loading}>
                                    {loading ? 'Đang lưu...' : 'Lưu'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className={cx('language-content')}>
                            <div className={cx('proficiency-level')}>
                                Trình độ: {lang.proficiency}
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {showModal && (
                <div className={cx('modal-overlay')}>
                    <div className={cx('modal')}>
                        <div className={cx('modal-header')}>
                            <h3>Thêm ngôn ngữ</h3>
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
                                <label>Ngôn ngữ</label>
                                <input
                                    type="text"
                                    name="language"
                                    value={formData.language || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={cx('form-group')}>
                                <label>Trình độ</label>
                                <select
                                    name="proficiency"
                                    value={formData.proficiency || ''}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Chọn trình độ</option>
                                    <option value="Basic">Cơ bản</option>
                                    <option value="Intermediate">Trung cấp</option>
                                    <option value="Advanced">Nâng cao</option>
                                    <option value="Native">Bản ngữ</option>
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

export default LanguagesTab;
    
