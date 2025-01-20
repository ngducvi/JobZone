import React from "react";
import PropTypes from "prop-types";
import style from "./DetailModal.module.scss";
import classNames from "classnames/bind";
import ReactMarkdown from "react-markdown";

const cx = classNames.bind(style);

const DetailModal = ({ content, title, onClose }) => {
  return (
    <div className={cx("detail-modal")}>
      <div className={cx("modal-header")}>
        <h2>{title}</h2>
        <button onClick={onClose} className={cx("close-button")}>
          <i className="fa-solid fa-times"></i>
        </button>
      </div>
      <div className={cx("modal-body")}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};
