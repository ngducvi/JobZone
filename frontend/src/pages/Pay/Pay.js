import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { useLocation } from "react-router-dom";
import styles from "./Pay.module.scss";
import { adminApis, authAPI, userApis } from "~/utils/api";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";

const cx = classNames.bind(styles);

const Pay = () => {
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(queryParams.get("page")) || 1;

  const [activePage, setActivePage] = useState(pageFromUrl);
  const [totalPages, setTotalPages] = useState(1);
  const [paymentData, setPaymentData] = useState([]);

  const handlePageClick = (pageNumber) => {
    setActivePage(pageNumber);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await authAPI().get(userApis.getAllTransactions, {
          params: {
            page: activePage,
          },
        });
        console.log(result.data);
        setPaymentData(result.data.paymentTransactions);
        setTotalPages(result.data.totalPages);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [activePage]);

  return (
    <div className={cx("pay-container")}>
      <h1 className={cx("title")}>Thanh toán</h1>
      <table className={cx("user-table")}>
        <thead>
          <tr>
            <th>STT</th>
            <th>ID hoá đơn</th>
            <th>Tiền</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
          </tr>
        </thead>
        <tbody>
          {paymentData.length > 0 ? (
            paymentData.map((data, index) => (
              <tr key={data?.id}>
                <td>{index + 1}</td>
                <td>{data?.id}</td>

                <td>{data?.amount}</td>

                <td>{data?.status === "success" ? "Thành công" : "Thất bại"}</td>
                <td>
                  {data?.transaction_date
                    ? new Date(data?.transaction_date).toLocaleString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "N/A"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
                Không có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className={cx("page-wrapper")}>
        <div className={cx("page-container")}>
          <div
            className={cx("page", { disabled: activePage === 1 })}
            onClick={() => activePage > 1 && handlePageClick(activePage - 1)}
          >
            <PrevPageIcon />
          </div>
          {[...Array(totalPages)].map((_, pageNumber) => (
            <div
              key={pageNumber + 1}
              className={cx("page", {
                active: activePage === pageNumber + 1,
              })}
              onClick={() => handlePageClick(pageNumber + 1)}
            >
              {pageNumber + 1}
            </div>
          ))}
          <div
            className={cx("page", { disabled: activePage === totalPages })}
            onClick={() =>
              activePage < totalPages && handlePageClick(activePage + 1)
            }
          >
            <NextPageIcon />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pay;
