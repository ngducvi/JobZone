import React, { useEffect, useState, useContext, useRef } from "react";
import classNames from "classnames/bind";
import Card from "./Card.js";
import styles from "./Dashboard.module.scss";
import userServices from "~/services/userServices.js";
import Button from "~/components/Button";
import { Link, useNavigate } from "react-router-dom";
import UserContext from "~/context/UserContext";
import images from "~/assets/images/index.js";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";
import TopJob from "./TopJob.js";
import TopCareer from "./TopCareer.js";
import TopEmployers from "./TopEmployers.js";
import UiLayout from "~/components/UiLayout/UiLayout.js";
import { Tabs } from "~/components/Tabs";
import JobCard from '~/components/JobCard/JobCard';
import LoadingPage from "../LoadingPage/LoadingPage.js";
import useScrollTop from '~/hooks/useScrollTop';
import { authAPI, userApis } from '~/utils/api';
import toast from 'react-hot-toast';

const cx = classNames.bind(styles);

const Dashboard = () => {
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
  const [activeJobTab, setActiveJobTab] = useState("highSalary");

  const token = localStorage.getItem("token");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const mockJobs = {
    highSalary: [
      {
        id: 1,
        title: "Senior Frontend Developer",
        company: "FPT Software",
        salary: "$3000 - $5000",
        location: "Ho Chi Minh City",
        logo: images.company_1
      },
      {
        id: 2,
        title: "Technical Project Manager",
        company: "Viettel Group",
        salary: "$4000 - $6000", 
        location: "Ha Noi",
        logo: images.company_1
      },
      {
        id: 3,
        title: "Solutions Architect",
        company: "VNG Corporation",
        salary: "$5000 - $7000",
        location: "Ho Chi Minh City",
        logo: images.company_1
      }
    ],
    noExperience: [
      {
        id: 4,
        title: "Junior Web Developer",
        company: "Tiki Corporation",
        salary: "$800 - $1200",
        location: "Ho Chi Minh City",
        logo: images.company_1
      },
      // Thêm các job khác...
    ],
    remote: [
      {
        id: 7,
        title: "Remote React Developer",
        company: "Sendo",
        salary: "$2000 - $3500",
        location: "Remote",
        logo: images.company_1
      },
      // Thêm các job khác...
    ],
    partTime: [
      {
        id: 10,
        title: "Part-time Content Writer",
        company: "Lazada Vietnam",
        salary: "$500 - $800",
        location: "Ho Chi Minh City",
        logo: images.company_1
      },
      // Thêm các job khác...
    ]
  };
  // Thêm useEffect để scroll lên đầu trang
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []); // Empty dependency array means this runs once when component mounts
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('https://esgoo.net/api-tinhthanh/1/0.htm');
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
            const formattedId = provinceId.toString().padStart(2, '0');
            const response = await fetch(`https://esgoo.net/api-tinhthanh/2/${formattedId}.htm`);
            const data = await response.json();
            if (Array.isArray(data.data)) {
              return data.data.map(district => ({
                ...district,
                provinceId: provinceId
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProvinceSelect = (provinceId) => {
    setSelectedProvinces(prev => {
      const isSelected = prev.includes(provinceId);
      if (isSelected) {
        return prev.filter(id => id !== provinceId);
      } else {
        return [...prev, provinceId];
      }
    });
  };

  const handleDistrictSelect = (districtId) => {
    setSelectedDistricts(prev => {
      const isSelected = prev.includes(districtId);
      if (isSelected) {
        return prev.filter(id => id !== districtId);
      } else {
        return [...prev, districtId];
      }
    });
  };

  const handleSelectAllDistricts = (provinceId) => {
    const provinceDistricts = districts.filter(d => d.provinceId === provinceId).map(d => d.id);
    setSelectedDistricts(prev => {
      const allSelected = provinceDistricts.every(id => prev.includes(id));
      if (allSelected) {
        return prev.filter(id => !provinceDistricts.includes(id));
      } else {
        return [...new Set([...prev, ...provinceDistricts])];
      }
    });
  };

  const getLocationDisplay = () => {
    if (selectedProvinces.length === 0) return "Địa điểm";
    const provinceNames = selectedProvinces.map(id => 
      provinces.find(p => p.id === id)?.name
    ).filter(Boolean);
    return provinceNames.join(", ");
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const [conversationsResponse, balanceResponse, recentConversation] = await Promise.all([
  //         userServices.getCountConversations(),
  //         userServices.getBalance(),
  //         userServices.getRecentConversations(currentPage),
  //       ]);
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
    const province = provinces.find(p => p.id === provinceId);
    const provinceDistricts = districts.filter(d => d.provinceId === provinceId);
    
    if (!provinceDistricts.length) return null;

    return (
      <div key={provinceId} className={cx("district-group")}>
        <label className={cx("checkbox-item", "province-header")}>
          <input
            type="checkbox"
            checked={provinceDistricts.every(d => selectedDistricts.includes(d.id))}
            onChange={() => handleSelectAllDistricts(provinceId)}
          />
          <span>{province?.name}</span>
        </label>
        <div className={cx("district-items")}>
          {provinceDistricts.map(district => (
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

  useEffect(() => {
    const checkCandidateStatus = async () => {
      try {
        setIsLoading(true);
        // Kiểm tra xem user đã có profile candidate chưa
        const response = await authAPI().get(userApis.checkCandidate);
        
        if (response.data.code === 1) {
          // Candidate đã tồn tại, tiếp tục load dashboard
          await loadDashboard();
        } else {
          // Chưa có candidate profile, chuyển hướng để tạo profile
          toast.error('Bạn cần tạo hồ sơ ứng viên trước!');
          navigate('/create-profile');
        }
      } catch (error) {
        console.error('Error checking candidate status:', error);
        toast.error('Có lỗi xảy ra khi kiểm tra thông tin ứng viên');
      } finally {
        setIsLoading(false);
      }
    };

    const loadDashboard = async () => {
      try {
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Fetch dashboard data here
        // const response = await authAPI().get(userApis.getDashboardData);
        // setData(response.data);
        
      } catch (error) {
        console.error("Error loading dashboard:", error);
        toast.error('Có lỗi xảy ra khi tải dữ liệu');
      }
    };

    // Chỉ check candidate nếu user đã đăng nhập
    if (user) {
      checkCandidateStatus();
    } else {
      setIsLoading(false);
    }
  }, [user, navigate]);

  if (isLoading) {
    return <LoadingPage />;
  }

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  }

  return (
    <div className={cx("dashboard")}>
      
      <div className={cx("ui-layout")}>
        <UiLayout />
      </div>

      <div className={cx("content")}>
        <TopJob />
        <div className="container mx-auto px-4 py-8">
          <div className={cx("favorite-jobs-section")}>
            <h1 className={cx("section-title")}>Công việc yêu thích</h1>
            <Tabs>
              <Tabs.Tab 
                active={activeJobTab === "highSalary"} 
                onClick={() => setActiveJobTab("highSalary")}
              >
                Công việc ngàn đô
              </Tabs.Tab>
              <Tabs.Tab 
                active={activeJobTab === "noExperience"} 
                onClick={() => setActiveJobTab("noExperience")}
              >
                Công việc không yêu cầu kinh nghiệm
              </Tabs.Tab>
              <Tabs.Tab 
                active={activeJobTab === "remote"} 
                onClick={() => setActiveJobTab("remote")}
              >
                Công việc từ xa
              </Tabs.Tab>
              <Tabs.Tab 
                active={activeJobTab === "partTime"} 
                onClick={() => setActiveJobTab("partTime")}
              >
                Công việc bán thời gian
              </Tabs.Tab>
            </Tabs>
            <div className={cx("jobs-container")}>
              <div className={cx("jobs-grid")}>
                {mockJobs[activeJobTab]?.map(job => (
                  <div key={job.id} onClick={() => handleJobClick(job.id)}>
                    <JobCard
                      key={job.id}
                      title={job.title}
                      company={job.company}
                      salary={job.salary}
                      location={job.location}
                      logo={job.logo}
                    />
                    
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <TopCareer />
        <TopEmployers />
      </div>
    </div>
  );
};

export default Dashboard;
