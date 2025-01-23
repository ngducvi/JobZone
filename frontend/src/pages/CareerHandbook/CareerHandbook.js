import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { Link } from "react-router-dom";
import styles from "./CareerHandbook.module.scss";
import { authAPI, userApis } from "~/utils/api";
import Background3D from "~/components/Background3D/Background3D";
import images from "~/assets/images";
const cx = classNames.bind(styles);

function CareerHandbook() {
  const [careerHandbookData1, setCareerHandbookData1] = useState([]); // Category 1
  const [careerHandbookData2, setCareerHandbookData2] = useState([]); // Category 2
  const [careerHandbookData3, setCareerHandbookData3] = useState([]); // Category 3
  const [careerHandbookData4, setCareerHandbookData4] = useState([]); // Category 4
  const [careerHandbookData5, setCareerHandbookData5] = useState([]); // Category 5
  const [careerHandbookData6, setCareerHandbookData6] = useState([]); // Category 6
  const [featuredCareerHandbookData, setFeaturedCareerHandbookData] = useState([]);

  const fetchData = () => {
    // Create promises for all API calls
    const featuredPromise = authAPI().get(userApis.getAllFeaturedCareerHandbooks);
    
    // Get data for each category
    const category1Promise = authAPI().get(userApis.getCareerHandbookByCategoryId(1));
    const category2Promise = authAPI().get(userApis.getCareerHandbookByCategoryId(2));
    const category3Promise = authAPI().get(userApis.getCareerHandbookByCategoryId(3));
    const category4Promise = authAPI().get(userApis.getCareerHandbookByCategoryId(4));
    const category5Promise = authAPI().get(userApis.getCareerHandbookByCategoryId(5));
    const category6Promise = authAPI().get(userApis.getCareerHandbookByCategoryId(6));

    // Execute all promises in parallel
    Promise.all([
      featuredPromise, 
      category1Promise,
      category2Promise,
      category3Promise,
      category4Promise,
      category5Promise,
      category6Promise
    ])
      .then(([
        featuredResult,
        category1Result,
        category2Result,
        category3Result,
        category4Result,
        category5Result,
        category6Result
      ]) => {
        setFeaturedCareerHandbookData(featuredResult.data.careerHandbook);
        setCareerHandbookData1(category1Result.data.careerHandbook);
        setCareerHandbookData2(category2Result.data.careerHandbook);
        setCareerHandbookData3(category3Result.data.careerHandbook);
        setCareerHandbookData4(category4Result.data.careerHandbook);
        setCareerHandbookData5(category5Result.data.careerHandbook);
        setCareerHandbookData6(category6Result.data.careerHandbook);
        console.log(category3Result.data.careerHandbook);
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
        <div className={cx("header")}>
          <h1>Cẩm nang nghề nghiệp</h1>
          <p>Kiến thức hữu ích cho sự nghiệp của bạn</p>
        </div>

        <div className={cx("category-nav")}>
          <Link to="/career-handbook/career-orientation" className={cx("nav-item")}>
            <i className="fas fa-compass"></i>
            Định hướng nghề nghiệp
          </Link>
          <Link to="/career-handbook/job-hunting" className={cx("nav-item")}>
            <i className="fas fa-magnifying-glass"></i>
            Bí kíp tìm việc
          </Link>
          <Link to="/career-handbook/compensation" className={cx("nav-item")}>
            <i className="fas fa-sack-dollar"></i>
            Chế độ lương thưởng
          </Link>
          <Link to="/career-handbook/industry-knowledge" className={cx("nav-item")}>
            <i className="fas fa-graduation-cap"></i>
            Kiến thức chuyên ngành
          </Link>
          <Link to="/career-handbook/career-preparation" className={cx("nav-item")}>
            <i className="fas fa-briefcase"></i>
            Hành trang nghề nghiệp
          </Link>
          <Link to="/career-handbook/recruitment-trends" className={cx("nav-item")}>
            <i className="fas fa-chart-line"></i>
            Thị trường và xu hướng tuyển dụng
          </Link>
        </div>

        {/* Featured Posts */}
        {featuredCareerHandbookData.length > 0 && (
          <div className={cx("featured-section")}>
            <h1>Bài viết nổi bật</h1>
            <div className={cx("featured-grid")}>
              {featuredCareerHandbookData.map((article) => (
                <div key={article.post_id} className={cx("featured-card")}>
                  <div className={cx("featured-image")}>
                    <img
                      src={article.image || images.cat1}
                      alt={article.title}
                    />
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

        {/* Định hướng nghề nghiệp - Grid Layout */}
        <div className={cx("section-header")}>
          <h1>Định hướng nghề nghiệp</h1>
          <Link to="/career-handbook/career-orientation" className={cx("view-all-link")}>
            Xem tất cả <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
        <div className={cx("grid-layout-1")}>
          {careerHandbookData1.slice(0, 3).map((article) => (
            <div
              key={article.post_id}
              className={cx("article-card", "card-style-1")}
            >
              <div className={cx("article-image")}>
                <img src={article.image || images.cat1} alt={article.title} />
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

        {/* Bí kíp tìm việc - Masonry Layout */}
        <div className={cx("section-header")}>
          <h1>Bí kíp tìm việc</h1>
          <Link to="/career-handbook/job-hunting" className={cx("view-all-link")}>
            Xem tất cả <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
        <div className={cx("masonry-layout")}>
          {careerHandbookData2.slice(0, 3).map((article) => (
            <div key={article.post_id} className={cx("article-card")}>
              <div className={cx("article-image")}>
                <img
                  src={article.image || images.company_1}
                  alt={article.title}
                />
              </div>
              <div className={cx("article-content")}>
                <span className={cx("category-label")}>Bí kíp tìm việc</span>
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

        {/* Chế độ lương thưởng - Horizontal Scroll */}
        <div className={cx("section-header")}>
          <h1>Chế độ lương thưởng</h1>
          <Link to="/career-handbook/compensation" className={cx("view-all-link")}>
            Xem tất cả <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
        <div className={cx("horizontal-scroll")}>
          {careerHandbookData3.slice(0, 5).map((article) => (
            <div key={article.post_id} className={cx("article-card")}>
              <div className={cx("article-image")}>
                <img src={article.image || images.cat1} alt={article.title} />
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

        {/* Kiến thức chuyên ngành */}
        <div className={cx("section-header")}>
          <h1>Kiến thức chuyên ngành</h1>
          <Link to="/career-handbook/industry-knowledge" className={cx("view-all-link")}>
            Xem tất cả <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
        <div className={cx("knowledge-grid")}>
          {careerHandbookData4.slice(0, 4).map((article) => (
            <div key={article.post_id} className={cx("article-card")}>
              <div className={cx("article-image")}>
                <img src={article.image || images.cat1} alt={article.title} />
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

        {/* Thêm container cho 2 section */}
        <div className={cx("dual-section")}>
          {/* Hành trang nghề nghiệp */}
          <div className={cx("section-content")}>
            <div className={cx("section-header")}>
              <h1>Hành trang nghề nghiệp</h1>
              <Link to="/career-handbook/career-preparation" className={cx("view-all-link")}>
                Xem tất cả <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            <div className={cx("article-grid")}>
              {careerHandbookData5.slice(0, 4).map((article) => (
                <div key={article.post_id} className={cx("article-card")}>
                  <div className={cx("article-image")}>
                    <img
                      src={article.image || images.cat1}
                      alt={article.title}
                    />
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
          </div>

          {/* Thị trường và xu hướng tuyển dụng */}
          <div className={cx("section-content")}>
            <div className={cx("section-header")}>
              <h1>Thị trường và xu hướng tuyển dụng</h1>
              <Link to="/career-handbook/recruitment-trends" className={cx("view-all-link")}>
                Xem tất cả <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            <div className={cx("article-grid")}>
              {careerHandbookData6.slice(0, 4).map((article) => (
                <div key={article.post_id} className={cx("article-card")}>
                  <div className={cx("article-image")}>
                    <img
                      src={article.image || images.cat1}
                      alt={article.title}
                    />
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
          </div>
        </div>

        {/* Thêm phân trang */}
      </div>
    </>
  );
}

export default CareerHandbook;
