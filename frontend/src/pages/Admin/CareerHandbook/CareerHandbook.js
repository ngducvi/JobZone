import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { useLocation } from "react-router-dom";
import styles from "./CareerHandbook.module.scss";
import { adminApis, authAPI } from "~/utils/api";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";


const cx = classNames.bind(styles);

function CareerHandbook() {
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [careerHandbooks, setCareerHandbooks] = useState([]);
  const fetchData = async () => {
    const result = await authAPI().get(adminApis.getAllCareerHandbooks, {
      params: { page: activePage },
    });
    setCareerHandbooks(result.data.careerHandbooks);
    console.log(result.data.careerHandbooks);
    setTotalPages(result.data.totalPages);
  };
  useEffect(() => {
    fetchData();
  }, [activePage]);
  return (
    <div>
      <h1>Career Handbook</h1>
      <div className={cx('table')}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {careerHandbooks.map((careerHandbook) => (
              <tr key={careerHandbook.post_id}>
                <td>{careerHandbook.title}</td>
                <td>{careerHandbook.content}</td>
                <td>
                  <button>Edit</button>
                  <button>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CareerHandbook;
