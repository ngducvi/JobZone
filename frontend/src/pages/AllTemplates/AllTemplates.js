import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./AllTemplates.module.scss";
import Card from "../Dashboard/Card";
import useAgeServices from "~/services/useAgeServices";

const cx = classNames.bind(styles);

const categories = [
  { name: "Tất cả", count: 22, color: "purple" },
  { name: "Nội dung", count: 5, color: "green" },
  { name: "Trang web", count: 4, color: "dark" },
  { name: "Marketing", count: 8, color: "blue" },
  { name: "Mạng xã hội", count: 3, color: "primary" },
  { name: "Video", count: 2, color: "red" },
];

const AllTemplates = () => {
  const [allTemplates, setAllTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectItem, setSelectItem] = useState("Tất cả");
  const [isLoading, setIsLoading] = useState(true); // Thêm trạng thái loading

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Bắt đầu tải dữ liệu
      try {
        const allCategories = await useAgeServices.getAllCategories();
        setAllTemplates(allCategories.categories);
        setFilteredTemplates(allCategories.categories);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false); // Kết thúc tải dữ liệu
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = allTemplates.filter(
      (template) =>
        template.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        template.type.toLowerCase().includes(lowerCaseSearchTerm)
    );
    setFilteredTemplates(filtered);
  }, [searchTerm, allTemplates]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);

    if (category.name === "Tất cả") {
      setFilteredTemplates(allTemplates);
      setSelectItem("Tất cả");
    } else {
      const filtered = allTemplates.filter(
        (template) => template.type === category.color
      );
      setFilteredTemplates(filtered);
      setSelectItem(category.name);
    }
  };

  return (
    <div className={cx("wrapper", "container")}>
      <div className={cx("categories-container")}>
        <div>
          <h2 className={cx("title")}>Templates</h2>
        </div>
        <div className={cx("search-container")}>
          <input
            type="text"
            className={cx("search-input")}
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div
          className={cx(
            "categories-list",
            "d-flex",
            "justify-content-around",
            "flex-wrap"
          )}
        >
          {categories.map((category, index) => (
            <div
              key={index}
              className={cx(
                "category-item",
                "d-flex",
                "align-items-center",
                "justify-content-center",
                "mt-2",
                {
                  active:
                    selectedCategory && selectedCategory.name === category.name,
                }
              )}
              onClick={() => handleCategoryClick(category)}
            >
              <span className={cx("category-name")}>{category.name}</span>
              <span className={cx("category-count", `bg-${category.color}`)}>
                {category.count}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="col-lg-12 p-4 mt-3">
          <span
            className={cx("badge-green", "badge p-2")}
            style={{
              backgroundColor:
                selectItem === "Nội dung"
                  ? "#00b894"
                  : selectItem === "Trang web"
                  ? "black"
                  : selectItem === "Marketing"
                  ? "#117a8b"
                  : selectItem === "Mạng xã hội"
                  ? "#195a97"
                  : selectItem === "Video"
                  ? "#dc3545"
                  : "#6F42C1",
              color: "white",
            }}
          >
            {selectItem}
          </span>
        </div>
      </div>
      <div className="container-alltemplates">
        <div className="row">
          {isLoading ? ( // Hiển thị trạng thái loading
            <div className="col-12 text-center">
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : filteredTemplates.length > 0 ? (
            filteredTemplates.map((template, index) => (
              <div key={index} className="col-sm-12 col-md-6 col-lg-4 mb-4">
                <Card
                  type={template.type}
                  title={template.title}
                  to={`/templates/custom/${template.slug}`}
                  icon={<i className={template.icon}></i>}
                />
              </div>
            ))
          ) : (
            <div className="col-12 text-center">
              <p>Không tìm thấy kết quả phù hợp.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllTemplates;
