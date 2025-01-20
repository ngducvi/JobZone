import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { useLocation } from "react-router-dom";
import styles from "./Candidate.module.scss";
import { adminApis, authAPI } from "~/utils/api";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";

const cx = classNames.bind(styles);

function Candidate() {
    const [activePage, setActivePage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [candidateData, setCandidateData] = useState([]);
    // get all candidates
    const fetchData = async () => {
        const result = await authAPI().get(adminApis.getAllCandidates, {
            params: { page: activePage },
        });
        setCandidateData(result.data.candidates);
        setTotalPages(result.data.totalPages);
        console.log(result.data.candidates);
    };
    useEffect(() => {
        fetchData();
    }, [activePage]);


  return <div>
    <h1>Candidate</h1>
  </div>;
}

export default Candidate;
