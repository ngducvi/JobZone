import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./Tools.module.scss";
import Background3D from "~/components/Background3D/Background3D";
import useScrollTop from '~/hooks/useScrollTop';
const cx = classNames.bind(styles);

const Tools = () => {
  const tools = [
    {
      id: 1,
      title: "Tính lương",
      description: "Công cụ tính lương Gross - Net và các khoản bảo hiểm",
      icon: "fas fa-money-bill-wave",
      path: "/tools/salary-calculator",
      color: "#4CAF50"
    },
    {
      id: 2,
      title: "Test DISC",
      description: "Trắc nghiệm tính cách DISC - Khám phá bản thân",
      icon: "fas fa-brain",
      path: "/tools/test-disc",
      color: "#2196F3"
    },
    {
      id: 3,
      title: "Tính lãi kép",
      description: "Công cụ tính lãi kép cho các khoản đầu tư",
      icon: "fas fa-chart-line",
      path: "/tools/compound-interest-calculator",
      color: "#FF9800"
    },
    {
      id: 4,
      title: "Tính tiền tiết kiệm",
      description: "Lập kế hoạch tiết kiệm và tính toán mục tiêu tài chính",
      icon: "fas fa-piggy-bank",
      path: "/tools/saving-calculator",
      color: "#E91E63"
    }
  ];
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
        <div className={cx("container")}>
          <div className={cx("header")}>
            <h1>Công cụ hỗ trợ</h1>
            <p>Các công cụ hữu ích giúp bạn trong công việc và cuộc sống</p>
          </div>

          <div className={cx("tools-grid")}>
            {tools.map((tool) => (
              <Link to={tool.path} key={tool.id} className={cx("tool-card")} style={{"--card-color": tool.color}}>
                <div className={cx("tool-icon")}>
                  <i className={tool.icon}></i>
                </div>
                <div className={cx("tool-content")}>
                  <h3>{tool.title}</h3>
                  <p>{tool.description}</p>
                </div>
                <div className={cx("tool-arrow")}>
                  <i className="fas fa-arrow-right"></i>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Tools;
