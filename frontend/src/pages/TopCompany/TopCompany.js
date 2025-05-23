// TopCompany
import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";
import styles from "./TopCompany.module.scss";
import { authAPI, userApis } from "~/utils/api";
import images from "~/assets/images";
import { useNavigate } from "react-router-dom";
import { FaStar, FaCrown, FaGem } from "react-icons/fa";
const cx = classNames.bind(styles);

const TopCompany = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [topCompany, setTopCompany] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  useEffect(() => {
    const fetchTopCompany = async () => {
      const response = await authAPI().get(userApis.getAllTopCompany, {
        params: {
          page: activePage,
        },
      });
      setTopCompany(response.data.topCompany);
      setTotalPages(response.data.totalPages);
    };
    fetchTopCompany();
  }, [activePage]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const response = await authAPI().get(userApis.searchCompanies, {
        params: {
          company_name: searchTerm,
        },
      });
      setSearchResults(response.data.companies || []);
    } catch (error) {
      console.error("Error searching companies:", error);
      setSearchResults([]);
    }
  };

  const handleCompanyClick = (companyId) => {
    navigate(`/company-detail/${companyId}`);
  };

  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getPlanIcon = (plan) => {
    switch (plan) {
      case "ProMax":
        return <FaCrown className={cx("plan-icon", "promax")} />;
      case "Pro":
        return <FaGem className={cx("plan-icon", "pro")} />;
      default:
        return <FaStar className={cx("plan-icon", "basic")} />;
    }
  };

  const getPlanLabel = (plan) => {
    switch (plan) {
      case "ProMax":
        return "Pro Max";
      case "Pro":
        return "Pro";
      default:
        return "Basic";
    }
  };

  const renderReviewStats = (company) => {
    const averageRating = getAverageRating(company.reviews);
    return (
      <div className={cx('review-stats')}>
        <div className={cx('review-count')}>
          <FaStar className={cx('icon')} />
          <span>{averageRating}/5</span>
          <span className={cx('review-total')}>
            ({company.reviews?.length || 0} đánh giá)
          </span>
        </div>
      </div>
    );
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setIsSearching(false);
  };

  const renderCompanyList = (companies) => {
    return companies.map((company, index) => (
      <div 
        key={company._company_id || company.company_id || index} 
        className={cx("company-card")} 
        onClick={() => handleCompanyClick(company.company_id)}
      >
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
        {/* Plan badge */}
        <div className={cx("plan-badge", company.plan && company.plan.toLowerCase())}>
          {getPlanIcon(company.plan)}
          <span>{getPlanLabel(company.plan)}</span>
        </div>
        <h3>{company.company_name}</h3>
        {renderReviewStats(company)}
        <p>
          {company.description ||
            "Thành lập vào năm 2024, hướng tới mục tiêu trở thành một trong những công ty Internet hàng đầu Việt Nam, với hai dự án Solaso và GoJob.Solaso với sứ mệnh mang lại trải nghiệm mua sắm trực tuyến tiện lợi và tin cậy, cam kết cung cấp Sản phẩm hàng đầu, dịch vụ tốt nhất cho khách hàng, đồng thời không ngừng kết nối và phát triển nhằm..."}
        </p>
      </div>
    ));
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
          <form onSubmit={handleSearch} className={cx("search-box")}>
            <input
              type="text"
              placeholder="Nhập tên công ty"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">Tìm kiếm</button>
            {isSearching && (
              <button type="button" onClick={clearSearch} className={cx("clear-search")}>
                Xóa tìm kiếm
              </button>
            )}
          </form>
        </div>
        <div className={cx("search-image")}>
          {/* Add your illustration image here */}
        </div>
      </div>

      {activeTab === "list" ? (
        <div className={cx("company-list")}>
          <h2>{isSearching ? "KẾT QUẢ TÌM KIẾM" : "DANH SÁCH CÁC CÔNG TY NỔI BẬT"}</h2>
          <div className={cx("company-list-content")}>
            {isSearching ? renderCompanyList(searchResults) : renderCompanyList(topCompany)}
          </div>
        </div>
      ) : (
        <div className={cx("company-list")}>
          <h2>TOP CÔNG TY PRO MAX</h2>
          <div className={cx("company-list-content")}>
            {renderCompanyList(topCompany.filter(c => c.plan === "ProMax"))}
          </div>
        </div>
      )}

      {/* Pagination - Only show when not searching */}
      {!isSearching && (
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
      )}
    </div>
  );
};

export default TopCompany;
