import React from 'react'
import classNames from 'classnames/bind'
import { Link } from 'react-router-dom'
import styles from './TopCareer.module.scss'

const cx = classNames.bind(styles)

const TOP_CAREERS = [
  {
    id: 1,
    title: "Kinh doanh - Bán hàng",
    count: "7,265 việc làm",
    icon: "fa-solid fa-tag",
    color: "#00B074",
    to: "/jobs/sales"
  },
  {
    id: 2,
    title: "Marketing - PR - Quảng cáo",
    count: "4,471 việc làm",
    icon: "fa-solid fa-bullhorn",
    color: "#2F62E9",
    to: "/jobs/marketing"
  },
  {
    id: 3,
    title: "Chăm sóc khách hàng",
    count: "1,609 việc làm",
    icon: "fa-solid fa-headset",
    color: "#8E59FF",
    to: "/jobs/customer-service"
  },
  {
    id: 4,
    title: "Nhân sự - Hành chính - Pháp chế",
    count: "2,607 việc làm",
    icon: "fa-solid fa-briefcase",
    color: "#FF6B6B",
    to: "/jobs/hr"
  },
  {
    id: 5,
    title: "Tài chính - Ngân hàng - Bảo hiểm",
    count: "822 việc làm",
    icon: "fa-solid fa-landmark",
    color: "#FFA800",
    to: "/jobs/finance"
  },
  {
    id: 6,
    title: "Công nghệ Thông tin",
    count: "3,268 việc làm",
    icon: "fa-solid fa-laptop-code",
    color: "#00B8D9",
    to: "/jobs/it"
  },
  {
    id: 7,
    title: "Bất động sản - Xây dựng",
    count: "1,129 việc làm",
    icon: "fa-solid fa-building",
    color: "#36B37E",
    to: "/jobs/real-estate"
  },
  {
    id: 8,
    title: "Kế toán - Kiểm toán - Thuế",
    count: "2,476 việc làm",
    icon: "fa-solid fa-calculator",
    color: "#FF5630",
    to: "/jobs/accounting"
  }
]

const TopCareer = () => {
  return (
    <div className={cx('wrapper')}>
      <div className={cx('header')}>
        <h2>
          <i className="fa-solid fa-briefcase"></i>
          Top ngành nghề nổi bật
        </h2>
        <div className={cx('nav-buttons')}>
          <button className={cx('nav-btn', 'prev')}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button className={cx('nav-btn', 'next')}>
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div className={cx('career-grid')}>
        {TOP_CAREERS.map((career) => (
          <Link to={career.to} key={career.id} className={cx('career-card')}>
            <div 
              className={cx('icon-wrapper')} 
              style={{backgroundColor: `${career.color}15`}}
            >
              <i 
                className={career.icon}
                style={{color: career.color}}  
              ></i>
            </div>
            <div className={cx('content')}>
              <h3 className={cx('title')}>{career.title}</h3>
              <span className={cx('count')}>{career.count}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default TopCareer 