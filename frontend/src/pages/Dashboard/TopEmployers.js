import React, { useEffect, useState } from 'react'
import classNames from 'classnames/bind'
import styles from './TopEmployers.module.scss'
import { authAPI, userApis } from "~/utils/api";
import { Link, useNavigate } from 'react-router-dom'
const cx = classNames.bind(styles)
const EMPLOYERS = [
  {
    id: 1,
    name: "WealthPost",
    logo: "/images/employers/wealthpost.png"
  },
  {
    id: 2,
    name: "Vega Holidays",
    logo: "/images/employers/vega.png"
  },
  {
    id: 3,
    name: "FPT",
    logo: "/images/employers/fpt.png"
  },
  {
    id: 4,
    name: "Apollo English",
    logo: "/images/employers/apollo.png"
  },
  {
    id: 5,
    name: "AmTran",
    logo: "/images/employers/amtran.png"
  },
  {
    id: 6,
    name: "LG",
    logo: "/images/employers/lg.png"
  },
  {
    id: 7,
    name: "Bosch",
    logo: "/images/employers/bosch.png"
  },
  {
    id: 8,
    name: "Tehy",
    logo: "/images/employers/tehy.png"
  },
  {
    id: 9,
    name: "Misa",
    logo: "/images/employers/misa.png"
  },
  {
    id: 10,
    name: "CMS Loyalty",
    logo: "/images/employers/cms.png"
  }
]

const TopEmployers = () => {
  const [companyDetail, setCompanyDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [topCompany, setTopCompany] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const handleEmployerClick = (employerId) => {
    navigate(`/top-company-detail/${employerId}`);
  };
  
  useEffect(() => {
    const fetchTopCompany = async () => {
      const response = await authAPI().get(userApis.getAllTopCompany, {
        params: {
          page: activePage,
        },
      });
      setTopCompany(response.data.topCompany);
      console.log("response.data.topCompany",response.data.topCompany);
      setTotalPages(response.data.totalPages);
    };
    fetchTopCompany();
  }, [activePage]);

  
  return (
    <div className={cx('wrapper')}>
      <div className={cx('header')}>
        <h2>
          <i className="fa-solid fa-building"></i>
          Nhà tuyển dụng hàng đầu
        </h2>
      </div>

      <div className={cx('logo-container')}>
        {/* Duplicate logos to fill the space */}
        {topCompany.map((employer, index) => (
          <div 
            key={`${employer.id}-${index}`} 
            className={cx('employer-logo')}
            title={employer.name}
            onClick={() => handleEmployerClick(employer.id)}
          >
            <img  
              src={employer.logo} 
              alt={employer.name}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default TopEmployers 