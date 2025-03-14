import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./CareerHandbook.module.scss";
import { adminApis, authAPI } from "~/utils/api";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";
import { FaBook, FaPlus, FaPen, FaTrash, FaCalendarAlt, FaUserEdit, FaEye, FaTimes } from "react-icons/fa";
import { toast } from 'react-hot-toast';

const cx = classNames.bind(styles);

function CareerHandbook() {
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [careerHandbooks, setCareerHandbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedHandbook, setSelectedHandbook] = useState(null);
  const [newHandbook, setNewHandbook] = useState({
    title: '',
    content: '',
    created_by: 'admin',
    category_id: '1'
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingHandbook, setDeletingHandbook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHandbooks, setFilteredHandbooks] = useState([]);

  const categories = [
    { id: '1', name: 'Định hướng nghề nghiệp', description: 'Hướng dẫn xây dựng và phát triển sự nghiệp.' },
    { id: '2', name: 'Bí kíp tìm việc', description: 'Các mẹo và chiến lược để tìm kiếm việc làm hiệu quả.' },
    { id: '3', name: 'Chế độ lương thưởng', description: 'Thông tin về lương thưởng và phúc lợi.' },
    { id: '4', name: 'Kiến thức chuyên ngành', description: 'Cập nhật kiến thức trong các lĩnh vực chuyên môn.' },
    { id: '5', name: 'Hành trang nghề nghiệp', description: 'Chuẩn bị kỹ năng và thái độ cho môi trường làm việc.' },
    { id: '6', name: 'Thị trường và xu hướng tuyển dụng', description: 'Phân tích xu hướng tuyển dụng và thị trường lao động.' }
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await authAPI().get(adminApis.getAllCareerHandbooks, {
        params: { page: activePage },
      });
      setCareerHandbooks(result.data.careerHandbooks);
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
      setFilteredHandbooks(careerHandbooks);
      return;
    }

    const searchResults = careerHandbooks.filter(handbook => 
      handbook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      handbook.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredHandbooks(searchResults);
  }, [searchTerm, careerHandbooks]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setActivePage(newPage);
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  // Truncate text
  const truncateText = (text, length) => {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewHandbook(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authAPI().post(adminApis.createCareerHandbook, newHandbook);
      if (response.data.careerHandbook) {
        toast.success('Thêm bài viết thành công');
        setShowAddModal(false);
        fetchData();
        setNewHandbook({
          title: '',
          content: '',
          category_id: '1',
          created_by: 'admin'
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error('Có lỗi xảy ra khi thêm bài viết');
    }
  };

  const handleEdit = (handbook) => {
    setSelectedHandbook(handbook);
    setShowEditModal(true);
  };

  const handleDelete = (handbook) => {
    setDeletingHandbook(handbook);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await authAPI().delete(
        adminApis.deleteCareerHandbook(deletingHandbook.post_id)
      );
      if (response.data.success) {
        toast.success('Xóa bài viết thành công');
        setShowDeleteModal(false);
        setDeletingHandbook(null);
        fetchData();
      }
    } catch (error) {
      console.error("Error details:", error.response?.data || error.message);
      toast.error('Có lỗi xảy ra khi xóa bài viết');
    }
  };

  const EditModal = ({ handbook, onClose }) => {
    const [formData, setFormData] = useState({
      title: handbook.title,
      content: handbook.content,
      category_id: handbook.category_id
    });

    const handleEditInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleEditSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await authAPI().patch(
          adminApis.editCareerHandbook(handbook.post_id),
          {
            title: formData.title,
            content: formData.content,
            category_id: formData.category_id,
            last_modified_by: 'admin'
          }
        );
        if (response.data.careerHandbook) {
          toast.success('Cập nhật bài viết thành công');
          onClose();
          fetchData();
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error('Có lỗi xảy ra khi cập nhật bài viết');
      }
    };

    return (
      <div className={cx('modal-overlay')} onClick={onClose}>
        <div className={cx('modal-content')} onClick={e => e.stopPropagation()}>
          <h2>Chỉnh sửa bài viết</h2>
          <form onSubmit={handleEditSubmit}>
            <div className={cx('form-group')}>
              <label>Tiêu đề</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleEditInputChange}
                className={cx('form-input')}
                required
              />
            </div>
            <div className={cx('form-group')}>
              <label>Danh mục</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleEditInputChange}
                className={cx('form-select')}
                required
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={cx('form-group')}>
              <label>Nội dung</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleEditInputChange}
                className={cx('form-textarea')}
                rows="10"
                required
              />
            </div>
            <div className={cx('modal-actions')}>
              <button 
                type="button" 
                onClick={onClose}
                className={cx('cancel-btn')}
              >
                Hủy
              </button>
              <button type="submit" className={cx('save-btn')}>
                Cập nhật
              </button>
            </div>
          </form>
        </div>
      </div>
    );
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
            <FaBook className={cx('header-icon')} />
            Cẩm nang nghề nghiệp
          </h1>
          <p>Quản lý nội dung cẩm nang nghề nghiệp trên hệ thống</p>
        </div>
      </div>

      <div className={cx('main-content')}>
        <div className={cx('actions-bar')}>
          <div className={cx('search-filter')}>
            <div className={cx('search-box')}>
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                className={cx('search-input')}
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <button className={cx('clear-search')} onClick={() => setSearchTerm('')}>
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          <button className={cx('add-btn')} onClick={() => setShowAddModal(true)}>
            <FaPlus />
            <span className={cx('btn-text')}>Thêm bài viết</span>
          </button>
        </div>

        <div className={cx('table-responsive')}>
          <table className={cx('handbook-table')}>
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Nội dung</th>
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
              ) : filteredHandbooks.length === 0 ? (
                <tr>
                  <td colSpan="4" className={cx('no-results')}>
                    Không tìm thấy kết quả phù hợp
                  </td>
                </tr>
              ) : (
                filteredHandbooks.map((handbook) => (
                  <tr key={handbook.post_id}>
                    <td>
                      <div className={cx('post-title')}>
                        <FaBook className={cx('icon')} />
                        <span>{handbook.title}</span>
                      </div>
                    </td>
                    <td>
                      <div className={cx('post-content')}>
                        {truncateText(handbook.content, 150)}
                      </div>
                    </td>
                    <td>
                      <div className={cx('info')}>
                        <div className={cx('info-item')}>
                          <FaCalendarAlt className={cx('icon')} />
                          <span>Ngày đăng: {formatDate(handbook.created_at)}</span>
                        </div>
                        <div className={cx('info-item')}>
                          <FaUserEdit className={cx('icon')} />
                          <span>Tác giả: {handbook.created_by}</span>
                        </div>
                        <div className={cx('info-item', 'views')}>
                          <FaEye className={cx('icon')} />
                          <span>Lượt xem: {handbook.views || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={cx('actions')}>
                        <button 
                          className={cx('action-btn', 'edit')} 
                          onClick={() => handleEdit(handbook)}
                          title="Chỉnh sửa"
                        >
                          <FaPen />
                        </button>
                        <button className={cx('action-btn', 'delete')} title="Xóa" onClick={() => handleDelete(handbook)}>
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

        {/* Add Modal */}
        {showAddModal && (
          <div className={cx('modal-overlay')} onClick={() => setShowAddModal(false)}>
            <div className={cx('modal-content')} onClick={e => e.stopPropagation()}>
              <h2>Thêm bài viết mới</h2>
              <form onSubmit={handleSubmit}>
                <div className={cx('form-group')}>
                  <label>Tiêu đề</label>
                  <input
                    type="text"
                    name="title"
                    value={newHandbook.title}
                    onChange={handleInputChange}
                    className={cx('form-input')}
                    required
                  />
                </div>
                <div className={cx('form-group')}>
                  <label>Danh mục</label>
                  <select
                    name="category_id"
                    value={newHandbook.category_id}
                    onChange={handleInputChange}
                    className={cx('form-select')}
                    required
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={cx('form-group')}>
                  <label>Nội dung</label>
                  <textarea
                    name="content"
                    value={newHandbook.content}
                    onChange={handleInputChange}
                    className={cx('form-textarea')}
                    rows="10"
                    required
                  />
                </div>
                <div className={cx('modal-actions')}>
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className={cx('cancel-btn')}
                  >
                    Hủy
                  </button>
                  <button type="submit" className={cx('save-btn')}>
                    Thêm bài viết
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedHandbook && (
          <EditModal 
            handbook={selectedHandbook}
            onClose={() => {
              setShowEditModal(false);
              setSelectedHandbook(null);
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className={cx('modal-overlay')}>
            <div className={cx('modal-content')}>
              <h2>Xác nhận xóa</h2>
              <p>Bạn có chắc chắn muốn xóa bài viết "{deletingHandbook?.title}"?</p>
              <div className={cx('modal-actions')}>
                <button 
                  className={cx('cancel-btn')}
                  onClick={() => setShowDeleteModal(false)}
                >
                  Hủy
                </button>
                <button 
                  className={cx('save-btn')}
                  onClick={confirmDelete}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CareerHandbook;
