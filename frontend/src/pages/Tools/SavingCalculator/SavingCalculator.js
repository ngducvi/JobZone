// Tinh tien tiet kiem

import { useState , useEffect} from "react";
import classNames from "classnames/bind";
import styles from "./SavingCalculator.module.scss";
import Background3D from "~/components/Background3D/Background3D";
import { Bar, Line } from "react-chartjs-2";
import useScrollTop from '~/hooks/useScrollTop';
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

const cx = classNames.bind(styles);

function SavingCalculator() {
  const [formData, setFormData] = useState({
    targetAmount: 10000000, // Mục tiêu tiết kiệm
    initialAmount: 1000000, // Số tiền ban đầu
    years: 10, // Thời gian (năm)
    interestRate: 7, // Lãi suất (%/năm)
    compoundingPeriod: "monthly", // Kỳ tính lãi
  });

  const [results, setResults] = useState(null);

  const handleCalculate = () => {
    const A = Number(formData.targetAmount); // Mục tiêu
    const P = Number(formData.initialAmount); // Số tiền ban đầu
    const r = Number(formData.interestRate) / 100; // Lãi suất hàng năm
    const t = Number(formData.years); // Số năm
    let n = 12; // Số lần ghép lãi trong năm

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

    // Tính PMT (số tiền cần tiết kiệm hàng tháng)
    const PMT = ((A - P * Math.pow(1 + r/n, n*t)) * (r/n)) / (Math.pow(1 + r/n, n*t) - 1);

    // Tính kết quả theo từng năm
    const yearlyResults = [];
    let totalSaved = P;
    let previousAmount = P;

    for (let year = 1; year <= t; year++) {
      const baseAmount = P * Math.pow(1 + r/n, n * year);
      const monthlyDeposits = PMT * 12 * year;
      const futureValueOfDeposits = PMT * ((Math.pow(1 + r/n, n * year) - 1) / (r/n));
      
      const totalAmount = baseAmount + futureValueOfDeposits;
      totalSaved += PMT * 12;

      yearlyResults.push({
        year,
        saved: totalSaved,
        totalAmount: totalAmount,
        interest: totalAmount - totalSaved,
        yearlyInterest: totalAmount - previousAmount - (PMT * 12),
      });

      previousAmount = totalAmount;
    }

    setResults({
      monthlyAmount: PMT,
      yearlyResults,
      finalAmount: yearlyResults[yearlyResults.length - 1].totalAmount,
      totalSaved: totalSaved,
      totalInterest: yearlyResults[yearlyResults.length - 1].interest,
    });
  };
    // Thêm useEffect để scroll lên đầu trang
    useEffect(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, []); // Empty dependency array means this runs once when component mounts

  return (
    <>
      <Background3D />
      <div className={cx("wrapper")}>
        <div className={cx("calculator-container")}>
          <div className={cx("calculator-header")}>
            <div className={cx("header-icon")}>
              <i className="fas fa-piggy-bank"></i>
            </div>
            <h1>Công cụ lập kế hoạch tiết kiệm</h1>
            <p>Hãy tính xem mỗi tháng bạn cần tiết kiệm bao nhiêu để đạt được kế hoạch tiết kiệm nhé!</p>
          </div>

          <div className={cx("calculator-form")}>
            <div className={cx("form-steps")}>
              <div className={cx("step")}>
                <h3>Bước 1: Mục tiêu tiết kiệm</h3>
                <div className={cx("input-group")}>
                  <label>Số tiền mục tiêu (VND)</label>
                  <input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    placeholder="Nhập số tiền mục tiêu"
                  />
                </div>
                <div className={cx("input-group")}>
                  <label>Số tiền ban đầu (VND)</label>
                  <input
                    type="number"
                    value={formData.initialAmount}
                    onChange={(e) => setFormData({ ...formData, initialAmount: e.target.value })}
                    placeholder="Nhập số tiền ban đầu"
                  />
                </div>
              </div>

              <div className={cx("step")}>
                <h3>Bước 2: Thời gian và lãi suất</h3>
                <div className={cx("input-group")}>
                  <label>Thời gian (Năm)</label>
                  <input
                    type="number"
                    value={formData.years}
                    onChange={(e) => setFormData({ ...formData, years: e.target.value })}
                    placeholder="Nhập số năm"
                  />
                </div>
                <div className={cx("input-group")}>
                  <label>Lãi suất (%/năm)</label>
                  <input
                    type="number"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    placeholder="Nhập lãi suất"
                  />
                </div>
                <div className={cx("input-group")}>
                  <label>Kỳ tính lãi</label>
                  <select
                    value={formData.compoundingPeriod}
                    onChange={(e) => setFormData({ ...formData, compoundingPeriod: e.target.value })}
                  >
                    <option value="monthly">Hàng tháng</option>
                    <option value="quarterly">Hàng quý</option>
                    <option value="yearly">Hàng năm</option>
                  </select>
                </div>
              </div>
            </div>

            <button className={cx("calculate-button")} onClick={handleCalculate}>
              <i className="fas fa-calculator"></i>
              Tính toán kế hoạch
            </button>

            {results && (
              <div className={cx("results-section")}>
                <div className={cx("results-summary")}>
                  <div className={cx("summary-card", "highlight")}>
                    <h4>Số tiền cần tiết kiệm mỗi tháng</h4>
                    <span>{Math.round(results.monthlyAmount).toLocaleString()} VND</span>
                  </div>
                  <div className={cx("summary-card")}>
                    <h4>Tổng số tiền tích lũy</h4>
                    <span>{Math.round(results.finalAmount).toLocaleString()} VND</span>
                  </div>
                  <div className={cx("summary-card")}>
                    <h4>Tổng lãi nhận được</h4>
                    <span>{Math.round(results.totalInterest).toLocaleString()} VND</span>
                  </div>
                </div>

                <div className={cx("charts-section")}>
                  <div className={cx("chart-container")}>
                    <h3>Biểu đồ tăng trưởng</h3>
                    <Line
                      data={{
                        labels: results.yearlyResults.map(result => `Năm ${result.year}`),
                        datasets: [
                          {
                            label: 'Tổng tích lũy',
                            data: results.yearlyResults.map(result => result.totalAmount),
                            borderColor: '#013a74',
                            backgroundColor: 'rgba(1, 58, 116, 0.1)',
                            fill: true,
                          },
                          {
                            label: 'Tiền gốc',
                            data: results.yearlyResults.map(result => result.saved),
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
                </div>

               
              </div>
            )}
             <div className={cx("info-section")}>
                  <div className={cx("tips-container")}>
                    <h3>
                      <i className="fas fa-lightbulb"></i>
                      Tips tiết kiệm hiệu quả
                    </h3>
                    <div className={cx("tips-grid")}>
                      <div className={cx("tip-card")}>
                        <div className={cx("tip-icon")}>
                          <i className="fas fa-piggy-bank"></i>
                        </div>
                        <h4>Quy tắc 50/30/20</h4>
                        <p>Phân bổ thu nhập: 50% cho nhu cầu thiết yếu, 30% cho mong muốn, 20% để tiết kiệm và đầu tư.</p>
                      </div>
                      <div className={cx("tip-card")}>
                        <div className={cx("tip-icon")}>
                          <i className="fas fa-chart-line"></i>
                        </div>
                        <h4>Đầu tư thông minh</h4>
                        <p>Đa dạng hóa danh mục đầu tư để giảm thiểu rủi ro và tối ưu hóa lợi nhuận dài hạn.</p>
                      </div>
                      <div className={cx("tip-card")}>
                        <div className={cx("tip-icon")}>
                          <i className="fas fa-clock"></i>
                        </div>
                        <h4>Tiết kiệm tự động</h4>
                        <p>Thiết lập chuyển khoản tự động hàng tháng vào tài khoản tiết kiệm ngay khi nhận lương.</p>
                      </div>
                    </div>
                  </div>

                  <div className={cx("comparison-section")}>
                    <h3>
                      <i className="fas fa-balance-scale"></i>
                      So sánh các hình thức tiết kiệm
                    </h3>
                    <div className={cx("comparison-table")}>
                      <table>
                        <thead>
                          <tr>
                            <th>Hình thức</th>
                            <th>Lợi ích</th>
                            <th>Rủi ro</th>
                            <th>Phù hợp với</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Gửi tiết kiệm ngân hàng</td>
                            <td>An toàn, lãi suất ổn định</td>
                            <td>Lãi suất thấp</td>
                            <td>Người thận trọng</td>
                          </tr>
                          <tr>
                            <td>Đầu tư chứng khoán</td>
                            <td>Tiềm năng sinh lời cao</td>
                            <td>Biến động thị trường</td>
                            <td>Người chấp nhận rủi ro</td>
                          </tr>
                          <tr>
                            <td>Quỹ đầu tư</td>
                            <td>Được quản lý chuyên nghiệp</td>
                            <td>Phí quản lý</td>
                            <td>Nhà đầu tư bận rộn</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className={cx("faq-section")}>
                    <h3>
                      <i className="fas fa-question-circle"></i>
                      Câu hỏi thường gặp
                    </h3>
                    <div className={cx("faq-list")}>
                      <div className={cx("faq-item")}>
                        <h4>Nên bắt đầu tiết kiệm khi nào?</h4>
                        <p>Càng sớm càng tốt! Lãi kép sẽ giúp số tiền của bạn tăng trưởng nhanh hơn theo thời gian.</p>
                      </div>
                      <div className={cx("faq-item")}>
                        <h4>Tại sao nên đa dạng hóa tiết kiệm?</h4>
                        <p>Đa dạng hóa giúp giảm thiểu rủi ro và tối ưu hóa lợi nhuận từ nhiều nguồn khác nhau.</p>
                      </div>
                      <div className={cx("faq-item")}>
                        <h4>Làm sao để duy trì kế hoạch tiết kiệm?</h4>
                        <p>Đặt mục tiêu rõ ràng, tạo thói quen và theo dõi tiến độ thường xuyên.</p>
                      </div>
                    </div>
                  </div>
                </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SavingCalculator;
