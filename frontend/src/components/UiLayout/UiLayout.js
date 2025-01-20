import styles from "./UiLayout.module.scss";
import { Sparkles } from "./sparkles";
import images from "~/assets/images";
import React, { useEffect, useState, useContext, useRef } from "react";
import classNames from "classnames/bind";
import Card from "~/pages/Dashboard/Card.js";
import userServices from "~/services/userServices.js";
import Button from "~/components/Button";
import { Link, useNavigate } from "react-router-dom";
import UserContext from "~/context/UserContext";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";
// import LogoUi from "./LogoUi";
const cx = classNames.bind(styles);

const features = [
  {
    title: "Web Job Zone",
    description:
      "Web Job Zone is a platform that helps you find the best jobs and careers.",
  },
];

const UiLayout = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("month");
  const [countConversations, setCountConversations] = useState(0);
  const [recentConversations, setRecentConversations] = useState([]);
  const [balance, setBalance] = useState();
  const { user } = useContext(UserContext);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedProvinces, setSelectedProvinces] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationRef = useRef(null);

  const token = localStorage.getItem("token");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch("https://esgoo.net/api-tinhthanh/1/0.htm");
        const data = await response.json();
        if (Array.isArray(data.data)) {
          setProvinces(data.data);
        } else {
          setProvinces([]);
        }
      } catch (error) {
        setProvinces([]);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const districtsData = await Promise.all(
          selectedProvinces.map(async (provinceId) => {
            const formattedId = provinceId.toString().padStart(2, "0");
            const response = await fetch(
              `https://esgoo.net/api-tinhthanh/2/${formattedId}.htm`
            );
            const data = await response.json();
            if (Array.isArray(data.data)) {
              return data.data.map((district) => ({
                ...district,
                provinceId: provinceId,
              }));
            }
            return [];
          })
        );
        setDistricts(districtsData.flat());
      } catch (error) {
        console.error("Error fetching districts:", error);
        setDistricts([]);
      }
    };

    if (selectedProvinces.length > 0) {
      fetchDistricts();
    } else {
      setDistricts([]);
    }
  }, [selectedProvinces]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProvinceSelect = (provinceId) => {
    setSelectedProvinces((prev) => {
      const isSelected = prev.includes(provinceId);
      if (isSelected) {
        return prev.filter((id) => id !== provinceId);
      } else {
        return [...prev, provinceId];
      }
    });
  };

  const handleDistrictSelect = (districtId) => {
    setSelectedDistricts((prev) => {
      const isSelected = prev.includes(districtId);
      if (isSelected) {
        return prev.filter((id) => id !== districtId);
      } else {
        return [...prev, districtId];
      }
    });
  };

  const handleSelectAllDistricts = (provinceId) => {
    const provinceDistricts = districts
      .filter((d) => d.provinceId === provinceId)
      .map((d) => d.id);
    setSelectedDistricts((prev) => {
      const allSelected = provinceDistricts.every((id) => prev.includes(id));
      if (allSelected) {
        return prev.filter((id) => !provinceDistricts.includes(id));
      } else {
        return [...new Set([...prev, ...provinceDistricts])];
      }
    });
  };

  const getLocationDisplay = () => {
    if (selectedProvinces.length === 0) return "Địa điểm";
    const provinceNames = selectedProvinces
      .map((id) => provinces.find((p) => p.id === id)?.name)
      .filter(Boolean);
    return provinceNames.join(", ");
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const [conversationsResponse, balanceResponse, recentConversation] =
  //         await Promise.all([
  //           userServices.getCountConversations(),
  //           userServices.getBalance(),
  //           userServices.getRecentConversations(currentPage),
  //         ]);
  //       setCountConversations(conversationsResponse.count);
  //       setBalance(balanceResponse);
  //       setRecentConversations(recentConversation.conversations);
  //       setTotalPages(recentConversation.totalPages);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };

  //   if (token) {
  //     fetchData();
  //   }
  // }, [token, currentPage]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const renderDistrictsByProvince = (provinceId) => {
    const province = provinces.find((p) => p.id === provinceId);
    const provinceDistricts = districts.filter(
      (d) => d.provinceId === provinceId
    );

    if (!provinceDistricts.length) return null;

    return (
      <div key={provinceId} className={cx("district-group")}>
        <label className={cx("checkbox-item", "province-header")}>
          <input
            type="checkbox"
            checked={provinceDistricts.every((d) =>
              selectedDistricts.includes(d.id)
            )}
            onChange={() => handleSelectAllDistricts(provinceId)}
          />
          <span>{province?.name}</span>
        </label>
        <div className={cx("district-items")}>
          {provinceDistricts.map((district) => (
            <label key={district.id} className={cx("checkbox-item")}>
              <input
                type="checkbox"
                checked={selectedDistricts.includes(district.id)}
                onChange={() => handleDistrictSelect(district.id)}
              />
              <span>{district.name}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div className={cx("wrapper")}>
      <div className={cx("grid-overlay")} />

      <div className={cx("header-section")}>
        <div className={cx("logo-container")}>
          <img src={images.logo} alt="UI Layout Logo" />
        </div>
      </div>

      <div className={cx("hero-section")}>
        <div className={cx("hero-grid")} />
        <Sparkles
          density={1900}
          direction="bottom"
          color="#ffffff"
          size={1}
          speed={0.5}
          className="absolute inset-0 h-full w-full"
        />
      </div>

      <p className={cx("description")}>
        Tìm việc làm nhanh 24h, việc làm mới nhất trên toàn quốc.
      </p>

      <div className={cx("content-grid")}>
        <div className={cx("search-form")}>
          <div className={cx("search-group")}>
            <i className="fa-solid fa-list"></i>
            <select className={cx("category-select")}>
              <option value="">Danh mục Nghề</option>
              <option value="kinh-doanh">Kinh doanh/Bán hàng</option>
              <option value="marketing">Marketing/PR/Quảng cáo</option>
              <option value="cskh">
                Chăm sóc khách hàng (Customer Service)
              </option>
              <option value="nhan-su">Nhân sự/Hành chính/Pháp chế</option>
              <option value="tai-chinh">Tài chính/Ngân hàng/Bảo hiểm</option>
              <option value="it">Công nghệ Thông tin</option>
            </select>
          </div>

          <div className={cx("search-group")}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Vị trí tuyển dụng, tên công ty"
              className={cx("search-input")}
            />
          </div>

          <div className={cx("location-group")} ref={locationRef}>
            <div
              className={cx("location-input")}
              onClick={() => setShowLocationDropdown(true)}
            >
              <i className="fa-solid fa-location-dot"></i>
              <span className={cx("location-text")}>
                {getLocationDisplay()}
              </span>
              <i
                className={cx("fa-solid fa-chevron-down", {
                  active: showLocationDropdown,
                })}
              ></i>
            </div>

            {showLocationDropdown && (
              <>
                <div
                  className={cx("location-overlay")}
                  onClick={() => setShowLocationDropdown(false)}
                />
                <div className={cx("location-dropdown")}>
                  <div className={cx("provinces-list")}>
                    <div className={cx("dropdown-header")}>
                      <h4>Chọn Tỉnh/Thành phố</h4>
                      <input
                        type="text"
                        placeholder="Tìm kiếm tỉnh thành..."
                        className={cx("search-input")}
                      />
                    </div>
                    <div className={cx("dropdown-content")}>
                      {provinces.map((province) => (
                        <label
                          key={province.id}
                          className={cx("checkbox-item")}
                        >
                          <input
                            type="checkbox"
                            checked={selectedProvinces.includes(province.id)}
                            onChange={() => handleProvinceSelect(province.id)}
                          />
                          <span>{province.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className={cx("districts-list")}>
                    <div className={cx("dropdown-header")}>
                      <h4>Chọn Quận/Huyện</h4>
                      <input
                        type="text"
                        placeholder="Tìm kiếm quận huyện..."
                        className={cx("search-input")}
                      />
                    </div>
                    <div className={cx("dropdown-content")}>
                      {selectedProvinces.map((provinceId) =>
                        renderDistrictsByProvince(provinceId)
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <button className={cx("search-button")}>
            <i className="fa-solid fa-search"></i>
            Tìm kiếm
          </button>
        </div>
      </div>
    </div>
  );
};

export default UiLayout;
