import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./Category.module.scss";
import { adminApis, authAPI } from "~/utils/api";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";
import { FaFolder, FaPlus, FaPen, FaTrash, FaCalendarAlt, FaUserEdit } from "react-icons/fa";
import { toast } from 'react-hot-toast';

const cx = classNames.bind(styles);

function Category() {
    const [activePage, setActivePage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [categoryData, setCategoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await authAPI().get(adminApis.getAllCategories, {
                params: { page: activePage },
            });
            setCategoryData(result.data.categories);
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

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setActivePage(newPage);
        }
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('vi-VN');
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
                        />
                    </div>
                    <button className={cx('add-btn')}>
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
                            ) : (
                                categoryData.map((category) => (
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
                                                <button className={cx('action-btn', 'edit')}>
                                                    <FaPen />
                                                </button>
                                                <button className={cx('action-btn', 'delete')}>
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
            </div>
        </div>
    );
}

export default Category;
