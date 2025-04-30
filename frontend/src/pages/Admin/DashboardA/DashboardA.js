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
  const currentMonth = new Date().getMonth();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(queryParams.get("page")) || 1;

  const [activePage, setActivePage] = useState(pageFromUrl);
  const [totalPages, setTotalPages] = useState(1);
  // State cho các số liệu thống kê
  const [stats, setStats] = useState({
    totalCandidates: 0,
    activeCandidates: 0,
    activelySearching: 0,
    searchable: 0,
    newCandidatesThisMonth: 0,
    totalApplications: 0,
    totalInterviews: 0
  });

  // State cho dữ liệu biểu đồ
  const [chartData, setChartData] = useState({});
  const [statusData, setStatusData] = useState({});
  const [skillsData, setSkillsData] = useState({});
  const [categoryData, setCategoryData] = useState({});
  const [registrationTrendData, setRegistrationTrendData] = useState({});
  const [countCandidatesResponse, setCountCandidatesResponse] = useState({});
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await authAPI().get(adminApis.getCountUsers);
        setCountCandidatesResponse(result.data);
        console.log(countCandidatesResponse);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [currentMonth, currentYear]);

  return (
    <div className={cx("dashboard-container")}>
      <h1>Dashboard</h1>
    </div>
  );
};

export default DashboardA;

