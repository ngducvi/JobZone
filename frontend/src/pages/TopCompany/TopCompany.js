// TopCompany
import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";
import styles from "./TopCompany.module.scss";
import { authAPI, userApis } from "~/utils/api";
import images from "~/assets/images";
import { useNavigate } from "react-router-dom";
const cx = classNames.bind(styles);

const TopCompany = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [topCompany, setTopCompany] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("list"); // 'list' or 'top'

  useEffect(() => {
    const fetchTopCompany = async () => {
      const response = await authAPI().get(userApis.getAllTopCompany, {
        params: {
          page: activePage,
        },
      });
      setTopCompany(response.data.topCompany);
      console.log(response.data.topCompany);
      setTotalPages(response.data.totalPages);
    };
    fetchTopCompany();
  }, [activePage]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search logic here
  };



  const handleCompanyClick = (companyId) => {
    navigate(`/company-detail/${companyId}`);
  };

  return (
    <div className={cx("wrapper")}>
      {/* Tabs */}
      <div className={cx("tabs")}>
        <button
          className={cx("tab", { active: activeTab === "list" })}
          onClick={() => setActiveTab("list")}
        >
          Danh sách công ty
        </button>
        <button
          className={cx("tab", { active: activeTab === "top" })}
          onClick={() => setActiveTab("top")}
        >
          Top công ty
        </button>
      </div>

      {/* Search Section */}
      <div className={cx("search-section")}>
        <div className={cx("search-content")}>
          <h1>Khám phá 100.000+ công ty nổi bật</h1>
          <p>
            Tra cứu thông tin công ty và tìm kiếm nơi làm việc tốt nhất dành cho
            bạn
          </p>
          <div className={cx("search-box")}>
            <input
              type="text"
              placeholder="Nhập tên công ty"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={handleSearch}>Tìm kiếm</button>
          </div>
        </div>
        <div className={cx("search-image")}>
          {/* Add your illustration image here */}
        </div>
      </div>

      {activeTab === "list" ? (
        <div className={cx("company-list")}>
          <h2>DANH SÁCH CÁC CÔNG TY NỔI BẬT</h2>
          <div className={cx("company-list-content")}>
            {topCompany.map((company, index) => (
              <div key={company._company_id|| company.company_id || index} className={cx("company-card")} onClick={() => handleCompanyClick(company.company_id)}>
                <div className={cx("company-logo")}>
                  <img
                    src={company.banner || images.banner}
                    alt={company.company_name}
                  />
                  <img
                    src={company.logo || images.company_1}
                    alt={company.company_name}
                  />
                </div>
                <h3>{company.company_name}</h3>
                <p>
                  {company.description ||
                    "Thành lập vào năm 2024, hướng tới mục tiêu trở thành một trong những công ty Internet hàng đầu Việt Nam, với hai dự án Solaso và GoJob.Solaso với sứ mệnh mang lại trải nghiệm mua sắm trực tuyến tiện lợi và tin cậy, cam kết cung cấp Sản phẩm hàng đầu, dịch vụ tốt nhất cho khách hàng, đồng thời không ngừng kết nối và phát triển nhằm..."}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={cx("categories-section")}>
          <h2>DANH SÁCH CÁC TOP CÔNG TY</h2>
          <div className={cx("categories-grid")}>
            {topCompany.map((company, index) => (
              <div key={company._id || company.id || index} className={cx("category-card")}>
                <img src={company.banner || images.banner} alt={company.company_name} />
                <h3>{company.company_name}</h3>
                <p>{company.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className={cx("pagination")}>
        <button
          className={cx("page-btn")}
          onClick={() => setActivePage((prev) => Math.max(prev - 1, 1))}
          disabled={activePage === 1}
        >
          <PrevPageIcon />
        </button>
        <span>{activePage}</span>
        <button
          className={cx("page-btn")}
          onClick={() =>
            setActivePage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={activePage === totalPages}
        >
          <NextPageIcon />
        </button>
      </div>
    </div>
  );
};

export default TopCompany;
