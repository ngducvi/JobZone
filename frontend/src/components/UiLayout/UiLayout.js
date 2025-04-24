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

export function UiLayout() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("month")
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [selectedProvinces, setSelectedProvinces] = useState([])
  const [selectedDistricts, setSelectedDistricts] = useState([])
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const locationRef = useRef(null)

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch("https://esgoo.net/api-tinhthanh/1/0.htm")
        const data = await response.json()
        if (Array.isArray(data.data)) {
          setProvinces(data.data)
        } else {
          setProvinces([])
        }
      } catch (error) {
        setProvinces([])
      }
    }
    fetchProvinces()
  }, [])

  // Fetch districts when provinces change
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const districtsData = await Promise.all(
          selectedProvinces.map(async (provinceId) => {
            const formattedId = provinceId.toString().padStart(2, "0")
            const response = await fetch(`https://esgoo.net/api-tinhthanh/2/${formattedId}.htm`)
            const data = await response.json()
            if (Array.isArray(data.data)) {
              return data.data.map((district) => ({
                ...district,
                provinceId: provinceId,
              }))
            }
            return []
          }),
        )
        setDistricts(districtsData.flat())
      } catch (error) {
        console.error("Error fetching districts:", error)
        setDistricts([])
      }
    }

    if (selectedProvinces.length > 0) {
      fetchDistricts()
    } else {
      setDistricts([])
    }
  }, [selectedProvinces])

  // Handle clicks outside location dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleProvinceSelect = (provinceId) => {
    setSelectedProvinces((prev) => {
      const isSelected = prev.includes(provinceId)
      if (isSelected) {
        return prev.filter((id) => id !== provinceId)
      } else {
        return [...prev, provinceId]
      }
    })
  }

  const handleDistrictSelect = (districtId) => {
    setSelectedDistricts((prev) => {
      const isSelected = prev.includes(districtId)
      if (isSelected) {
        return prev.filter((id) => id !== districtId)
      } else {
        return [...prev, districtId]
      }
    })
  }

  const handleSelectAllDistricts = (provinceId) => {
    const provinceDistricts = districts.filter((d) => d.provinceId === provinceId).map((d) => d.id)

    setSelectedDistricts((prev) => {
      const allSelected = provinceDistricts.every((id) => prev.includes(id))
      if (allSelected) {
        return prev.filter((id) => !provinceDistricts.includes(id))
      } else {
        return [...new Set([...prev, ...provinceDistricts])]
      }
    })
  }

  const getLocationDisplay = () => {
    if (selectedProvinces.length === 0) return "Địa điểm"
    const provinceNames = selectedProvinces.map((id) => provinces.find((p) => p.id === id)?.name).filter(Boolean)
    return provinceNames.join(", ")
  }

  const renderDistrictsByProvince = (provinceId) => {
    const province = provinces.find((p) => p.id === provinceId)
    const provinceDistricts = districts.filter((d) => d.provinceId === provinceId)

    if (!provinceDistricts.length) return null

    return (
      <div key={provinceId} className={styles.districtGroup}>
        <label className={cx(styles.checkboxItem, styles.provinceHeader)}>
          <input
            type="checkbox"
            checked={provinceDistricts.every((d) => selectedDistricts.includes(d.id))}
            onChange={() => handleSelectAllDistricts(provinceId)}
          />
          <span>{province?.name}</span>
        </label>
        <div className={styles.districtItems}>
          {provinceDistricts.map((district) => (
            <label key={district.id} className={styles.checkboxItem}>
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
    )
  }

  const handleSearch = () => {
    // Prepare search params
    const searchParams = new URLSearchParams();
    if (searchKeyword) searchParams.append('keyword', searchKeyword);
    if (selectedProvinces.length) {
      const provinceNames = selectedProvinces.map(id => 
        provinces.find(p => p.id === id)?.name
      ).filter(Boolean);
      searchParams.append('location', provinceNames.join(', '));
    }
    if (selectedDistricts.length) {
      const districtNames = selectedDistricts.map(id => 
        districts.find(d => d.id === id)?.name
      ).filter(Boolean);
      if (districtNames.length) {
        const currentLocation = searchParams.get('location') || '';
        searchParams.set('location', `${currentLocation}, ${districtNames.join(', ')}`);
      }
    }
    
    // Navigate to search page with params
    navigate(`/user/job-search?${searchParams.toString()}`);
  };

  return (
    <div className={styles.wrapper}>
      {/* Grid background overlay */}
      <div className={styles.gridOverlay} />

      {/* Header section with logo */}
      <div className={styles.headerSection}>
        <div className={styles.logoContainer}>
          <img src={images.logo || "/placeholder.svg"} alt="Logo" />
        </div>
      </div>

      {/* Animated hero section */}
      <div className={styles.heroSection}>
        <div className={styles.heroGrid} />
        <Sparkles density={1900} direction="bottom" color="#ffffff" size={1} speed={0.5} className={styles.sparkles} />
      </div>

      {/* Description */}
      <p className={styles.description}>Tìm việc làm nhanh 24h, việc làm mới nhất trên toàn quốc.</p>

      {/* Search form */}
      <div className={styles.searchContainer}>
        <div className={styles.searchForm}>

          {/* Search input */}
          <div className={styles.searchGroup}>
            <input 
              type="text" 
              placeholder="Vị trí tuyển dụng, tên công ty" 
              className={styles.searchInput}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>

          {/* Location dropdown */}
          <div className={styles.locationGroup} ref={locationRef}>
            <div className={styles.locationInput} onClick={() => setShowLocationDropdown(true)}>
              <i className="fa-solid fa-map-marker-alt"></i>
              <span className={styles.locationText}>{getLocationDisplay()}</span>
              <i className={cx(styles.chevronIcon, showLocationDropdown && styles.rotated)}></i>
            </div>

            {showLocationDropdown && (
              <>
                <div className={styles.locationOverlay} onClick={() => setShowLocationDropdown(false)} />
                <div className={styles.locationDropdown}>
                  {/* Provinces list */}
                  <div className={styles.provincesList}>
                    <div className={styles.dropdownHeader}>
                      <h4>Chọn Tỉnh/Thành phố</h4>
                      <input type="text" placeholder="Tìm kiếm tỉnh thành..." className={styles.searchInput} />
                    </div>
                    <div className={styles.dropdownContent}>
                      {provinces.map((province) => (
                        <label key={province.id} className={styles.checkboxItem}>
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

                  {/* Districts list */}
                  <div className={styles.districtsList}>
                    <div className={styles.dropdownHeader}>
                      <h4>Chọn Quận/Huyện</h4>
                      <input type="text" placeholder="Tìm kiếm quận huyện..." className={styles.searchInput} />
                    </div>
                    <div className={styles.dropdownContent}>
                      {selectedProvinces.map((provinceId) => renderDistrictsByProvince(provinceId))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Search button */}
          <button className={styles.searchButton} onClick={handleSearch}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <span>Tìm kiếm</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default UiLayout;