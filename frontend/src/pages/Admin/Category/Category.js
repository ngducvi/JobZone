import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./Category.module.scss";
import { adminApis, authAPI } from "~/utils/api";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";
import { FaFolder, FaPlus, FaPen, FaTrash, FaCalendarAlt, FaUserEdit, FaTimes } from "react-icons/fa";
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

function Category() {
    const [activePage, setActivePage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [categoryData, setCategoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newCategory, setNewCategory] = useState({
        category_name: '',
        description: '',
        created_by: 'admin',
        last_modified_by: 'admin'
    });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState({
        category_id: '',
        category_name: '',
        description: '',
        last_modified_by: 'admin'
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingCategory, setDeletingCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCategories, setFilteredCategories] = useState([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await authAPI().get(adminApis.getAllCategories, {
                params: { page: activePage },
            });
            setCategoryData(result.data.categories);
            console.log(result.data.categories);
            setTotalPages(result.data.totalPages);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activePage]);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredCategories(categoryData);
            return;
        }

        const searchResults = categoryData.filter(category => 
            category.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        setFilteredCategories(searchResults);
    }, [searchTerm, categoryData]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setActivePage(newPage);
        }
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('vi-VN');
    };

    // Thêm hàm xử lý form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCategory(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await authAPI().post(adminApis.createCategory, newCategory);
            if (response.data.category) {
                toast.success('🎉 Thêm danh mục thành công!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                setShowModal(false);
                fetchData();
                setNewCategory({
                    category_name: '',
                    description: '',
                    created_by: 'admin',
                    last_modified_by: 'admin'
                });
            }
        } catch (error) {
            toast.error('❌ Có lỗi xảy ra khi thêm danh mục!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            console.error("Error:", error);
        }
    };

    // Thêm hàm xử lý edit
    const handleEdit = (category) => {
        setEditingCategory({
            category_id: category.category_id,
            category_name: category.category_name,
            description: category.description,
            last_modified_by: 'admin'
        });
        setShowEditModal(true);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingCategory(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await authAPI().patch(
                adminApis.editCategory(editingCategory.category_id),
                editingCategory
            );
            if (response.data.category) {
                toast.success('✏️ Cập nhật danh mục thành công!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                setShowEditModal(false);
                fetchData();
            }
        } catch (error) {
            toast.error('❌ Có lỗi xảy ra khi cập nhật danh mục!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            console.error("Error details:", error.response?.data || error.message);
        }
    };

    // Hàm xử lý xóa
    const handleDelete = (category) => {
        setDeletingCategory(category);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await authAPI().delete(
                adminApis.deleteCategory(deletingCategory.category_id)
            );
            if (response.data.success) {
                toast.success('🗑️ Xóa danh mục thành công!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                setShowDeleteModal(false);
                fetchData();
                setDeletingCategory(null);
            }
        } catch (error) {
            toast.error('❌ Có lỗi xảy ra khi xóa danh mục!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            console.error("Error:", error);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setActivePage(1);
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <div className={cx('header-content')}>
                    <h1>
                        <FaFolder className={cx('header-icon')} />
                        Quản lý danh mục
                    </h1>
                    <p>Quản lý các danh mục ngành nghề trên hệ thống</p>
                </div>
            </div>

            <div className={cx('main-content')}>
                <div className={cx('actions-bar')}>
                    <div className={cx('search-box')}>
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm danh mục..." 
                            className={cx('search-input')}
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        {searchTerm && (
                            <button 
                                className={cx('clear-search')}
                                onClick={() => setSearchTerm('')}
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                    <button 
                        className={cx('add-btn')}
                        onClick={() => setShowModal(true)}
                    >
                        <FaPlus /> Thêm danh mục
                    </button>
                </div>

                <div className={cx('table-wrapper')}>
                    <table className={cx('category-table')}>
                        <thead>
                            <tr>
                                <th>Tên danh mục</th>
                                <th>Mô tả</th>
                                <th>Thông tin</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className={cx('loading')}>
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className={cx('no-results')}>
                                        Không tìm thấy kết quả phù hợp
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((category) => (
                                    <tr key={category.category_id}>
                                        <td>
                                            <div className={cx('category-name')}>
                                                <FaFolder className={cx('icon')} />
                                                <span>{category.category_name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={cx('description')}>
                                                {category.description}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={cx('info')}>
                                                <div className={cx('info-item')}>
                                                    <FaCalendarAlt className={cx('icon')} />
                                                    <span>Ngày tạo: {formatDate(category.created_at)}</span>
                                                </div>
                                                <div className={cx('info-item')}>
                                                    <FaUserEdit className={cx('icon')} />
                                                    <span>Cập nhật: {category.last_modified_by}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={cx('actions')}>
                                                <button 
                                                    className={cx('action-btn', 'edit')}
                                                    onClick={() => handleEdit(category)}
                                                >
                                                    <FaPen />
                                                </button>
                                                <button 
                                                    className={cx('action-btn', 'delete')}
                                                    onClick={() => handleDelete(category)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className={cx('pagination')}>
                    <button
                        className={cx('page-btn')}
                        onClick={() => handlePageChange(activePage - 1)}
                        disabled={activePage === 1}
                    >
                        <PrevPageIcon />
                    </button>
                    <span className={cx('page-info')}>
                        Trang {activePage} / {totalPages}
                    </span>
                    <button
                        className={cx('page-btn')}
                        onClick={() => handlePageChange(activePage + 1)}
                        disabled={activePage === totalPages}
                    >
                        <NextPageIcon />
                    </button>
                </div>

                {/* Edit Modal */}
                {showEditModal && (
                    <div className={cx('modal-overlay')}>
                        <div className={cx('modal')}>
                            <div className={cx('modal-header')}>
                                <h2>Chỉnh sửa danh mục</h2>
                                <button 
                                    className={cx('close-btn')}
                                    onClick={() => setShowEditModal(false)}
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            <form onSubmit={handleEditSubmit} className={cx('modal-form')}>
                                <div className={cx('form-group')}>
                                    <label>Tên danh mục</label>
                                    <input
                                        type="text"
                                        name="category_name"
                                        value={editingCategory.category_name}
                                        onChange={handleEditInputChange}
                                        required
                                    />
                                </div>
                                <div className={cx('form-group')}>
                                    <label>Mô tả</label>
                                    <textarea
                                        name="description"
                                        value={editingCategory.description}
                                        onChange={handleEditInputChange}
                                        required
                                    />
                                </div>
                                <div className={cx('modal-actions')}>
                                    <button 
                                        type="button" 
                                        className={cx('cancel-btn')}
                                        onClick={() => setShowEditModal(false)}
                                    >
                                        Hủy
                                    </button>
                                    <button 
                                        type="submit" 
                                        className={cx('submit-btn')}
                                    >
                                        Cập nhật
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className={cx('modal-overlay')}>
                        <div className={cx('modal')}>
                            <div className={cx('modal-header')}>
                                <h2>Thêm danh mục mới</h2>
                                <button 
                                    className={cx('close-btn')}
                                    onClick={() => setShowModal(false)}
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className={cx('modal-form')}>
                                <div className={cx('form-group')}>
                                    <label>Tên danh mục</label>
                                    <input
                                        type="text"
                                        name="category_name"
                                        value={newCategory.category_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className={cx('form-group')}>
                                    <label>Mô tả</label>
                                    <textarea
                                        name="description"
                                        value={newCategory.description}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className={cx('modal-actions')}>
                                    <button 
                                        type="button" 
                                        className={cx('cancel-btn')}
                                        onClick={() => setShowModal(false)}
                                    >
                                        Hủy
                                    </button>
                                    <button 
                                        type="submit" 
                                        className={cx('submit-btn')}
                                    >
                                        Thêm danh mục
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className={cx('modal-overlay')}>
                        <div className={cx('modal')}>
                            <div className={cx('modal-header')}>
                                <h2>Xác nhận xóa</h2>
                                <button 
                                    className={cx('close-btn')}
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            <div className={cx('modal-content')}>
                                <p>Bạn có chắc chắn muốn xóa danh mục "{deletingCategory?.category_name}"?</p>
                                <div className={cx('modal-actions')}>
                                    <button 
                                        className={cx('cancel-btn')}
                                        onClick={() => setShowDeleteModal(false)}
                                    >
                                        Hủy
                                    </button>
                                    <button 
                                        className={cx('submit-btn', 'delete')}
                                        onClick={confirmDelete}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Category;
