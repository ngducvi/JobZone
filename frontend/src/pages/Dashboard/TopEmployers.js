import React, { useEffect, useState } from 'react'
import classNames from 'classnames/bind'
import styles from './TopEmployers.module.scss'
import { authAPI, userApis } from "~/utils/api";
import { Link, useNavigate } from 'react-router-dom'
const cx = classNames.bind(styles)


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
      try {
        setIsLoading(true);
        const response = await authAPI().get(userApis.getAllTopCompanyPro, {
          params: {
            page: activePage,
          },
        });
        setTopCompany(response.data.topCompany);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching top companies:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopCompany();
  }, [activePage]);

  const handleCompanyClick = (companyId) => {
    navigate(`/company-detail/${companyId}`);
  };

  return (
    <div className={cx('wrapper')}>
      <div className={cx('header')}>
        <h2>
          <i className="fa-solid fa-building"></i>
          Nhà tuyển dụng hàng đầu
        </h2>
      </div>

      <div className={cx('logo-container')}>
        {isLoading ? (
          <div className={cx('loading')}>Loading...</div>
        ) : (
          topCompany.map((employer, index) => (
            <div 
              key={`${employer.company_id}-${index}`} 
              className={cx('employer-logo')}
              title={employer.name}
              onClick={() => handleCompanyClick(employer.company_id)}
            >
              <img  
                src={employer.logo} 
                alt={employer.name}
                loading="lazy"
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TopEmployers 