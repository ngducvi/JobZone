import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { Link } from "react-router-dom";
import styles from "./Compensation.module.scss";
import { authAPI, userApis } from "~/utils/api";
import Background3D from "~/components/Background3D/Background3D";
import images from "~/assets/images";
const cx = classNames.bind(styles);

function Compensation() {
  const [careerHandbookData3, setCareerHandbookData3] = useState([]); // Category 3
  const [featuredPosts, setFeaturedPosts] = useState([]);

  const fetchData = () => {
    const category3Promise = authAPI().get(userApis.getCareerHandbookByCategoryId(3));

    Promise.all([category3Promise])
      .then(([category3Result]) => {
        setCareerHandbookData3(category3Result.data.careerHandbook);
        setFeaturedPosts(category3Result.data.careerHandbook.slice(0, 3));
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
          <h1>Chế độ lương thưởng</h1>
          <p>Cập nhật thông tin mới nhất liên quan tới các chế độ lương thưởng, phụ cấp, phúc lợi xã hội cho người lao động.</p>
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
                  <div className={cx("category-label")}>Chế độ lương thưởng</div>
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
            {careerHandbookData3.map((post) => (
              <div key={post.post_id} className={cx("post-card")}>
                <div className={cx("post-image")}>
                  <img src={post.image || images.cat1} alt={post.title} />
                </div>
                <div className={cx("post-content")}>
                  <div className={cx("category-badge")}>Chế độ lương thưởng</div>
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

export default Compensation;
