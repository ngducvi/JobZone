// page compound interest calculator

import { useState , useEffect} from "react";
import classNames from "classnames/bind";
import styles from "./CompoundInterestCalculator.module.scss";
import Background3D from "~/components/Background3D/Background3D";
import useScrollTop from '~/hooks/useScrollTop';
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

const cx = classNames.bind(styles);

// Đăng ký components cho Chart.js
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

function CompoundInterestCalculator() {
  const [formData, setFormData] = useState({
    initialAmount: 10000000, // Số tiền gốc ban đầu
    monthlyDeposit: 1000000, // Số tiền gửi thêm mỗi tháng
    years: 10, // Thời gian (năm)
    interestRate: 2, // Lãi suất (%/năm)
    compoundingPeriod: "monthly", // Kỳ tính lãi
  });
  // Thêm useEffect để scroll lên đầu trang
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []); // Empty dependency array means this runs once when component mounts
  const [results, setResults] = useState(null);

  const handleCalculate = () => {
    const P = Number(formData.initialAmount); // Số tiền gốc
    const PMT = Number(formData.monthlyDeposit); // Số tiền gửi thêm định kỳ
    const r = Number(formData.interestRate) / 100; // Lãi suất hàng năm
    const t = Number(formData.years); // Số năm
    let n = 12; // Số lần ghép lãi trong năm (mặc định là hàng tháng)

    switch (formData.compoundingPeriod) {
      case "daily":
        n = 365;
        break;
      case "weekly":
        n = 52;
        break;
      case "monthly":
        n = 12;
        break;
      case "quarterly":
        n = 4;
        break;
      case "yearly":
        n = 1;
        break;
      default:
        n = 12;
    }

    // Tính toán kết quả theo từng năm
    const yearlyResults = [];
    let totalContribution = P;
    let previousAmount = P;

    for (let year = 1; year <= t; year++) {
      // Tính lãi kép cho số tiền gốc: A = P(1 + r/n)^(nt)
      const baseAmount = P * Math.pow(1 + r/n, n * year);
      
      // Tính lãi kép cho các khoản gửi thêm định kỳ
      // PMT * (((1 + r/n)^(nt) - 1) / (r/n))
      const futureValueOfDeposits = PMT * ((Math.pow(1 + r/n, n * year) - 1) / (r/n));
      
      const totalAmount = baseAmount + futureValueOfDeposits;
      totalContribution += PMT * 12;

      yearlyResults.push({
        year,
        principal: totalContribution,
        totalAmount: totalAmount,
        interestEarned: totalAmount - totalContribution,
        yearlyInterest: totalAmount - previousAmount - (PMT * 12),
      });

      previousAmount = totalAmount;
    }

    setResults({
      yearlyResults,
      finalAmount: yearlyResults[yearlyResults.length - 1].totalAmount,
      totalContribution: totalContribution,
      totalInterest: yearlyResults[yearlyResults.length - 1].interestEarned,
    });
  };

  return (
    <>
      <Background3D />
      <div className={cx("wrapper")}>
        <div className={cx("calculator-container")}>
          <div className={cx("calculator-header")}>
            <div className={cx("header-icon")}>
              <i className="fas fa-chart-line"></i>
            </div>
            <h1>Tính toán giá trị tiền gửi, lợi nhuận đầu tư tương lai</h1>
            <p>gồm tổng số tiền gốc và lãi ngay.</p>
          </div>

          <div className={cx("calculator-form")}>
            <div className={cx("form-steps")}>
              <div className={cx("step")}>
                <h3>Bước 1: Đầu tư ban đầu</h3>
                <div className={cx("input-group")}>
                  <label>Số tiền gốc ban đầu (VND)</label>
                  <input
                    type="number"
                    value={formData.initialAmount}
                    onChange={(e) => setFormData({ ...formData, initialAmount: e.target.value })}
                  />
                </div>
              </div>

              <div className={cx("step")}>
                <h3>Bước 2: Khoản đóng góp</h3>
                <div className={cx("input-group")}>
                  <label>Số tiền gửi mỗi tháng (VND)</label>
                  <input
                    type="number"
                    value={formData.monthlyDeposit}
                    onChange={(e) => setFormData({ ...formData, monthlyDeposit: e.target.value })}
                  />
                </div>
              </div>

              <div className={cx("step")}>
                <h3>Bước 3: Lãi suất</h3>
                <div className={cx("input-group")}>
                  <label>Lãi suất (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  />
                </div>
              </div>

              <div className={cx("step")}>
                <h3>Bước 4: Kỳ hạn</h3>
                <div className={cx("input-group")}>
                  <label>Thời gian gửi (Năm)</label>
                  <input
                    type="number"
                    value={formData.years}
                    onChange={(e) => setFormData({ ...formData, years: e.target.value })}
                  />
                </div>
                <div className={cx("input-group")}>
                  <label>Định kỳ gửi</label>
                  <select
                    value={formData.compoundingPeriod}
                    onChange={(e) => setFormData({ ...formData, compoundingPeriod: e.target.value })}
                  >
                    <option value="daily">Hằng ngày</option>
                    <option value="weekly">Hằng tuần</option>
                    <option value="monthly">Hằng tháng</option>
                    <option value="quarterly">Hằng quý</option>
                    <option value="yearly">Hằng năm</option>
                  </select>
                </div>
              </div>
            </div>

            <button className={cx("calculate-button")} onClick={handleCalculate}>
              <i className="fas fa-calculator"></i>
              Tính toán
            </button>

            {results && (
              <div className={cx("results-section")}>
                <div className={cx("results-summary")}>
                  <div className={cx("summary-card", "total")}>
                    <h4>Tổng giá trị tương lai</h4>
                    <span>{Math.round(results.finalAmount).toLocaleString()} VND</span>
                  </div>
                  <div className={cx("summary-card")}>
                    <h4>Tổng tiền gốc</h4>
                    <span>{Math.round(results.totalContribution).toLocaleString()} VND</span>
                  </div>
                  <div className={cx("summary-card")}>
                    <h4>Tổng lãi</h4>
                    <span>{Math.round(results.totalInterest).toLocaleString()} VND</span>
                  </div>
                </div>

                <div className={cx("results-table")}>
                  <h3>Chi tiết theo năm</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Năm</th>
                        <th>Tiền gốc</th>
                        <th>Lãi trong năm</th>
                        <th>Tổng giá trị</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.yearlyResults.map((result) => (
                        <tr key={result.year}>
                          <td>{result.year}</td>
                          <td>{Math.round(result.principal).toLocaleString()} VND</td>
                          <td>{Math.round(result.yearlyInterest).toLocaleString()} VND</td>
                          <td>{Math.round(result.totalAmount).toLocaleString()} VND</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className={cx("charts-section")}>
                  <div className={cx("chart-container")}>
                    <h3>Biểu đồ tăng trưởng</h3>
                    <Line
                      data={{
                        labels: results.yearlyResults.map(result => `Năm ${result.year}`),
                        datasets: [
                          {
                            label: 'Tổng giá trị',
                            data: results.yearlyResults.map(result => result.totalAmount),
                            borderColor: '#013a74',
                            backgroundColor: 'rgba(1, 58, 116, 0.1)',
                            fill: true,
                          },
                          {
                            label: 'Tiền gốc',
                            data: results.yearlyResults.map(result => result.principal),
                            borderColor: '#02a346',
                            backgroundColor: 'rgba(2, 163, 70, 0.1)',
                            fill: true,
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: true,
                            text: 'Tăng trưởng theo thời gian'
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return value.toLocaleString() + ' VND';
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>

                  <div className={cx("chart-container")}>
                    <h3>Phân tích lãi hàng năm</h3>
                    <Bar
                      data={{
                        labels: results.yearlyResults.map(result => `Năm ${result.year}`),
                        datasets: [
                          {
                            label: 'Lãi trong năm',
                            data: results.yearlyResults.map(result => result.yearlyInterest),
                            backgroundColor: 'rgba(1, 58, 116, 0.6)',
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: true,
                            text: 'Lãi suất theo từng năm'
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return value.toLocaleString() + ' VND';
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default CompoundInterestCalculator;
