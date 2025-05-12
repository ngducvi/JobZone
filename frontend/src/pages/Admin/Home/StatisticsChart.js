import React, { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";
import { adminApis, authAPI } from "~/utils/api";

// Register required components for Chart.js
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

const StatisticsChart = ({ year }) => {
  const [chartData, setChartData] = useState(null);
  const [jobStats, setJobStats] = useState(null);

  useEffect(() => {
    // Fetch data from the API
    const fetchStatistics = async () => {
      try {
        const response = await authAPI().get(adminApis.getStatistics(year));
        setChartData(response.data.data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };
    fetchStatistics();
  }, [year]);

  // Fetch job statistics by month
  useEffect(() => {
    const fetchJobStats = async () => {
      try {
        const response = await authAPI().get(adminApis.getJobStatisticsByMonth(year));
        setJobStats(response.data.stats);
      } catch (error) {
        console.error("Error fetching job statistics by month:", error);
      }
    };
    fetchJobStats();
  }, [year]);

  if (!chartData) return <div>Loading...</div>;

  // Extract data from the API response
  const { coursesRegistered, paidOrders } = chartData;

  // Prepare the data for the bar chart (course registrations)
  const registrationFreeCourses = {
    labels: coursesRegistered.map((item) => `Month ${item._id.month}`),
    datasets: [
      {
        label: "Total Courses Registered",
        data: coursesRegistered.map((item) => item.count),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const registrationPaidCourses = {
    labels: paidOrders.map((item) => `Month ${item._id.month}`),
    datasets: [
      {
        label: "Total Courses Registered",
        data: paidOrders.map((item) => item.count),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Prepare the data for the line chart (revenue from paid courses)
  const revenueData = {
    labels: paidOrders.map((item) => `Month ${item._id.month}`),
    datasets: [
      {
        label: "Total Revenue",
        data: paidOrders.map((item) => item.totalAmount),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
      },
    ],
  };

  // Prepare job statistics data for the bar chart
  let jobStatsBarData = null;
  if (jobStats) {
    // Convert Postgres/Sequelize month to readable label
    const monthLabels = jobStats.map((item) => {
      const date = new Date(item.month);
      return `Month ${date.getMonth() + 1}`;
    });
    jobStatsBarData = {
      labels: monthLabels,
      datasets: [
        {
          label: "Jobs Created",
          data: jobStats.map((item) => item.count),
          backgroundColor: "rgba(117, 136, 245, 0.6)",
          borderColor: "rgb(28, 200, 138)",
          borderWidth: 1,
        },
      ],
    };
  }

  // Options for the bar chart
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Courses Registered Per Month",
      },
    },
  };

  // Options for the line chart
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Revenue from Paid Courses Per Month",
      },
    },
  };

  // Options for the job stats bar chart
  const jobBarOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Jobs Created Per Month",
      },
    },
  };

  return (
    <div>
      <h2>Statistics for Year {year}</h2>
      <div className="mt-5">
        <h3>Free Course Registrations</h3>
        <Bar data={registrationFreeCourses} options={barOptions} />
      </div>

      <div className="mt-5">
        <h3>Paid Course Registrations</h3>
        <Bar data={registrationPaidCourses} options={barOptions} />
      </div>

      <div className="mt-5">
        <h3>Course Revenue</h3>
        <Line data={revenueData} options={lineOptions} />
      </div>

      {/* Job statistics by month */}
      <div className="mt-5">
        <h3>Jobs Created Per Month</h3>
        {jobStatsBarData ? (
          <Bar data={jobStatsBarData} options={jobBarOptions} />
        ) : (
          <div>Loading job statistics...</div>
        )}
      </div>
    </div>
  );
};

export default StatisticsChart;
