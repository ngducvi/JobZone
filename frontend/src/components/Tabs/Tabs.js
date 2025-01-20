import React from "react";
import classNames from "classnames/bind";
import styles from "./Tabs.module.scss";
const cx = classNames.bind(styles);

const Tab = ({ active, onClick, children }) => {
  return (
    <button
      className={cx("tab", { active })}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const Tabs = ({ children }) => {
  return (
    <div className={cx("tabs")}>
      <div className={cx("tab-header")}>
        {children}
      </div>
    </div>
  );
};

Tabs.Tab = Tab;

export default Tabs;