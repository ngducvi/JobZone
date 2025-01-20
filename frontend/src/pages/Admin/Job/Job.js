// Job.js
import { useEffect, useState } from "react";
import React from "react";
import classNames from "classnames/bind";
import styles from "./Job.module.scss";
import { adminApis, authAPI } from "~/utils/api";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";
const cx = classNames.bind(styles);

function Job() {
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [jobData, setJobData] = useState([]);
  const fetchData = async () => {
    const result = await authAPI().get(adminApis.getAllJobs, {
      params: { page: activePage },
    });
    setJobData(result.data.jobs);
    console.log("datatest", result.data.jobs);
    setTotalPages(result.data.totalPages);
  };
  useEffect(() => {
    fetchData();
  }, [activePage]);
  const handlePageClick = (page) => {
    setActivePage(page);
  };
  return (
    <div className={cx("wrapper")}>
        <div className={cx("table-wrapper")}>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Salary</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {jobData.map((job) => (
                        <tr key={job.id}>
                            <td>{job.id}</td>
                            <td>{job.title}</td>
                            <td>{job.description}</td>
                            <td>{job.salary}</td>
                            <td>{job.status}</td>
                            <td>
                                <button>Edit</button>
                                <button>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      <div className={cx("page-wrapper")}>
        <div className={cx("page-container")}>
          <div
            className={cx("page", "next-prev", { disabled: activePage === 1 })}
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
            className={cx("page", "next-prev", {
              disabled: activePage === totalPages,
            })}
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

export default Job;
