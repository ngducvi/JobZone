// RecruitmentTrends page
import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { Link } from "react-router-dom";
import styles from "./RecruimentTrends.module.scss";
import { authAPI, userApis } from "~/utils/api";
import Background3D from "~/components/Background3D/Background3D";
import images from "~/assets/images";

const cx = classNames.bind(styles);

function RecruitmentTrends() {
  const [careerHandbookData6, setCareerHandbookData6] = useState([]); // Category 6
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(4);

  const fetchData = () => {
    const category6Promise = authAPI().get(userApis.getCareerHandbookByCategoryId(6));

    Promise.all([category6Promise])
      .then(([category6Result]) => {
        setCareerHandbookData6(category6Result.data.careerHandbook);
        setFeaturedPosts(category6Result.data.careerHandbook.slice(0, 3));
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = careerHandbookData6.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(careerHandbookData6.length / postsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    document.querySelector(`.${cx("post-list")}`).scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Background3D />
      <div className={cx("wrapper")}>
        {/* Header */}
        <div className={cx("header")}>
          <h1>Thị trường và xu hướng tuyển dụng</h1>
          <p>Cập nhật thông tin về thị trường lao động, xu hướng tuyển dụng và cơ hội việc làm mới nhất.</p>
        </div>

        {/* Featured Posts */}
        <div className={cx("featured-section")}>
          <h2>Bài viết nổi bật</h2>
          <div className={cx("featured-grid")}>
            {featuredPosts.map((post) => (
              <div key={post.post_id} className={cx("featured-card")}>
                <div className={cx("featured-image")}>
                  <img src={post.image || images.cat1} alt={post.title} />
                </div>
                <div className={cx("featured-content")}>
                  <div className={cx("category-label")}>Thị trường và xu hướng tuyển dụng</div>
                  <h3>{post.title}</h3>
                  <p>{post.content}</p>
                  <div className={cx("meta-info")}>
                    <span className={cx("meta-item")}>
                      <i className="far fa-calendar-alt"></i>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    <span className={cx("meta-item")}>
                      <i className="far fa-user"></i>
                      {post.created_by}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Banner Section */}
        <div className={cx("banner-section")}>
          <div className={cx("banner-content")}>
            <div className={cx("banner-text")}>
              <h2>50+ Mẫu CV</h2>
              <p>Chuyên nghiệp, phù hợp với từng ngành nghề</p>
              <Link to="/cv-templates" className={cx("banner-button")}>
                Trải nghiệm ngay
              </Link>
            </div>
            <div className={cx("banner-image")}>
              <img src={images.cvTemplate} alt="CV Templates" />
            </div>
          </div>
        </div>

        {/* Post List */}
        <div className={cx("post-list")}>
          <h2>Danh sách bài viết</h2>
          <div className={cx("post-grid")}>
            {currentPosts.map((post) => (
              <div key={post.post_id} className={cx("post-card")}>
                <div className={cx("post-image")}>
                  <img src={post.image || images.cat1} alt={post.title} />
                </div>
                <div className={cx("post-content")}>
                  <div className={cx("category-badge")}>Thị trường và xu hướng tuyển dụng</div>
                  <h3>{post.title}</h3>
                  <p>{post.content}</p>
                  <div className={cx("meta-info")}>
                    <span className={cx("meta-item")}>
                      <i className="far fa-calendar-alt"></i>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    <span className={cx("meta-item")}>
                      <i className="far fa-user"></i>
                      {post.created_by}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={cx("pagination")}>
              <button
                className={cx("pagination-button", { disabled: currentPage === 1 })}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  className={cx("pagination-button", {
                    active: currentPage === index + 1,
                  })}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}

              <button
                className={cx("pagination-button", { disabled: currentPage === totalPages })}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default RecruitmentTrends;
