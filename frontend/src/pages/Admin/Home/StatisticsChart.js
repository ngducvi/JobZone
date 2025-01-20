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
    </div>
  );
};

export default StatisticsChart;
