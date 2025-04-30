import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import classNames from "classnames/bind";
import styles from "./ResultPrompt.module.scss";
import Modal from "~/components/Modal";
import DetailContent from "~/pages/CreatedContent/DetailContent";
import Button from "../Button";
const cx = classNames.bind(styles);

function ResultPrompt({ content, loading, quickView, contentId }) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null); // state lưu id content đã chọn

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    });
  };

  const handleQuickViewClick = (id) => {
    setSelectedId(id); // lưu id vào state khi click vào quick view
    setIsModalOpen(true); // mở modal
  };

  const renderContent = () => {
    if (content.startsWith("http") && /\.(jpg|jpeg|png|gif)$/i.test(content)) {
      return <img src={content} alt="Result content" />;
    } else if (content.startsWith("http") && /\.(mp3|wav)$/i.test(content)) {
      return (
        <audio controls>
          <source src={content} type="audio/mpeg" />
          Trình duyệt của bạn không hỗ trợ phát âm thanh.
        </audio>
      );
    } else {
      return (
        <ReactMarkdown
          className={cx("main-results", { quickView })}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {content.startsWith("http") ? `![Alt text](${content})` : content}
        </ReactMarkdown>
      );
    }
  };

  return (
    <div className={cx("seoResult")}>
      <div className={cx("resultHeader")}>
        <h2 className=" text-center">KẾT QUẢ</h2>
        {content && !copySuccess && !quickView && (
          <i className="fa-regular fa-copy" onClick={handleCopy}></i>
        )}
        {copySuccess && !quickView && (
          <p className={cx("copySuccess")}>
            <i className="fa-solid fa-check"></i> Đã sao chép!
          </p>
        )}
        {quickView && (
          <Button onClick={() => handleQuickViewClick(contentId)} outline>
            Xem chi tiết
          </Button>
        )}
      </div>
      {isModalOpen && (
        <Modal isAdmin onClose={() => setIsModalOpen(false)}>
          <DetailContent id={selectedId || contentId} />
        </Modal>
      )}
      {content ? (
        <div>{renderContent()}</div>
      ) : loading ? (
        <i className="fa-solid fa-circle"></i>
      ) : (
        <p className={cx("placeholder")}>
          Bắt đầu bằng cách điền vào biểu mẫu bên trên.
        </p>
      )}
    </div>
  );
}

export default ResultPrompt;
