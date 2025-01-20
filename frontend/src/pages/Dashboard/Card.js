import React from "react";
import classNames from "classnames/bind";

import styles from "./Card.module.scss";
import { Link } from "react-router-dom";

const cx = classNames.bind(styles);

const Card = ({ title, to, icon, type }) => {
  return (
    <Link to={to}>
      <div className={cx("card", type)}>
        <span>{icon}</span>
        <h3>{title}</h3>
      </div>
    </Link>
  );
};

export default Card;
