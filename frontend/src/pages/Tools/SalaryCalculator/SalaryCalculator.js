// page salary calculator

import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./SalaryCalculator.module.scss";
import Background3D from "~/components/Background3D/Background3D";
import { Link } from "react-router-dom";
import { authAPI, userApis } from "~/utils/api";
import useScrollTop from '~/hooks/useScrollTop';
import images from "~/assets/images";

const cx = classNames.bind(styles);

function SalaryCalculator() {
  const [currency, setCurrency] = useState("VND");
  const [insuranceType, setInsuranceType] = useState("official"); // official | other
  const [isUnion, setIsUnion] = useState(false);
  const [region, setRegion] = useState("Vùng 1");
  const [dependents, setDependents] = useState(0);

  const [salaryInput, setSalaryInput] = useState({
    grossSalary: "",
    allowance: "",
  });

  const [selectedRegionData, setSelectedRegionData] = useState({
    giatritoithieu: 4960000,
    muctranbhxh: 88400000,
    giamtrucanhan: 11000000,
  });

  const [calculationResult, setCalculationResult] = useState({
    grossSalary: 0,
    loailaodong: "Đã qua đào tạo",
    bhxh: 0,
    bhyt: 0,
    bhtn: 0,
    congdoan: 0,
    giamtrucanhan: 0,
    giamtruphuthuoc: 0,
    thunhapchiuthue: 0,
    thueTNCN: 0,
    netSalary: 0,
    trocap: 0,
    tongthunhap: 0,
  });

  // Thêm state để quản lý việc mở/đóng câu hỏi
  const [openQuestion, setOpenQuestion] = useState(null);

  // Thêm dữ liệu FAQ
  const faqData = [
    {
      id: 1,
      question: "Lương Gross là gì?",
      answer: "Lương Gross là tổng số tiền mà người lao động nhận được trước khi trừ các khoản thuế, bảo hiểm, phụ cấp và các chi phí khác. Đây là số tiền thường được đưa ra khi đàm phán về mức lương và được thông báo trong hợp đồng lao động."
    },
    {
      id: 2,
      question: "Lương Net là gì?",
      answer: "Lương Net là lương thực nhận của người lao động sau khi đã trừ hết các khoản bảo hiểm, thuế thu nhập cá nhân và các chi phí khấu trừ khác. Lương Net sẽ thấp hơn lương Gross do phải trừ đi các khoản thuế phí."
    },
    {
      id: 3,
      question: "Công thức tính lương Gross là gì?",
      answer: "Lương Gross = Lương cơ bản + Thưởng + Thuế thu nhập cá nhân + Bảo hiểm xã hội + Bảo hiểm y tế + Bảo hiểm thất nghiệp + Các khoản chi phí khác"
    },
    {
      id: 4,
      question: "Công thức tính lương Net là gì?",
      answer: "Lương Net = Tổng thu nhập - (Thuế thu nhập cá nhân + Bảo hiểm xã hội + Bảo hiểm y tế + Bảo hiểm thất nghiệp + Các khoản khấu trừ khác)"
    },
    {
      id: 5,
      question: "Cách tính lương Gross sang Net?",
      answer: "Sau khi trừ đi các khoản phí và thuế trên lương Gross, ta sẽ thu được tiền lương Net. Công thức chung để tính lương Gross sang Net là: Lương Net = Lương Gross - (Thuế thu nhập cá nhân + Bảo hiểm xã hội + Bảo hiểm y tế + Bảo hiểm thất nghiệp + Các khoản khấu trừ khác)"
    },
    {
      id: 6,
      question: "Cách quy đổi lương Net sang Gross?",
      answer: "Để quy đổi lương Net sang lương Gross, ta cần tính toàn lại các khoản phí và thuế để bù trừ từ lương Gross. Công thức quy đổi từ lương Net sang lương Gross như sau: Lương Gross = Lương Net + Thuế thu nhập cá nhân + Bảo hiểm xã hội + Bảo hiểm y tế + Bảo hiểm thất nghiệp + Các khoản chi phí khác"
    }
  ];
  // Thêm useEffect để scroll lên đầu trang
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []); // Empty dependency array means this runs once when component mounts
  // Thêm state cho tin tức
  const [relatedNews, setRelatedNews] = useState([]);

  // Thêm useEffect để fetch tin tức
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await authAPI().get(userApis.getCareerHandbookByCategoryId(3));
        setRelatedNews(response.data.careerHandbook.slice(0, 3));
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };
    fetchNews();
  }, []);

  // Thêm hiệu ứng loading khi tính toán
  const [isCalculating, setIsCalculating] = useState(false);

  // Thêm state cho tỷ giá USD
  const [usdRate, setUsdRate] = useState(24890);

  // Thêm state cho giá trị USD
  const [usdValue, setUsdValue] = useState("");

  // Cập nhật phần xử lý khi chọn currency
  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
    setSalaryInput({
      grossSalary: "",
      allowance: "",
    });
    setUsdValue("");
  };

  // Thêm hàm xử lý khi nhập USD
  const handleUsdChange = (value) => {
    setUsdValue(value);
    setSalaryInput({
      ...salaryInput,
      grossSalary: value * usdRate,
    });
  };

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const grossSalary = Number(salaryInput.grossSalary);
      const allowance = Number(salaryInput.allowance);

      // Tính các khoản bảo hiểm
      const bhxhAmount = Math.min(grossSalary * 0.08, selectedRegionData.muctranbhxh * 0.08);
      const bhytAmount = Math.min(grossSalary * 0.015, selectedRegionData.muctranbhxh * 0.015);
      const bhtnAmount = Math.min(grossSalary * 0.01, selectedRegionData.muctranbhxh * 0.01);
      const congdoanAmount = isUnion ? Math.min(grossSalary * 0.01, selectedRegionData.muctranbhxh * 0.01) : 0;

      // Tổng các khoản bảo hiểm
      const totalInsurance = bhxhAmount + bhytAmount + bhtnAmount + congdoanAmount;

      // Tính giảm trừ
      const giamTruCaNhan = selectedRegionData.giamtrucanhan;
      const giamTruPhuThuoc = dependents * 4400000;
      
      // Tính thu nhập chịu thuế
      const thuNhapChiuThue = grossSalary - totalInsurance - giamTruCaNhan - giamTruPhuThuoc;

      // Tính thuế TNCN theo biểu lũy tiến
      let thueTNCN = 0;
      if (thuNhapChiuThue > 0) {
        if (thuNhapChiuThue <= 5000000) {
          thueTNCN = thuNhapChiuThue * 0.05;
        } else if (thuNhapChiuThue <= 10000000) {
          thueTNCN = 5000000 * 0.05 + (thuNhapChiuThue - 5000000) * 0.1;
        } else if (thuNhapChiuThue <= 18000000) {
          thueTNCN = 5000000 * 0.05 + 5000000 * 0.1 + (thuNhapChiuThue - 10000000) * 0.15;
        } else if (thuNhapChiuThue <= 32000000) {
          thueTNCN = 5000000 * 0.05 + 5000000 * 0.1 + 8000000 * 0.15 + (thuNhapChiuThue - 18000000) * 0.2;
        } else if (thuNhapChiuThue <= 52000000) {
          thueTNCN = 5000000 * 0.05 + 5000000 * 0.1 + 8000000 * 0.15 + 14000000 * 0.2 + (thuNhapChiuThue - 32000000) * 0.25;
        } else if (thuNhapChiuThue <= 80000000) {
          thueTNCN = 5000000 * 0.05 + 5000000 * 0.1 + 8000000 * 0.15 + 14000000 * 0.2 + 20000000 * 0.25 + (thuNhapChiuThue - 52000000) * 0.3;
        } else {
          thueTNCN = 5000000 * 0.05 + 5000000 * 0.1 + 8000000 * 0.15 + 14000000 * 0.2 + 20000000 * 0.25 + 28000000 * 0.3 + (thuNhapChiuThue - 80000000) * 0.35;
        }
      }

      // Tính lương Net và tổng thu nhập
      const netSalary = grossSalary - totalInsurance - thueTNCN;
      const tongThuNhap = netSalary + allowance;

      // Cập nhật kết quả
      setCalculationResult({
        grossSalary,
        loailaodong: "Đã qua đào tạo",
        bhxh: bhxhAmount,
        bhyt: bhytAmount,
        bhtn: bhtnAmount,
        congdoan: congdoanAmount,
        giamtrucanhan: giamTruCaNhan,
        giamtruphuthuoc: giamTruPhuThuoc,
        thunhapchiuthue: thuNhapChiuThue,
        thueTNCN,
        netSalary,
        trocap: allowance,
        tongthunhap: tongThuNhap,
      });
      setIsCalculating(false);
    }, 800);
  };

  const handleRegionChange = (e) => {
    const selectedRegion = e.target.value;
    setRegion(selectedRegion);
    
    const regionData = datavung.find(item => item.name === selectedRegion);
    if (regionData) {
      setSelectedRegionData({
        giatritoithieu: regionData.giatritoithieu,
        muctranbhxh: regionData.muctranbhxh,
        giamtrucanhan: regionData.giamtrucanhan,
      });
    }
  };

  const datavung = [
    {
      name: "Vùng 1",
      giatritoithieu :4960000,
      muctranbhxh: 88400000,
      giamtrucanhan :11000000,
    },
    {
      name: "Vùng 2",
      giatritoithieu :4410000,
      muctranbhxh: 78400000,
      giamtrucanhan :11000000,
    },
    {
      name: "Vùng 3",
      giatritoithieu :3860000,
      muctranbhxh: 68600000,
      giamtrucanhan :11000000,
    },
    {
      name: "Vùng 4",
      giatritoithieu :3450000,
      muctranbhxh: 61400000,
      giamtrucanhan :11000000,
    },
  ];

  // Thêm hàm xử lý in
  const handlePrint = () => {
    const printContent = document.getElementById('salary-result');
    const WinPrint = window.open('', '', 'width=900,height=650');
    const currentDate = new Date().toLocaleString();
    
    WinPrint.document.write(`
      <html>
        <head>
          <title>Chi tiết lương VND</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #374151;
            }
            .print-content {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 32px;
              border-radius: 12px;
              box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
            }
            .print-header {
              text-align: center;
              margin-bottom: 32px;
              padding-bottom: 16px;
              border-bottom: 2px solid #e5e7eb;
            }
            .print-header h1 {
              font-size: 24px;
              color: #013a74;
              margin: 0 0 8px 0;
            }
            .print-header .date {
              font-size: 14px;
              color: #6b7280;
            }
            .result-item {
              display: flex;
              justify-content: space-between;
              padding: 12px 16px;
              border-bottom: 1px solid #e5e7eb;
            }
            .result-item:last-child {
              border-bottom: none;
            }
            .result-item.highlight {
              background: #f3f4f6;
              margin: 8px -16px;
              font-weight: 500;
            }
            .result-item.total {
              margin-top: 16px;
              padding-top: 16px;
              border-top: 2px solid #013a74;
              font-weight: 600;
              font-size: 16px;
              color: #013a74;
            }
            .result-item label {
              font-weight: 500;
            }
            .result-item span {
              font-family: monospace;
            }
            .print-footer {
              margin-top: 32px;
              padding-top: 16px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #6b7280;
              text-align: center;
            }
            @media print {
              body {
                padding: 0;
              }
              .print-content {
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-content">
            <div class="print-header">
              <h1>Chi tiết lương VND</h1>
              <div class="date">Ngày tính: ${currentDate}</div>
            </div>
            <div class="result-content">
              ${printContent.innerHTML}
            </div>
            <div class="print-footer">
              <p>* Những số này chỉ là ước tính thu nhập tạm thời hàng tháng.</p>
              <p>* Đơn vị tiền tệ tính bằng VND (Việt Nam Đồng).</p>
            </div>
          </div>
        </body>
      </html>
    `);

    WinPrint.document.close();
    WinPrint.focus();
    setTimeout(() => {
      WinPrint.print();
      WinPrint.close();
    }, 250);
  };

  return (
    <>
      <Background3D />
      <div className={cx("wrapper")}>
        <div className={cx("calculator-container")}>
          <div className={cx("calculator-header")}>
            <div className={cx("header-icon")}>
              <i className="fas fa-calculator"></i>
            </div>
            <h1 className={cx("title")}>Công cụ tính lương gross sang net</h1>
            <p className={cx("subtitle")}>Tính toán chi tiết các khoản lương, thuế và bảo hiểm của bạn</p>
          </div>

          <div className={cx("calculator-form")}>
            {/* Currency Selection */}
            <div className={cx("currency-selection")}>
              <label className={cx("radio-group")}>
                <input
                  type="radio"
                  name="currency"
                  checked={currency === "VND"}
                  onChange={() => handleCurrencyChange("VND")}
                />
                <span>VND</span>
              </label>
              <label className={cx("radio-group")}>
                <input
                  type="radio"
                  name="currency"
                  checked={currency === "USD"}
                  onChange={() => handleCurrencyChange("USD")}
                />
                <span>USD</span>
              </label>
            </div>

            {currency === "USD" && (
              <div className={cx("usd-converter")}>
                <div className={cx("converter-header")}>
                  <span>1 USD = {usdRate.toLocaleString()} VND</span>
                  <button 
                    className={cx("edit-rate")}
                    onClick={() => {
                      const newRate = prompt("Nhập tỷ giá USD/VND mới:", usdRate);
                      if (newRate && !isNaN(newRate)) {
                        setUsdRate(Number(newRate));
                      }
                    }}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                </div>
                <div className={cx("converter-inputs")}>
                  <div className={cx("input-group")}>
                    <label>
                      <i className="fas fa-dollar-sign"></i>
                      USD
                    </label>
                    <input
                      type="number"
                      value={usdValue}
                      onChange={(e) => handleUsdChange(e.target.value)}
                      placeholder="Nhập số tiền USD"
                    />
                  </div>
                  <div className={cx("converter-arrow")}>
                    <i className="fas fa-exchange-alt"></i>
                  </div>
                  <div className={cx("input-group")}>
                    <label>
                      <i className="fas fa-dong-sign"></i>
                      VND
                    </label>
                    <input
                      type="text"
                      value={salaryInput.grossSalary ? salaryInput.grossSalary.toLocaleString() : ""}
                      readOnly
                      placeholder="Số tiền VND"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Salary Inputs */}
            <div className={cx("input-group")}>
              <label>
                <i className="fas fa-money-bill-wave"></i>
                Tổng Lương
              </label>
              <div className={cx("input-wrapper")}>
                <input
                  type="number"
                  placeholder="Nhập mức lương tổng"
                  value={salaryInput.grossSalary}
                  onChange={(e) => setSalaryInput({ ...salaryInput, grossSalary: e.target.value })}
                />
                <span className={cx("currency-label")}>VND (Thu nhập chịu thuế)</span>
              </div>
            </div>

            <div className={cx("input-group")}>
              <label>
                <i className="fas fa-gift"></i>
                Trợ cấp
              </label>
              <div className={cx("input-wrapper")}>
                <input
                  type="number"
                  placeholder="Nhập trợ cấp"
                  value={salaryInput.allowance}
                  onChange={(e) => setSalaryInput({ ...salaryInput, allowance: e.target.value })}
                />
                <span className={cx("currency-label")}>VND (Không tính thuế)</span>
              </div>
            </div>

            {/* Insurance Options */}
            <div className={cx("section-title")}>
              <i className="fas fa-shield-alt"></i>
              BẢO HIỂM
            </div>
            <div className={cx("insurance-options")}>
              <label className={cx("radio-group")}>
                <input
                  type="radio"
                  name="insurance"
                  checked={insuranceType === "official"}
                  onChange={() => setInsuranceType("official")}
                />
                <span>Trên lương chính thức</span>
              </label>
              <label className={cx("radio-group")}>
                <input
                  type="radio"
                  name="insurance"
                  checked={insuranceType === "other"}
                  onChange={() => setInsuranceType("other")}
                />
                <span>Khác</span>
              </label>
            </div>

            {/* Insurance Rates */}
            <div className={cx("insurance-rates")}>
              <div className={cx("rate-item")}>
                <i className="fas fa-heartbeat"></i>
                <label>BHXH</label>
                <input type="text" value="8.0" readOnly />
                <span>%</span>
              </div>
              <div className={cx("rate-item")}>
                <i className="fas fa-hospital"></i>
                <label>BHYT</label>
                <input type="text" value="1.5" readOnly />
                <span>%</span>
              </div>
              <div className={cx("rate-item")}>
                <i className="fas fa-umbrella"></i>
                <label>Thất nghiệp</label>
                <input type="text" value="1.0" readOnly />
                <span>%</span>
              </div>
            </div>

            {/* Union Fee */}
            <div className={cx("union-fee")}>
              <label className={cx("checkbox-group")}>
                <input
                  type="checkbox"
                  checked={isUnion}
                  onChange={(e) => setIsUnion(e.target.checked)}
                />
                <span>Công đoàn</span>
              </label>
              {isUnion && (
                <div className={cx("rate-item")}>
                  <input type="text" value="1.0" readOnly />
                  <span>%</span>
                </div>
              )}
            </div>

            {/* Region Selection */}
            <div className={cx("input-group")}>
              <label>
                <i className="fas fa-map-marker-alt"></i>
                Vùng
              </label>
              <select value={region} onChange={handleRegionChange}>
                <option value="Vùng 1">Vùng 1</option>
                <option value="Vùng 2">Vùng 2</option>
                <option value="Vùng 3">Vùng 3</option>
                <option value="Vùng 4">Vùng 4</option>
              </select>
            </div>

            {/* Region Info */}
            <div className={cx("region-info")}>
              <div className={cx("info-item")}>
                <label>Giá trị tối thiểu của Vùng</label>
                <div className={cx("info-value")}>
                  <input type="text" value={selectedRegionData.giatritoithieu.toLocaleString()} readOnly />
                  <span className={cx("currency-label")}>VND</span>
                </div>
              </div>
              <div className={cx("info-item")}>
                <label>Mức trần BHTN</label>
                <div className={cx("info-value")}>
                  <input type="text" value={selectedRegionData.muctranbhxh.toLocaleString()} readOnly />
                  <span className={cx("currency-label")}>VND</span>
                </div>
              </div>
              <div className={cx("info-item")}>
                <label>Giảm trừ cá nhân</label>
                <div className={cx("info-value")}>
                  <input type="text" value={selectedRegionData.giamtrucanhan.toLocaleString()} readOnly />
                  <span className={cx("currency-label")}>VND</span>
                </div>
              </div>
            </div>

            {/* Dependents */}
            <div className={cx("input-group")}>
              <label>
                <i className="fas fa-users"></i>
                Số người phụ thuộc
              </label>
              <input
                type="number"
                min="0"
                value={dependents}
                onChange={(e) => setDependents(e.target.value)}
              />
            </div>

            {/* Calculate Button */}
            <button 
              className={cx("calculate-button", { calculating: isCalculating })} 
              onClick={handleCalculate}
              disabled={isCalculating}
            >
              {isCalculating ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  ĐANG TÍNH TOÁN...
                </>
              ) : (
                <>
                  <i className="fas fa-calculator"></i>
                  TÍNH LƯƠNG NET
                </>
              )}
            </button>

            {/* Calculation Results */}
            {calculationResult.netSalary > 0 && (
              <div className={cx("calculation-results")}>
                <div className={cx("result-header")}>
                  <h2>Chi tiết lương VND</h2>
                  <div className={cx("result-actions")}>
                    <button className={cx("action-button")} onClick={handlePrint}>
                      <i className="fas fa-print"></i>
                      In
                    </button>
                    <button className={cx("action-button")}>
                      <i className="fas fa-download"></i>
                      Tải về
                    </button>
                  </div>
                </div>
                <div id="salary-result" className={cx("result-details")}>
                  <div className={cx("result-item")}>
                    <label>Lương GROSS</label>
                    <span>{calculationResult.grossSalary.toLocaleString()}</span>
                  </div>
                  <div className={cx("result-item")}>
                    <label>Loại lao động</label>
                    <span>{calculationResult.loailaodong}</span>
                  </div>
                  <div className={cx("result-item")}>
                    <label>BHXH</label>
                    <span>-{calculationResult.bhxh.toLocaleString()}</span>
                  </div>
                  <div className={cx("result-item")}>
                    <label>BHYT</label>
                    <span>-{calculationResult.bhyt.toLocaleString()}</span>
                  </div>
                  <div className={cx("result-item")}>
                    <label>Bảo hiểm thất nghiệp</label>
                    <span>-{calculationResult.bhtn.toLocaleString()}</span>
                  </div>
                  {isUnion && (
                    <div className={cx("result-item")}>
                      <label>Phí công đoàn</label>
                      <span>-{calculationResult.congdoan.toLocaleString()}</span>
                    </div>
                  )}
                  <div className={cx("result-item")}>
                    <label>Giảm trừ cá nhân</label>
                    <span>-{calculationResult.giamtrucanhan.toLocaleString()}</span>
                  </div>
                  <div className={cx("result-item")}>
                    <label>Giảm trừ gia cảnh</label>
                    <span>-{calculationResult.giamtruphuthuoc.toLocaleString()}</span>
                  </div>
                  <div className={cx("result-item highlight")}>
                    <label>Thu nhập chịu thuế</label>
                    <span>{calculationResult.thunhapchiuthue.toLocaleString()}</span>
                  </div>
                  <div className={cx("result-item")}>
                    <label>Thuế thu nhập cá nhân</label>
                    <span>-{calculationResult.thueTNCN.toLocaleString()}</span>
                  </div>
                  <div className={cx("result-item highlight")}>
                    <label>Lương NET (Thu nhập sau thuế)</label>
                    <span>{calculationResult.netSalary.toLocaleString()}</span>
                  </div>
                  <div className={cx("result-item")}>
                    <label>Trợ cấp</label>
                    <span>{calculationResult.trocap.toLocaleString()}</span>
                  </div>
                  <div className={cx("result-item total")}>
                    <label>Tổng thu nhập</label>
                    <span>{calculationResult.tongthunhap.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className={cx("notes")}>
              <p>Ghi chú:</p>
              <ul>
                <li>- Những số này chỉ là ước tính thu nhập tạm thời hàng tháng.</li>
                <li>- Đơn vị tiền tệ tính bằng VND (Việt Nam Đồng).</li>
              </ul>
            </div>
          </div>

          {/* FAQ Section */}
          <div className={cx("faq-section")}>
            <h2>Các câu hỏi thường gặp</h2>
            <div className={cx("faq-list")}>
              {faqData.map((faq) => (
                <div key={faq.id} className={cx("faq-item")}>
                  <div 
                    className={cx("faq-question", { active: openQuestion === faq.id })}
                    onClick={() => setOpenQuestion(openQuestion === faq.id ? null : faq.id)}
                  >
                    <i className="fas fa-question-circle"></i>
                    {faq.question}
                    <i className={`fas fa-chevron-${openQuestion === faq.id ? 'up' : 'down'}`}></i>
                  </div>
                  {openQuestion === faq.id && (
                    <div className={cx("faq-answer")}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Related News Section */}
          <div className={cx("related-news")}>
            <h2>Tin tức về lương thưởng</h2>
            <div className={cx("news-grid")}>
              {relatedNews.map((news) => (
                <div key={news.post_id} className={cx("news-card")}>
                  <div className={cx("news-image")}>
                    <img src={news.image || images.cat1} alt={news.title} />
                    <div className={cx("category-badge")}>Chế độ lương thưởng</div>
                  </div>
                  <div className={cx("news-content")}>
                    <h3>{news.title}</h3>
                    <p>{news.content}</p>
                    <div className={cx("news-meta")}>
                      <span>
                        <i className="far fa-calendar-alt"></i>
                        {new Date(news.created_at).toLocaleDateString()}
                      </span>
                      <span>
                        <i className="far fa-user"></i>
                        {news.created_by}
                      </span>
                    </div>
                    <Link to={`/career-handbook/compensation/${news.post_id}`} className={cx("read-more")}>
                      Xem thêm
                      <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SalaryCalculator;
