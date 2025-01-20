import classNames from "classnames/bind";

import styles from "./DefaultLayout.module.scss";
import Header from "~/components/Layouts/components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import userServices from "~/services/userServices";
import { Link } from "react-router-dom";

const cx = classNames.bind(styles);
function DefaultLayout({ children }) {
  const [balance, setBalance] = useState(0);

  const token = localStorage.getItem("token");

  // useEffect(() => {
  //   const getBalance = async () => {
  //     try {
  //       const res = await userServices.getBalance();
  //       setBalance(res);
  //     } catch (error) {
  //       console.error("Failed to fetch data:", error);
  //     }
  //   };
  //   if (token) {
  //     getBalance();
  //   }
  // }, [token]);
  // const updateBalance = async () => {
  //   try {
  //     const res = await userServices.getBalance();
  //     setBalance(res);
  //   } catch (error) {
  //     console.error("Failed to fetch data:", error);
  //   }
  // };
  
  return (
    <div className={cx("wrapper")}>
      <Header />
      <div className={cx("container")}>
        <Sidebar />
        <div className={cx("content")}>{children}</div>
      </div>
      <Footer />
    </div>
  );
}

export default DefaultLayout;
