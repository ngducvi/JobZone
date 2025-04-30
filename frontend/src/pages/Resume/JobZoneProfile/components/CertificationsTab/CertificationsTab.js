import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './CertificationsTab.module.scss';
import { FaEdit, FaTimes, FaTrash } from "react-icons/fa";
import { toast } from 'react-hot-toast';
import { authAPI, userApis } from "~/utils/api";

const cx = classNames.bind(styles);

const CertificationsTab = ({ certifications, candidateProfile }) => {
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [certificationsList, setCertificationsList] = useState(certifications);

    useEffect(() => {
        setCertificationsList(certifications);
    }, [certifications]);

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

    const handleEdit = (cert) => {
        setEditingId(cert.id);
        setFormData({
            ...cert,
            issue_date: formatDate(cert.issue_date),
            expiry_date: formatDate(cert.expiry_date)
        });
    };

    const handleSubmit = async (e, certId) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await authAPI().put(
                userApis.editCandidateCertifications(certId),
                formData
            );

            if (response.data.code === 1) {
                setCertificationsList(prev => 
                    prev.map(cert => 
                        cert.id === certId ? response.data.candidateCertifications : cert
                    )
                );
                setEditingId(null);
                toast.success('Cập nhật thông tin chứng chỉ thành công');
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error('Có lỗi xảy ra khi cập nhật thông tin chứng chỉ');
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
                userApis.createCandidateCertificationsWithCandidateId(candidateProfile.candidate_id),
                {
                    ...formData,
                    candidate_id: candidateProfile.candidate_id
                }
            );

            if (response.data.code === 1) {
                setCertificationsList(prev => [...prev, response.data.candidateCertifications]);
                setShowModal(false);
                setFormData({});
                toast.success('Thêm thông tin chứng chỉ thành công');
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error('Có lỗi xảy ra khi thêm thông tin chứng chỉ');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (certId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thông tin chứng chỉ này?')) {
            try {
                setLoading(true);
                const response = await authAPI().delete(
                    userApis.deleteCandidateCertificationsById(certId)
                );

                if (response.data.code === 1) {
                    setCertificationsList(prev => prev.filter(cert => cert.id !== certId));
                    toast.success('Xóa thông tin chứng chỉ thành công');
                }
            } catch (error) {
                console.error("Error:", error);
                toast.error('Có lỗi xảy ra khi xóa thông tin chứng chỉ');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className={cx('form-section')}>
            <div className={cx('section-header')}>
                <h2>Chứng chỉ</h2>
                <button className={cx('add-btn')} onClick={() => setShowModal(true)}>
                    Thêm chứng chỉ
                </button>
            </div>

            {certificationsList?.map((cert) => (
                <div key={cert.id} className={cx('certification-item')}>
                    <div className={cx('item-header')}>
                        <h3>{cert.certification_name}</h3>
                        <div className={cx('action-buttons')}>
                            <button
                                className={cx('edit-btn', { cancel: editingId === cert.id })}
                                onClick={() => editingId === cert.id ? setEditingId(null) : handleEdit(cert)}
                            >
                                {editingId === cert.id ? <FaTimes /> : <FaEdit />}
                            </button>
                            <button
                                className={cx('delete-btn')}
                                onClick={() => handleDelete(cert.id)}
                                disabled={loading}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>

                    {editingId === cert.id ? (
                        <form onSubmit={(e) => handleSubmit(e, cert.id)}>
                            <div className={cx('form-group')}>
                                <label>Tên chứng chỉ</label>
                                <input
                                    type="text"
                                    name="certification_name"
                                    value={formData.certification_name || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={cx('form-group')}>
                                <label>Tổ chức cấp</label>
                                <input
                                    type="text"
                                    name="issuing_organization"
                                    value={formData.issuing_organization || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Ngày cấp</label>
                                    <input
                                        type="date"
                                        name="issue_date"
                                        value={formData.issue_date || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className={cx('form-group')}>
                                    <label>Ngày hết hạn</label>
                                    <input
                                        type="date"
                                        name="expiry_date"
                                        value={formData.expiry_date || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className={cx('form-group')}>
                                <label>Mã chứng chỉ</label>
                                <input
                                    type="text"
                                    name="credential_id"
                                    value={formData.credential_id || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className={cx('form-group')}>
                                <label>URL xác thực</label>
                                <input
                                    type="url"
                                    name="credential_url"
                                    value={formData.credential_url || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className={cx('form-actions')}>
                                <button type="submit" className={cx('save-btn')} disabled={loading}>
                                    {loading ? 'Đang lưu...' : 'Lưu'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className={cx('certification-content')}>
                            <div className={cx('organization')}>
                                {cert.issuing_organization}
                            </div>
                            <div className={cx('dates')}>
                                <span>Ngày cấp: {new Date(cert.issue_date).toLocaleDateString('vi-VN')}</span>
                                {cert.expiry_date && (
                                    <span>Ngày hết hạn: {new Date(cert.expiry_date).toLocaleDateString('vi-VN')}</span>
                                )}
                            </div>
                            {cert.credential_id && (
                                <div className={cx('credential-id')}>
                                    Mã chứng chỉ: {cert.credential_id}
                                </div>
                            )}
                            {cert.credential_url && (
                                <div className={cx('credential-url')}>
                                    <a href={cert.credential_url} target="_blank" rel="noopener noreferrer">
                                        Xem chứng chỉ
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}

            {showModal && (
                <div className={cx('modal-overlay')}>
                    <div className={cx('modal')}>
                        <div className={cx('modal-header')}>
                            <h3>Thêm chứng chỉ</h3>
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
                                <label>Tên chứng chỉ</label>
                                <input
                                    type="text"
                                    name="certification_name"
                                    value={formData.certification_name || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={cx('form-group')}>
                                <label>Tổ chức cấp</label>
                                <input
                                    type="text"
                                    name="issuing_organization"
                                    value={formData.issuing_organization || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Ngày cấp</label>
                                    <input
                                        type="date"
                                        name="issue_date"
                                        value={formData.issue_date || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className={cx('form-group')}>
                                    <label>Ngày hết hạn</label>
                                    <input
                                        type="date"
                                        name="expiry_date"
                                        value={formData.expiry_date || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className={cx('form-group')}>
                                <label>Mã chứng chỉ</label>
                                <input
                                    type="text"
                                    name="credential_id"
                                    value={formData.credential_id || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className={cx('form-group')}>
                                <label>URL xác thực</label>
                                <input
                                    type="url"
                                    name="credential_url"
                                    value={formData.credential_url || ''}
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

export default CertificationsTab; 