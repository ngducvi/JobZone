// JobHunting page
import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { Link } from "react-router-dom";
import styles from "./JobHunting.module.scss";
import { authAPI, userApis } from "~/utils/api";
import Background3D from "~/components/Background3D/Background3D";
import images from "~/assets/images";

const cx = classNames.bind(styles);

function JobHunting() {
  const [careerHandbookData2, setCareerHandbookData2] = useState([]); // Category 2
  const [featuredPosts, setFeaturedPosts] = useState([]);

  const fetchData = () => {
    const category2Promise = authAPI().get(userApis.getCareerHandbookByCategoryId(2));

    Promise.all([category2Promise])
      .then(([category2Result]) => {
        setCareerHandbookData2(category2Result.data.careerHandbook);
        setFeaturedPosts(category2Result.data.careerHandbook.slice(0, 3));
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Background3D />
      <div className={cx("wrapper")}>
        {/* Header */}
        <div className={cx("header")}>
          <h1>Bí kíp tìm việc</h1>
          <p>Những kinh nghiệm và kỹ năng hữu ích giúp bạn tìm được công việc phù hợp với bản thân.</p>
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
                  <div className={cx("category-label")}>Bí kíp tìm việc</div>
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
            {careerHandbookData2.map((post) => (
              <div key={post.post_id} className={cx("post-card")}>
                <div className={cx("post-image")}>
                  <img src={post.image || images.cat1} alt={post.title} />
                </div>
                <div className={cx("post-content")}>
                  <div className={cx("category-badge")}>Bí kíp tìm việc</div>
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
      </div>
    </>
  );
}

export default JobHunting;
