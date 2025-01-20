import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { useLocation } from "react-router-dom";
import styles from "./Recruiter.module.scss";
import { adminApis, authAPI } from "~/utils/api";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";

const cx = classNames.bind(styles);

function Recruiter() {
    const [activePage, setActivePage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [recruiterData, setRecruiterData] = useState([]);
    // get all recruiter
    const fetchData = async () => {
        const result = await authAPI().get(adminApis.getAllRecruiterCompanies, {
            params: { page: activePage },
        });
        setRecruiterData(result.data.recruiterCompanies);
        setTotalPages(result.data.totalPages);
        console.log(result.data.recruiterCompanies);
    };
    useEffect(() => {
        fetchData();
    }, [activePage]);
   
  return <div>
    <h1>Recruiter</h1>
  </div>;
}

export default Recruiter;
