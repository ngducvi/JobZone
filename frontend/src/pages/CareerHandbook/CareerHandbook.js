import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { Link } from "react-router-dom";
import styles from "./CareerHandbook.module.scss";
import { authAPI, userApis } from "~/utils/api";
import Background3D from "~/components/Background3D/Background3D";
import images from "~/assets/images";
import DOMPurify from 'dompurify';
const cx = classNames.bind(styles);

function CareerHandbook() {
  const [careerHandbookData1, setCareerHandbookData1] = useState([]); // Category 1
  const [careerHandbookData2, setCareerHandbookData2] = useState([]); // Category 2
  const [careerHandbookData3, setCareerHandbookData3] = useState([]); // Category 3
  const [careerHandbookData4, setCareerHandbookData4] = useState([]); // Category 4
  const [careerHandbookData5, setCareerHandbookData5] = useState([]); // Category 5
  const [careerHandbookData6, setCareerHandbookData6] = useState([]); // Category 6
  const [featuredCareerHandbookData, setFeaturedCareerHandbookData] = useState([]);

  // Helper function to format and clean HTML content
  const formatContent = (content) => {
    if (!content) return '';
    
    try {
      // Nếu nội dung có thẻ HTML, lọc và giữ nội dung văn bản cho việc hiển thị snippet
      if (content.includes('<') && content.includes('>')) {
        // Làm sạch HTML để ngăn tấn công XSS
        const cleanHtml = DOMPurify.sanitize(content);
        
        // Tạo phần tử tạm thời để trích xuất văn bản
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cleanHtml;
        
        // Lấy nội dung văn bản
        let textContent = tempDiv.textContent || tempDiv.innerText || '';
        
        // Loại bỏ DOCTYPE nếu có
        if (textContent.startsWith('<!DOCTYPE')) {
          const startIndex = textContent.indexOf('>') + 1;
          textContent = textContent.substring(startIndex).trim();
        }
        
        // Loại bỏ các thẻ meta và head nếu có
        if (textContent.includes('<head>')) {
          const headEndIndex = textContent.indexOf('</head>') + 7;
          textContent = textContent.substring(headEndIndex).trim();
        }
        
        // Loại bỏ các ký tự không mong muốn
        textContent = textContent.replace(/\s+/g, ' ').trim();
        
        // Cắt ngắn và thêm dấu ... nếu cần
        return textContent.length > 150 ? textContent.substring(0, 150) + '...' : textContent;
      }
      
      // Nếu là văn bản thuần, chỉ cần cắt ngắn
      return content.length > 150 ? content.substring(0, 150) + '...' : content;
    } catch (error) {
      console.error("Error formatting content:", error);
      // Trả về nội dung gốc nếu xảy ra lỗi
      return content.length > 150 ? content.substring(0, 150) + '...' : content;
    }
  };

  // Helper function to sanitize HTML for dangerouslySetInnerHTML
  const sanitizeHTML = (html) => {
    if (!html) return { __html: '' };
    return { __html: DOMPurify.sanitize(html) };
  };

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
                <Link 
                  to={`/career-handbook/${article.post_id}`} 
                  key={article.post_id} 
                  className={cx("featured-card")}
                >
                  <div className={cx("featured-image")}>
                    <img
                      src={article.image || images.cat1}
                      alt={article.title}
                    />
                    <div className={cx("featured-tag")}>Nổi bật</div>
                  </div>
                  <div className={cx("featured-content")}>
                    <h2>{article.title}</h2>
                    <p>{formatContent(article.content)}</p>
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
                </Link>
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
            <Link
              to={`/career-handbook/${article.post_id}`}
              key={article.post_id}
              className={cx("article-card", "card-style-1")}
            >
              <div className={cx("article-image")}>
                <img src={article.image || images.cat1} alt={article.title} />
              </div>
              <div className={cx("article-content")}>
                <h2>{article.title}</h2>
                <p>{formatContent(article.content)}</p>
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
            </Link>
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
            <Link
              to={`/career-handbook/${article.post_id}`}
              key={article.post_id}
              className={cx("article-card")}
            >
              <div className={cx("article-image")}>
                <img
                  src={article.image || images.company_1}
                  alt={article.title}
                />
              </div>
              <div className={cx("article-content")}>
                <span className={cx("category-label")}>Bí kíp tìm việc</span>
                <h2>{article.title}</h2>
                <p>{formatContent(article.content)}</p>
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
            </Link>
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
            <Link
              to={`/career-handbook/${article.post_id}`}
              key={article.post_id}
              className={cx("article-card")}
            >
              <div className={cx("article-image")}>
                <img src={article.image || images.cat1} alt={article.title} />
              </div>
              <div className={cx("article-content")}>
                <h2>{article.title}</h2>
                <p>{formatContent(article.content)}</p>
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
            </Link>
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
            <Link
              to={`/career-handbook/${article.post_id}`}
              key={article.post_id}
              className={cx("article-card")}
            >
              <div className={cx("article-image")}>
                <img src={article.image || images.cat1} alt={article.title} />
              </div>
              <div className={cx("article-content")}>
                <h2>{article.title}</h2>
                <p>{formatContent(article.content)}</p>
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
            </Link>
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
                <Link
                  to={`/career-handbook/${article.post_id}`}
                  key={article.post_id}
                  className={cx("article-card")}
                >
                  <div className={cx("article-image")}>
                    <img
                      src={article.image || images.cat1}
                      alt={article.title}
                    />
                  </div>
                  <div className={cx("article-content")}>
                    <h2>{article.title}</h2>
                    <p>{formatContent(article.content)}</p>
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
                </Link>
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
                <Link
                  to={`/career-handbook/${article.post_id}`}
                  key={article.post_id}
                  className={cx("article-card")}
                >
                  <div className={cx("article-image")}>
                    <img
                      src={article.image || images.cat1}
                      alt={article.title}
                    />
                  </div>
                  <div className={cx("article-content")}>
                    <h2>{article.title}</h2>
                    <p>{formatContent(article.content)}</p>
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
                </Link>
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
