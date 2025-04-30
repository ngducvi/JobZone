// CvLibrary
import React, { useState } from 'react';
import styles from './CvLibrary.module.scss';
import classNames from 'classnames/bind';
import { FaCode, FaBug,  FaUserTie, FaCalculator, FaCheckCircle, 
         FaStar, FaCogs, FaBriefcase, FaGraduationCap, FaMedkit, FaDollarSign } from 'react-icons/fa';

const cx = classNames.bind(styles);

function CvLibrary() {
    const [activeLanguage, setActiveLanguage] = useState('vi');
    
    const cvTemplates = [
        {
            id: 1,
            title: 'Kỹ sư phần mềm',
            category: 'Công nghệ thông tin',
            level: 'Senior',
            icon: <FaCode />,
        },
        {
            id: 2,
            title: 'Trưởng nhóm Tester',
            category: 'IT, Phần mềm',
            level: 'Mid level',
            icon: <FaBug />,
        },
        {
            id: 3,
            title: 'Chuyên viên Marketing',
            category: 'Marketing, Truyền thông, Quảng cáo',
            level: 'Senior',
            icon: <FaUserTie />,
        },
        {
            id: 4,
            title: 'Nhân viên Hành chính nhân sự',
            category: 'Nhân sự',
            level: 'Junior',
            icon: <FaUserTie />,
        },
        {
            id: 5,
            title: 'Nhân viên Kế toán',
            category: 'Kế toán kiểm toán',
            level: 'Senior',
            icon: <FaCalculator />,
        },
        {
            id: 6,
            title: 'Kế toán trưởng',
            category: 'Kế toán Kiểm toán',
            level: 'Mid level',
            icon: <FaCalculator />,
        },
        {
            id: 7,
            title: 'Nhân viên Kiểm soát chất lượng',
            category: 'Quản lý chất lượng',
            level: 'Junior',
            icon: <FaCheckCircle />,
        },
        {
            id: 8,
            title: 'Kỹ sư cơ khí chế tạo máy',
            category: 'Cơ khí/Chế tạo/Tự động hóa',
            level: 'Junior',
            icon: <FaCogs />,
        },
        {
            id: 9,
            title: 'Nhân viên Lễ tân Hành chính',
            category: 'Hành chính văn phòng',
            level: 'Junior',
            icon: <FaBriefcase />,
        },
        {
            id: 10,
            title: 'Quản lý Phòng Hành chính',
            category: 'Hành chính văn phòng',
            level: 'Mid level',
            icon: <FaBriefcase />,
        },
        {
            id: 11,
            title: 'Trình Dược Viên',
            category: 'Y tế Dược',
            level: 'Junior',
            icon: <FaMedkit />,
        },
        {
            id: 12,
            title: 'Chuyên viên đào tạo nội bộ',
            category: 'Giáo dục, Đào tạo',
            level: 'Junior',
            icon: <FaGraduationCap />,
        },
        {
            id: 13,
            title: 'Trưởng nhóm Đào tạo',
            category: 'Giáo dục, Đào tạo',
            level: 'Mid level',
            icon: <FaGraduationCap />,
        },
        {
            id: 14,
            title: 'Nhân viên bán hàng',
            category: 'Kinh doanh bán hàng',
            level: 'Junior',
            icon: <FaDollarSign />,
        },
        {
            id: 15,
            title: 'Giám đốc kinh doanh',
            category: 'Kinh doanh bán hàng',
            level: 'Mid level',
            icon: <FaDollarSign />,
        },
    ];

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')}>
                <h1 className={cx('title')}>Thư viện CV theo ngành nghề</h1>
                
                <div className={cx('language-selector')}>
                    <button 
                        className={cx('lang-btn', { active: activeLanguage === 'vi' })}
                        onClick={() => setActiveLanguage('vi')}
                    >
                        Tiếng Việt
                    </button>
                    <button 
                        className={cx('lang-btn', { active: activeLanguage === 'en' })}
                        onClick={() => setActiveLanguage('en')}
                    >
                        Tiếng Anh
                    </button>
                    <button 
                        className={cx('lang-btn', { active: activeLanguage === 'jp' })}
                        onClick={() => setActiveLanguage('jp')}
                    >
                        Tiếng Nhật
                    </button>
                </div>

                <div className={cx('templates-grid')}>
                    {cvTemplates.map(template => (
                        <div key={template.id} className={cx('template-card')}>
                            <div className={cx('level-badge', template.level.toLowerCase().replace(' ', '-'))}>
                                {template.level === 'Mid level' && <FaStar />}
                                {template.level}
                            </div>
                            <div className={cx('template-icon')}>
                                {template.icon}
                            </div>
                            <h3 className={cx('template-title')}>{template.title}</h3>
                            <p className={cx('template-category')}>{template.category}</p>
                            <button className={cx('view-btn')}>Xem chi tiết</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CvLibrary;