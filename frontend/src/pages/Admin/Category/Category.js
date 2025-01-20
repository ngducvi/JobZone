import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { useLocation } from "react-router-dom";
import styles from "./Category.module.scss";
import { adminApis, authAPI } from "~/utils/api";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";

const cx = classNames.bind(styles);

function Category() {
    const [activePage, setActivePage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [categoryData, setCategoryData] = useState([]);
    // get all categories
    const fetchData = async () => {
        const result = await authAPI().get(adminApis.getAllCategories, {
            params: { page: activePage },
        });
        setCategoryData(result.data.categories);
        console.log(result.data.categories);
        setTotalPages(result.data.totalPages);
    };
    useEffect(() => {
        fetchData();
    }, [activePage]);
  
  return <div>
    <h1>Category</h1>
  </div>;
}

export default Category;
