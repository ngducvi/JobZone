// DashboardB.js - Recruiter/Company Dashboard
import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";
import classNames from "classnames/bind";
import styles from "./DashboardB.module.scss";
import { NextArrowIcon } from "~/components/Icons";
import { Link } from "react-router-dom";
import config from "~/config";
import { adminApis, authAPI } from "~/utils/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const cx = classNames.bind(styles);

const DashboardB = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed
    
    // States for filters
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    
    // States for loading and stats
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRecruiters: 0,
        totalCompanies: 0,
        pendingCompanies: 0,
        activeCompanies: 0,
        rejectedCompanies: 0,
        newRecruiters: 0,
        newCompanies: 0,
        businessLicenseStats: {
            pending: 0,
            verified: 0,
            rejected: 0
        }
    });
    
    // States for chart data
    const [companiesMonthlyData, setCompaniesMonthlyData] = useState({});
    const [companyStatusData, setCompanyStatusData] = useState({});
    const [planData, setPlanData] = useState({});
    const [licenseData, setLicenseData] = useState({});
    const [weeklyTrendData, setWeeklyTrendData] = useState({});
    
    // Generate random color function
    const generateRandomColors = (count) => {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const r = Math.floor(Math.random() * 200);
            const g = Math.floor(Math.random() * 200);
            const b = Math.floor(Math.random() * 200);
            colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
        }
        return colors;
    };
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch main recruiter/company statistics
                const recruiterStatsResponse = await authAPI().get(
                    adminApis.getRecruiterStatistics(selectedYear, selectedMonth)
                );
                
                // Fetch company plan statistics
                const planStatsResponse = await authAPI().get(
                    adminApis.getCompaniesByPlanStats
                );
                
                // Fetch company license statistics
                const licenseStatsResponse = await authAPI().get(
                    adminApis.getCompaniesByLicenseStats
                );
                
                // Fetch company registration trend (weekly) for selected month
                const trendResponse = await authAPI().get(
                    adminApis.getCompanyRegistrationTrend(selectedYear, selectedMonth)
                );
                
                // Update main stats
                const {
                    totalRecruiters,
                    totalCompanies,
                    pendingCompanies,
                    activeCompanies,
                    rejectedCompanies,
                    newRecruiters,
                    newCompanies,
                    businessLicenseStats,
                    companiesByMonth
                } = recruiterStatsResponse.data;
                
                setStats({
                    totalRecruiters,
                    totalCompanies,
                    pendingCompanies,
                    activeCompanies,
                    rejectedCompanies,
                    newRecruiters,
                    newCompanies,
                    businessLicenseStats
                });
                
                // Prepare monthly data chart
                const monthlyData = new Array(12).fill(0);
                companiesByMonth.forEach(item => {
                    const monthIndex = parseInt(item.month) - 1;
                    monthlyData[monthIndex] = parseInt(item.count);
                });
                
                setCompaniesMonthlyData({
                    labels: [
                        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
                        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
                    ],
                    datasets: [
                        {
                            label: "Số lượng công ty",
                            data: monthlyData,
                            backgroundColor: "rgba(0, 119, 182, 0.6)",
                            borderColor: "rgb(0, 119, 182)",
                            borderWidth: 1
                        }
                    ]
                });
                
                // Prepare company status chart
                setCompanyStatusData({
                    labels: ["Đang chờ duyệt", "Hoạt động", "Bị từ chối"],
                    datasets: [
                        {
                            data: [pendingCompanies, activeCompanies, rejectedCompanies],
                            backgroundColor: ["#f4a261", "#2a9d8f", "#e63946"],
                            borderWidth: 1
                        }
                    ]
                });
                
                // Prepare plans chart
                const planStats = planStatsResponse.data.stats;
                const planLabels = planStats.map(item => item.plan || 'Không xác định');
                const planValues = planStats.map(item => parseInt(item.count));
                
                setPlanData({
                    labels: planLabels,
                    datasets: [
                        {
                            data: planValues,
                            backgroundColor: ["#90e0ef", "#00b4d8", "#0077b6"],
                            borderWidth: 1
                        }
                    ]
                });
                
                // Prepare license status chart
                const licenseStats = licenseStatsResponse.data.stats;
                const licenseLabels = licenseStats.map(item => {
                    switch(item.status) {
                        case 'pending': return 'Đang chờ duyệt';
                        case 'verified': return 'Đã xác thực';
                        case 'rejected': return 'Bị từ chối';
                        case 'no_license': return 'Chưa nộp';
                        default: return item.status;
                    }
                });
                const licenseValues = licenseStats.map(item => parseInt(item.count));
                const licenseColors = ["#ffb703", "#8ecae6", "#e76f51", "#adb5bd"];
                
                setLicenseData({
                    labels: licenseLabels,
                    datasets: [
                        {
                            data: licenseValues,
                            backgroundColor: licenseColors,
                            borderWidth: 1
                        }
                    ]
                });
                
                // Prepare weekly trend data
                const { weeks } = trendResponse.data;
                const weekLabels = weeks.map(item => `Tuần ${item.week}`);
                const weekValues = weeks.map(item => item.count);
                
                setWeeklyTrendData({
                    labels: weekLabels,
                    datasets: [
                        {
                            label: "Số lượng công ty đăng ký",
                            data: weekValues,
                            backgroundColor: "rgba(42, 157, 143, 0.6)",
                            borderColor: "rgb(42, 157, 143)",
                            borderWidth: 2,
                            tension: 0.3
                        }
                    ]
                });
                
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [selectedYear, selectedMonth]);
    
    // Generate array of years for filter (5 years back from current)
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    // Generate array of months for filter
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    
    return (
        <div className={cx("dashboard-container")}>
            <h1>Thống kê nhà tuyển dụng và công ty</h1>
            
            {/* Filters */}
            <div className={cx("filter-container")}>
                <div className={cx("filter-item")}>
                    <label htmlFor="year-select">Năm:</label>
                    <select 
                        id="year-select" 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    >
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                
                <div className={cx("filter-item")}>
                    <label htmlFor="month-select">Tháng:</label>
                    <select 
                        id="month-select" 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    >
                        {months.map(month => (
                            <option key={month} value={month}>Tháng {month}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Đang tải dữ liệu...</p>
                </div>
            ) : (
                <>
                    {/* Cards */}
                    <div className="row">
                        <motion.div
                            className={cx("col-lg-3", "col-md-6", "col-sm-12", "mb-4")}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className={cx("card", "bg-info")}>
                                <div className={cx("card-body")}>
                                    <div>
                                        <h3 className={cx("quantity")}>{stats.totalRecruiters}</h3>
                                        <h4 className={cx("title")}>Nhà tuyển dụng</h4>
                                    </div>
                                    <span className={cx("icon-wrapper")}>
                                        <i className="fa-solid fa-user-tie"></i>
                                    </span>
                                </div>
                                <Link to={config.routes.recruiter} className={cx("more-info")}>
                                    <span>Xem thêm </span>
                                    <NextArrowIcon />
                                </Link>
                            </div>
                        </motion.div>
                        
                        <motion.div
                            className={cx("col-lg-3", "col-md-6", "col-sm-12", "mb-4")}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <div className={cx("card", "bg-success")}>
                                <div className={cx("card-body")}>
                                    <div>
                                        <h3 className={cx("quantity")}>{stats.totalCompanies}</h3>
                                        <h4 className={cx("title")}>Tổng công ty</h4>
                                    </div>
                                    <span className={cx("icon-wrapper")}>
                                        <i className="fa-solid fa-building"></i>
                                    </span>
                                </div>
                                <Link to={config.routes.company} className={cx("more-info")}>
                                    <span>Xem thêm </span>
                                    <NextArrowIcon />
                                </Link>
                            </div>
                        </motion.div>
                        
                        <motion.div
                            className={cx("col-lg-3", "col-md-6", "col-sm-12", "mb-4")}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className={cx("card", "bg-warning")}>
                                <div className={cx("card-body")}>
                                    <div>
                                        <h3 className={cx("quantity")}>{stats.activeCompanies}</h3>
                                        <h4 className={cx("title")}>Công ty hoạt động</h4>
                                    </div>
                                    <span className={cx("icon-wrapper")}>
                                        <i className="fa-solid fa-check-circle"></i>
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                        
                        <motion.div
                            className={cx("col-lg-3", "col-md-6", "col-sm-12", "mb-4")}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <div className={cx("card", "bg-dark")}>
                                <div className={cx("card-body")}>
        <div>
                                        <h3 className={cx("quantity")}>{stats.newCompanies}</h3>
                                        <h4 className={cx("title")}>Công ty mới tháng {selectedMonth}</h4>
                                    </div>
                                    <span className={cx("icon-wrapper")}>
                                        <i className="fa-solid fa-building-user"></i>
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                    
                    {/* Monthly company registrations chart */}
                    <div className={cx("chart-container", "row")}>
                        <div className={cx("chart-section", "col-lg-12", "col-md-12", "mb-4")}>
                            <h3>{selectedYear} - Số lượng công ty đăng ký theo tháng</h3>
                            {companiesMonthlyData.labels && companiesMonthlyData.datasets ? (
                                <Bar
                                    data={companiesMonthlyData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: "top",
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: function(context) {
                                                        return `Số công ty: ${context.raw}`;
                                                    }
                                                }
                                            }
                                        },
                                    }}
                                />
                            ) : (
                                <p>Không có dữ liệu</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Status and License charts */}
                    <div className={cx("chart-container", "row")}>
                        <div className={cx("chart-section", "col-lg-6", "col-md-12", "mb-4")}>
                            <h3>Tình trạng công ty</h3>
                            {companyStatusData.labels && companyStatusData.datasets ? (
                                <Doughnut
                                    data={companyStatusData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: "right",
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: function(context) {
                                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                        const percentage = Math.round((context.raw / total) * 100);
                                                        return `${context.label}: ${context.raw} (${percentage}%)`;
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <p>Không có dữ liệu</p>
                            )}
                        </div>
                        
                        <div className={cx("chart-section", "col-lg-6", "col-md-12", "mb-4")}>
                            <h3>Tình trạng giấy phép kinh doanh</h3>
                            {licenseData.labels && licenseData.datasets ? (
                                <Pie
                                    data={licenseData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: "right",
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: function(context) {
                                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                        const percentage = Math.round((context.raw / total) * 100);
                                                        return `${context.label}: ${context.raw} (${percentage}%)`;
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <p>Không có dữ liệu</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Plan and Weekly trend charts */}
                    <div className={cx("chart-container", "row")}>
                        <div className={cx("chart-section", "col-lg-6", "col-md-12", "mb-4")}>
                            <h3>Phân bố theo gói dịch vụ</h3>
                            {planData.labels && planData.datasets ? (
                                <Doughnut
                                    data={planData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: "right",
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: function(context) {
                                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                        const percentage = Math.round((context.raw / total) * 100);
                                                        return `${context.label}: ${context.raw} (${percentage}%)`;
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <p>Không có dữ liệu</p>
                            )}
                        </div>
                        
                        <div className={cx("chart-section", "col-lg-6", "col-md-12", "mb-4")}>
                            <h3>Số lượng công ty đăng ký theo tuần (Tháng {selectedMonth})</h3>
                            {weeklyTrendData.labels && weeklyTrendData.datasets ? (
                                <Line
                                    data={weeklyTrendData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: "top",
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    precision: 0
                                                }
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <p>Không có dữ liệu</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardB;
