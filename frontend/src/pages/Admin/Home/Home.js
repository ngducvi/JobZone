import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2"; // Import both Bar and Pie chart components
import { motion } from "framer-motion";
import classNames from "classnames/bind";
import styles from "./Home.module.scss";
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
} from "chart.js";
import { useLocation } from "react-router-dom";
// Registering chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement // For Pie chart
);

const cx = classNames.bind(styles);

function Home() {
  const currentYear = new Date().getFullYear();

  // State to hold the counts for courses, users, lessons, and blogs
  const [count, setCount] = useState({
    users: 0,
    models: 0,
    giftcodes: 0,
    payments: 0,
  });

  // State for chart data
  const [chartData, setChartData] = useState({});
  const [paymentStatusData, setPaymentStatusData] = useState({});
  const [walletData, setWalletData] = useState({}); // New state for wallet data
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [countJobs, setCountJobs] = useState(0);
  // Fetching the count data and payments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          usersResponse,
          modelsResponse,
          paymentsResponse,
          walletsResponse,
          resultResponse,
          paymentDataResponse,
          jobsResponse,
        ] = await Promise.all([
          authAPI().get(adminApis.getCountUsers),
          authAPI().get(adminApis.getCountModels),
          authAPI().get(adminApis.getCountPayments),
          authAPI().get(adminApis.getAllWallets),
          authAPI().get(adminApis.getAllUsers),
          authAPI().get(adminApis.getAllPayments),
          authAPI().get(adminApis.getCountJobs),
        ]);

        // Set counts
        setCount({
          users: usersResponse.data.count,
          models: modelsResponse.data.count,
          payments: paymentsResponse.data.count,
          jobs: jobsResponse.data.count,
        });

        setCountJobs(jobsResponse.data.count);

        // Wallet data processing
        const wallets = walletsResponse.data.wallets;
        const usersWithWallet = wallets.filter(
          (wallet) => wallet.balance > 0
        ).length;
        const usersWithoutWallet = wallets.length - usersWithWallet;

        setWalletData({
          labels: ["Người dùng có Ví", "Người dùng không có ví"],
          datasets: [
            {
              data: [usersWithWallet, usersWithoutWallet],
              backgroundColor: ["#195a97", "#dc3545"],
            },
          ],
        });

        // Payment data processing
        const paymentsArray = paymentDataResponse.data.payments;
        const monthlyPaymentsSuccess = new Array(12).fill(0);
        const monthlyPaymentsPending = new Array(12).fill(0);

        paymentsArray.forEach((payment) => {
          const paymentDate = new Date(payment.payment.transaction_date);
          const monthIndex = paymentDate.getMonth();
          const amount = payment.payment.amount;

          if (payment.payment.status === "success") {
            monthlyPaymentsSuccess[monthIndex] += amount;
          } else if (payment.payment.status === "pending") {
            monthlyPaymentsPending[monthIndex] += amount;
          }
        });

        setChartData({
          labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          datasets: [
            {
              label: "Thanh toán thành công",
              data: monthlyPaymentsSuccess,
              backgroundColor: "rgba(117, 136, 245, 0.6)",
              borderColor: "rgb(28, 200, 138)",
              borderWidth: 1,
            },
            {
              label: "Thanh toán đang chờ",
              data: monthlyPaymentsPending,
              backgroundColor: "#195a97",
              borderColor: "rgb(255, 193, 7)",
              borderWidth: 1,
            },
          ],
        });

        // Payment status processing
        const statusCounts = {
          success: 0,
          failed: 0,
          pending: 0,
        };

        paymentsArray.forEach((payment) => {
          const status = payment.payment.status;
          if (status === "success") {
            statusCounts.success += 1;
          } else if (status === "failed") {
            statusCounts.failed += 1;
          } else if (status === "pending") {
            statusCounts.pending += 1;
          }
        });

        setPaymentStatusData({
          labels: ["Success", "Failed", "Pending"],
          datasets: [
            {
              data: [
                statusCounts.success,
                statusCounts.failed,
                statusCounts.pending,
              ],
              backgroundColor: ["#28a745", "#dc3545", "#ffc107"],
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={cx("home-container")}>
        <h1 className="ml-3 mt-2">Dashboard</h1>

      <div className="row">
        {/* Card for Users */}
        <motion.div
          className={cx('col-lg-3', 'col-md-6', 'col-sm-12', 'mb-4')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className={cx("card", "bg-info")}>
            <div className={cx("card-body")}>
              <div>
                <h3 className={cx("quantity")}>{count.users}</h3>
                <h4 className={cx("title")}>Người dùng</h4>
              </div>
              <span className={cx("icon-wrapper")}>
                <i className="fa-solid fa-user"></i>
              </span>
            </div>
            <Link to={config.routes.user} className={cx("more-info")}>
              <span>Xem thêm </span>
              <NextArrowIcon />
            </Link>
          </div>
        </motion.div>

        {/* Card for Models */}
        <motion.div
          className={cx('col-lg-3', 'col-md-6', 'col-sm-12', 'mb-4')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className={cx("card", "bg-success")}>
            <div className={cx("card-body")}>
              <div>
                <h3 className={cx("quantity")}>{count.models}</h3>
                <h4 className={cx("title")}>Mô hình AI</h4>
              </div>
              <span className={cx("icon-wrapper")}>
                <i className="fa-solid fa-hexagon-nodes-bolt"></i>
              </span>
            </div>
            <Link to={config.routes.model} className={cx("more-info")}>
              <span>Xem thêm </span>
              <NextArrowIcon />
            </Link>
          </div>
        </motion.div>

        {/* Card for Jobs */}
        <motion.div
          className={cx('col-lg-3', 'col-md-6', 'col-sm-12', 'mb-4')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className={cx("card", "bg-warning")}>
            <div className={cx("card-body")}>
              <div>
                <h3 className={cx("quantity")}>{count.jobs}</h3>
                <h4 className={cx("title")}>Công việc</h4>
              </div>
              <span className={cx("icon-wrapper")}>
                <i className="fa-solid fa-briefcase"></i>
              </span>
            </div>
            <Link to={config.routes.job} className={cx("more-info")}>
              <span>Xem thêm </span>
              <NextArrowIcon />
            </Link>
          </div>
        </motion.div>

        {/* Card for Payments */}
        <motion.div
          className={cx('col-lg-3', 'col-md-6', 'col-sm-12', 'mb-4')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className={cx("card", "bg-dark")}>
            <div className={cx("card-body")}>
              <div>
                <h3 className={cx("quantity")}>{count.payments}</h3>
                <h4 className={cx("title")}>Thanh toán</h4>
              </div>
              <span className={cx("icon-wrapper")}>
                <i className="fa-solid fa-credit-card"></i>
              </span>
            </div>
            <Link to={config.routes.payment} className={cx("more-info")}>
              <span>Xem thêm </span>
              <NextArrowIcon />
            </Link>
          </div>
        </motion.div>
      </div>
     


      {/* Chart Section */}
      <div className={cx('chart-container', 'row')}>
        <div className={cx('chart-section', 'col-lg-8', 'col-md-12', 'mb-4')}>
          <h3>{currentYear} Tổng quan thanh toán</h3>
          {chartData.labels && chartData.datasets ? (
            <Bar data={chartData} options={{ 
              responsive: true,
              maintainAspectRatio: false
            }} />
          ) : (
            <p>Loading chart data...</p>
          )}
        </div>
        
        <div className={cx('chart-section', 'col-lg-4', 'col-md-12')}>
          <h3>Payment Status Overview</h3>
          {walletData.labels && walletData.datasets ? (
            <Pie data={walletData} options={{ 
              responsive: true,
              maintainAspectRatio: false
            }} />
          ) : (
            <p>Loading wallet data...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
