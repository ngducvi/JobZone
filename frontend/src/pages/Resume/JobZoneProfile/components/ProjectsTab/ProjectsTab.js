import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './ProjectsTab.module.scss';
import { FaEdit, FaTimes, FaTrash } from "react-icons/fa";
import { toast } from 'react-hot-toast';
import { authAPI, userApis } from "~/utils/api";

const cx = classNames.bind(styles);

const ProjectsTab = ({ projects, candidateProfile }) => {
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [projectsList, setProjectsList] = useState(projects);

    useEffect(() => {
        setProjectsList(projects);
    }, [projects]);

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

    const handleEdit = (project) => {
        setEditingId(project.id);
        setFormData({
            ...project,
            start_date: formatDate(project.start_date),
            end_date: formatDate(project.end_date)
        });
    };

    const handleSubmit = async (e, projectId) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await authAPI().put(
                userApis.editCandidateProjects(projectId),
                formData
            );

            if (response.data.code === 1) {
                setProjectsList(prev => 
                    prev.map(project => 
                        project.id === projectId ? response.data.candidateProjects : project
                    )
                );
                setEditingId(null);
                toast.success('Cập nhật thông tin dự án thành công');
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error('Có lỗi xảy ra khi cập nhật thông tin dự án');
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
                userApis.createCandidateProjectsWithCandidateId(candidateProfile.candidate_id),
                {
                    ...formData,
                    candidate_id: candidateProfile.candidate_id
                }
            );

            if (response.data.code === 1) {
                setProjectsList(prev => [...prev, response.data.candidateProjects]);
                setShowModal(false);
                setFormData({});
                toast.success('Thêm thông tin dự án thành công');
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error('Có lỗi xảy ra khi thêm thông tin dự án');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (projectId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thông tin dự án này?')) {
            try {
                setLoading(true);
                const response = await authAPI().delete(
                    userApis.deleteCandidateProjectsById(projectId)
                );

                if (response.data.code === 1) {
                    setProjectsList(prev => prev.filter(project => project.id !== projectId));
                    toast.success('Xóa thông tin dự án thành công');
                }
            } catch (error) {
                console.error("Error:", error);
                toast.error('Có lỗi xảy ra khi xóa thông tin dự án');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className={cx('form-section')}>
            <div className={cx('section-header')}>
                <h2>Dự án</h2>
                <button className={cx('add-btn')} onClick={() => setShowModal(true)}>
                    Thêm dự án
                </button>
            </div>

            {projectsList?.map((project) => (
                <div key={project.id} className={cx('project-item')}>
                    <div className={cx('item-header')}>
                        <h3>{project.project_name}</h3>
                        <div className={cx('action-buttons')}>
                            <button
                                className={cx('edit-btn', { cancel: editingId === project.id })}
                                onClick={() => editingId === project.id ? setEditingId(null) : handleEdit(project)}
                            >
                                {editingId === project.id ? <FaTimes /> : <FaEdit />}
                            </button>
                            <button
                                className={cx('delete-btn')}
                                onClick={() => handleDelete(project.id)}
                                disabled={loading}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>

                    {editingId === project.id ? (
                        <form onSubmit={(e) => handleSubmit(e, project.id)}>
                            <div className={cx('form-group')}>
                                <label>Tên dự án</label>
                                <input
                                    type="text"
                                    name="project_name"
                                    value={formData.project_name || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={cx('form-group')}>
                                <label>Vai trò</label>
                                <input
                                    type="text"
                                    name="role"
                                    value={formData.role || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Ngày bắt đầu</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className={cx('form-group')}>
                                    <label>Ngày kết thúc</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className={cx('form-group')}>
                                <label>Mô tả dự án</label>
                                <textarea
                                    name="description"
                                    value={formData.description || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={cx('form-group')}>
                                <label>Công nghệ sử dụng</label>
                                <input
                                    type="text"
                                    name="technologies_used"
                                    value={formData.technologies_used || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={cx('form-group')}>
                                <label>URL dự án</label>
                                <input
                                    type="url"
                                    name="project_url"
                                    value={formData.project_url || ''}
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
                        <div className={cx('project-content')}>
                            <div className={cx('role')}>{project.role}</div>
                            <div className={cx('dates')}>
                                <span>Từ: {new Date(project.start_date).toLocaleDateString('vi-VN')}</span>
                                {project.end_date && (
                                    <span>Đến: {new Date(project.end_date).toLocaleDateString('vi-VN')}</span>
                                )}
                            </div>
                            <div className={cx('description')}>{project.description}</div>
                            <div className={cx('technologies')}>
                                <strong>Công nghệ:</strong> {project.technologies_used}
                            </div>
                            {project.project_url && (
                                <div className={cx('project-url')}>
                                    <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                                        Xem dự án
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
                            <h3>Thêm dự án</h3>
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
                                <label>Tên dự án</label>
                                <input
                                    type="text"
                                    name="project_name"
                                    value={formData.project_name || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={cx('form-group')}>
                                <label>Vai trò</label>
                                <input
                                    type="text"
                                    name="role"
                                    value={formData.role || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={cx('form-row')}>
                                <div className={cx('form-group')}>
                                    <label>Ngày bắt đầu</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className={cx('form-group')}>
                                    <label>Ngày kết thúc</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className={cx('form-group')}>
                                <label>Mô tả dự án</label>
                                <textarea
                                    name="description"
                                    value={formData.description || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={cx('form-group')}>
                                <label>Công nghệ sử dụng</label>
                                <input
                                    type="text"
                                    name="technologies_used"
                                    value={formData.technologies_used || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={cx('form-group')}>
                                <label>URL dự án</label>
                                <input
                                    type="url"
                                    name="project_url"
                                    value={formData.project_url || ''}
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

export default ProjectsTab; 