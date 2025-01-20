import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { useLocation, Link, useParams } from "react-router-dom";
import styles from "./CareerHandbook.module.scss";
import { adminApis, authAPI, userApis } from "~/utils/api";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";
import { TRUE } from "sass";

const cx = classNames.bind(styles);

const CATEGORIES = {
  1: { name: "Định hướng nghề nghiệp", icon: "fa-compass" },
  2: { name: "Bí kíp tìm việc", icon: "fa-magnifying-glass" },
  3: { name: "Chế độ lương thưởng", icon: "fa-sack-dollar" },
  4: { name: "Kiến thức chuyên ngành", icon: "fa-graduation-cap" },
  5: { name: "Hành trang nghề nghiệp", icon: "fa-briefcase" },
  6: { name: "Thị trường và xu hướng tuyển dụng", icon: "fa-chart-line" },
};

function CareerHandbook() {
    const [activePage, setActivePage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
  const [featuredPosts, setFeaturedPosts] = useState([]);
    const [careerHandbookData, setCareerHandbookData] = useState([]);
  const [featuredCareerHandbookData, setFeaturedCareerHandbookData] = useState(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

    const fetchData = async () => {
    try {
      // Fetch featured posts
      const featuredResult = await authAPI().get(
        userApis.getAllFeaturedCareerHandbooks
      );
      setFeaturedCareerHandbookData(featuredResult.data.careerHandbook);

      // Fetch normal posts with pagination, sort and filter
      let params = {
        page: activePage,
        sortBy: sortBy,
      };

      if (selectedCategory !== "all") {
        params.category_id = selectedCategory;
      }

      const result = await authAPI().get(userApis.getAllCareerHandbooks, {
        params,
      });
      setCareerHandbookData(result.data.careerHandbook);
        setTotalPages(result.data.totalPages);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    };

    useEffect(() => {
        fetchData();
  }, [activePage, selectedCategory, sortBy]);

  const handlePageClick = (page) => {
    setActivePage(page);
  };

  return (
    <div className={cx("wrapper")}>
      <div className={cx("header")}>
        <h1>Cẩm nang nghề nghiệp</h1>
        <p>Kiến thức hữu ích cho sự nghiệp của bạn</p>
      </div>

      {/* Featured Posts */}
      {featuredCareerHandbookData.length > 0 && (
        <div className={cx("featured-section")}>
          <h1>Bài viết nổi bật</h1>
          <div className={cx("featured-grid")}>
            {featuredCareerHandbookData.map((article) => (
              <div key={article.post_id} className={cx("featured-card")}>
                <div className={cx("featured-image")}>
                  <img src="https://placehold.co/600x400" alt={article.title} />
                  <div className={cx("featured-tag")}>Nổi bật</div>
                </div>
                <div className={cx("featured-content")}>
                  <h2>{article.title}</h2>
                  <p>{article.content}</p>
                  <div className={cx("meta-info")}>
                    <span className={cx("meta-item")}>
                      <i className="far fa-calendar-alt"></i>
                      {new Date(article.created_at).toLocaleDateString()}
                    </span>
                    <span className={cx("meta-item")}>
                      <i className="far fa-user"></i>
                      {article.created_by}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sort & Filter Section */}
      <div className={cx("filter-section")}>
        <div className={cx("filter-group")}>
          <span className={cx("filter-label")}>Danh mục:</span>
          <select
            className={cx("filter-select")}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Tất cả</option>
            {Object.entries(CATEGORIES).map(([id, category]) => (
              <option key={id} value={id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className={cx("filter-group")}>
          <span className={cx("filter-label")}>Sắp xếp:</span>
          <select
            className={cx("filter-select")}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="title">Theo tên A-Z</option>
            <option value="title-desc">Theo tên Z-A</option>
          </select>
        </div>
      </div>

      {/* Normal Posts */}
      <div className={cx("article-grid")}>
        {careerHandbookData.map((article) => (
          <div key={article.post_id} className={cx("article-card")}>
            <div className={cx("article-image")}>
              <img src="https://placehold.co/600x400" alt={article.title} />
            </div>
            <div className={cx("article-content")}>
              <h2>{article.title}</h2>
              <p>{article.content}</p>
              <div className={cx("meta-info")}>
                <span className={cx("meta-item")}>
                  <i className="far fa-calendar-alt"></i>
                  {new Date(article.created_at).toLocaleDateString()}
                </span>
                <span className={cx("meta-item")}>
                  <i className="far fa-user"></i>
                  {article.created_by}
                </span>
              </div>
            </div>
            </div>
        ))}
      </div>

      {/* Thêm phân trang */}
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

export default CareerHandbook;
