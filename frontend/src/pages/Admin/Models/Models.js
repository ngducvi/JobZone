import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { useLocation } from "react-router-dom";
import styles from "./Models.module.scss";
import { adminApis, authAPI } from "~/utils/api";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";
import Button from "~/components/Button";

const cx = classNames.bind(styles);

function Models() {
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(queryParams.get("page")) || 1;

  const [activePage, setActivePage] = useState(pageFromUrl);
  const [totalPages, setTotalPages] = useState(1);
  const [userData, setUserData] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [editValues, setEditValues] = useState({});

  // Sorting states
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handlePageClick = (pageNumber) => {
    setActivePage(pageNumber);
  };

  const handleEditClick = (id) => {
    setEditRow(id);
    const row = userData.find((user) => user.id === id);
    setEditValues({
      input_rate: row.input_rate || "",
      output_rate: row.output_rate || "",
    });
  };

  const handleInputChange = (field) => (e) => {
    setEditValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCancelEdit = () => {
    setEditRow(null);
    setEditValues({});
  };

  const handleUpdate = async (id) => {
    try {
      await authAPI().put(adminApis.updateModel(id), editValues);
      setUserData((prevData) =>
        prevData.map((user) =>
          user.id === id
            ? {
                ...user,
                input_rate: editValues.input_rate,
                output_rate: editValues.output_rate,
              }
            : user
        )
      );
      setEditRow(null);
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  


  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await authAPI().get(adminApis.getAllModels, {
          params: { page: activePage },
        });
        setUserData(result.data.models);
        setTotalPages(result.data.totalPages);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [activePage]);

  return (
    <div>
      <div className="d-flex  align-items-center">
        <i
          className="fa-solid fa-hexagon-nodes-bolt"
          style={{
            fontSize: "2.5rem",
            color: "var(--primary-color)",
            marginRight: "8px",
          }}
          aria-hidden="true"
        ></i>
        <h1 className={cx("icon-h1")}>Mô hình AI</h1>
      </div>

      <table className={cx("user-table")}>
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên</th>
            <th>Tỉ lệ mặc định đầu vào</th>
            <th>Tỉ lệ mặc định đầu ra</th>
            <th >
              Tỉ lệ đầu vào
             
            </th>
            <th >
              Tỉ lệ đầu ra
            </th>
            
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          { userData?.length > 0 ? (
            userData?.map((user, index) => (
              <tr key={user?.id}>
                <td>{index + 1}</td>
                <td>{user?.name}</td>
                <td>
                  {user?.default_input_rate || "N/A"}
                </td>
                <td>{user?.default_output_rate || "N/A"}</td>
                <td>
                  {editRow === user.id ? (
                    <input
                      type="number"
                      value={editValues.input_rate}
                      onChange={handleInputChange("input_rate")}
                    />
                  ) : (
                    user?.input_rate || "null"
                  )}
                </td>
                <td>
                  {editRow === user.id ? (
                    <input
                      type="number"
                      value={editValues.output_rate}
                      onChange={handleInputChange("output_rate")}
                    />
                  ) : (
                    user?.output_rate || "null"
                  )}
                </td>
                <td className="d-flex justify-content-center align-items-center">
                  {editRow === user.id ? (
                    <>
                      <Button primary onClick={() => handleUpdate(user.id)}>
                        <i className="fa-solid fa-check"></i>
                      </Button>
                      <Button outline onClick={handleCancelEdit}>
                        <i className="fa-solid fa-x"></i>
                      </Button>
                    </>
                  ) : (
                    <Button outline onClick={() => handleEditClick(user.id)}>
                      <i className="fa-solid fa-pen-to-square"></i>
                    </Button>
                  )}
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
              className={cx("page", { active: activePage === pageNumber + 1 })}
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
}

export default Models;
