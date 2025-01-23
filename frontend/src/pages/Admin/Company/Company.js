import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { useLocation } from "react-router-dom";
import styles from "./Company.module.scss";
import { adminApis, authAPI } from "~/utils/api";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";

const cx = classNames.bind(styles);

function Company() {
    const [activePage, setActivePage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [companyData, setCompanyData] = useState([]);
    // get all companies getAllCompanies
    const fetchData = async () => {
        const result = await authAPI().get(adminApis.getAllCompanies, {
            params: { page: activePage },
        });
        setCompanyData(result.data.companies);
        console.log(result.data.companies);
        setTotalPages(result.data.totalPages);
    };
    useEffect(() => {
        fetchData();
    }, [activePage]);
  return <div>
    <h1>Company</h1>
  </div>;
}

export default Company;
