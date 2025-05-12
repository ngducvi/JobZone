// dashboard admin 
import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import classNames from "classnames/bind";
import styles from "./DashboardA.module.scss";
import { NextArrowIcon } from "~/components/Icons";
import { Link } from "react-router-dom";
import config from "~/config";
import { adminApis, authAPI } from "~/utils/api";
import { useLocation } from "react-router-dom";
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

const DashboardA = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed

  // State cho các số liệu thống kê
  const [stats, setStats] = useState({
    totalCandidates: 0,
    activeCandidates: 0,
    activelySearching: 0,
    searchable: 0,
    newCandidates: 0
  });

  // State cho dữ liệu biểu đồ
  const [candidateMonthlyData, setCandidateMonthlyData] = useState({});
  const [statusData, setStatusData] = useState({});
  const [industryData, setIndustryData] = useState({});
  const [loading, setLoading] = useState(true);

  // Random color generator for charts
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
        // Lấy thống kê chung về ứng viên
        const candidateStatsResponse = await authAPI().get(
          adminApis.getCandidateStatistics(currentYear)
        );
        
        // Lấy thống kê ứng viên theo trạng thái
        const statusStatsResponse = await authAPI().get(
          adminApis.getCandidatesByStatusStats
        );
        
        // Lấy thống kê ứng viên theo ngành nghề
        const industryStatsResponse = await authAPI().get(
          adminApis.getCandidatesByIndustryStats
        );

        // Cập nhật state với dữ liệu thống kê chung
        const { 
          totalCandidates, 
          activeCandidates, 
          activelySearching, 
          searchable, 
          newCandidates,
          candidatesByMonth 
        } = candidateStatsResponse.data;

        setStats({
          totalCandidates,
          activeCandidates,
          activelySearching,
          searchable,
          newCandidates
        });

        // Chuẩn bị dữ liệu cho biểu đồ ứng viên theo tháng
        const monthlyData = new Array(12).fill(0);
        candidatesByMonth.forEach(item => {
          const monthIndex = parseInt(item.month) - 1;
          monthlyData[monthIndex] = parseInt(item.count);
        });

        setCandidateMonthlyData({
          labels: [
            "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
            "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
          ],
          datasets: [
            {
              label: "Số lượng ứng viên",
              data: monthlyData,
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgb(75, 192, 192)",
              borderWidth: 1
            }
          ]
        });

        // Chuẩn bị dữ liệu cho biểu đồ ứng viên theo trạng thái
        const statusStats = statusStatsResponse.data.stats;
        const statusLabels = statusStats.map(item => item.status || 'Không xác định');
        const statusValues = statusStats.map(item => parseInt(item.count));
        const statusColors = generateRandomColors(statusLabels.length);
        
        setStatusData({
          labels: statusLabels,
          datasets: [
            {
              data: statusValues,
              backgroundColor: statusColors,
              hoverOffset: 4
            }
          ]
        });

        // Chuẩn bị dữ liệu cho biểu đồ ứng viên theo ngành nghề
        const industryStats = industryStatsResponse.data.stats;
        const industryLabels = industryStats.map(item => item.industry || 'Khác');
        const industryValues = industryStats.map(item => parseInt(item.count));
        const industryColors = generateRandomColors(industryLabels.length);

        setIndustryData({
          labels: industryLabels,
          datasets: [
            {
              data: industryValues,
              backgroundColor: industryColors,
              hoverOffset: 4
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
  }, [currentYear]);

  return (
    <div className={cx("dashboard-container")}>
      <h1>Thống kê ứng viên</h1>
      
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {/* Thẻ thống kê */}
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
                    <h3 className={cx("quantity")}>{stats.totalCandidates}</h3>
                    <h4 className={cx("title")}>Tổng ứng viên</h4>
                  </div>
                  <span className={cx("icon-wrapper")}>
                    <i className="fa-solid fa-users"></i>
                  </span>
                </div>
                <Link to={config.routes.candidate} className={cx("more-info")}>
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
                    <h3 className={cx("quantity")}>{stats.activeCandidates}</h3>
                    <h4 className={cx("title")}>Ứng viên hoạt động</h4>
                  </div>
                  <span className={cx("icon-wrapper")}>
                    <i className="fa-solid fa-user-check"></i>
                  </span>
                </div>
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
                    <h3 className={cx("quantity")}>{stats.activelySearching}</h3>
                    <h4 className={cx("title")}>Đang tìm việc</h4>
                  </div>
                  <span className={cx("icon-wrapper")}>
                    <i className="fa-solid fa-search"></i>
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
                    <h3 className={cx("quantity")}>{stats.newCandidates}</h3>
                    <h4 className={cx("title")}>Ứng viên mới tháng {currentMonth}</h4>
                  </div>
                  <span className={cx("icon-wrapper")}>
                    <i className="fa-solid fa-user-plus"></i>
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Biểu đồ ứng viên theo tháng */}
          <div className={cx("chart-container", "row")}>
            <div className={cx("chart-section", "col-lg-12", "col-md-12", "mb-4")}>
              <h3>{currentYear} - Số lượng ứng viên đăng ký theo tháng</h3>
              {candidateMonthlyData.labels && candidateMonthlyData.datasets ? (
                <Bar
                  data={candidateMonthlyData}
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
                            return `Số ứng viên: ${context.raw}`;
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

          {/* Biểu đồ phân phối ứng viên */}
          <div className={cx("chart-container", "row")}>
            <div className={cx("chart-section", "col-lg-6", "col-md-12", "mb-4")}>
              <h3>Ứng viên theo trạng thái</h3>
              {statusData.labels && statusData.datasets ? (
                <Pie
                  data={statusData}
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
              <h3>Ứng viên theo ngành nghề</h3>
              {industryData.labels && industryData.datasets ? (
                <Pie
                  data={industryData}
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
        </>
      )}
    </div>
  );
};

export default DashboardA;

