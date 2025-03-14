import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./CareerHandbookDetail.module.scss";
import { authAPI, userApis } from "~/utils/api";
import { FaCalendarAlt, FaUser, FaEye, FaClock, FaTags, FaArrowLeft } from "react-icons/fa";
import images from "~/assets/images";
import Background3D from "~/components/Background3D/Background3D";

const cx = classNames.bind(styles);

const categories = {
  "1": "Định hướng nghề nghiệp",
  "2": "Bí kíp tìm việc",
  "3": "Chế độ lương thưởng",
  "4": "Kiến thức chuyên ngành",
  "5": "Hành trang nghề nghiệp",
  "6": "Thị trường và xu hướng tuyển dụng"
};

function CareerHandbookDetail() {
  const { post_id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await authAPI().get(userApis.getCareerHandbookByPostId(post_id));
        setArticle(response.data.careerHandbook);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching article:", error);
        setLoading(false);
      }
    };

    fetchArticle();
  }, [post_id]);

  if (loading) {
    return <div className={cx('loading')}>Đang tải...</div>;
  }

  if (!article) {
    return <div className={cx('error')}>Không tìm thấy bài viết</div>;
  }

  return (
    <>
      <Background3D />
      <div className={cx('container')}>
        <div className={cx('wrapper')}>
          <Link to="/user/career-handbook" className={cx('back-link')}>
            <FaArrowLeft /> Quay lại
          </Link>

          <article className={cx('article')}>
            <header className={cx('article-header')}>
              <div className={cx('header-image')}>
                <img src={article.image || images.cat1} alt={article.title} />
              </div>
              
              <div className={cx('header-content')}>
                <div className={cx('category-tag')}>
                  <FaTags />
                  {categories[article.category_id]}
                </div>

                <h1>{article.title}</h1>
                
                <div className={cx('meta-info')}>
                  <span className={cx('meta-item')}>
                    <FaCalendarAlt />
                    {new Date(article.created_at).toLocaleDateString('vi-VN')}
                  </span>
                  <span className={cx('meta-item')}>
                    <FaUser />
                    {article.created_by}
                  </span>
                  <span className={cx('meta-item')}>
                    <FaEye />
                    {article.views || 0} lượt xem
                  </span>
                  <span className={cx('meta-item')}>
                    <FaClock />
                    {Math.ceil(article.content.split(' ').length / 200)} phút đọc
                  </span>
                </div>
              </div>
            </header>

            <div className={cx('article-content')}>
              <div className={cx('content-body')} 
                dangerouslySetInnerHTML={{ __html: article.content }} 
              />
              
              <footer className={cx('article-footer')}>
                <div className={cx('footer-info')}>
                  <div className={cx('last-updated')}>
                    Cập nhật lần cuối: {new Date(article.last_modified_at).toLocaleDateString('vi-VN')}
                  </div>
                  <div className={cx('version-info')}>
                    Phiên bản: {article.version}
                  </div>
                </div>
              </footer>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}

export default CareerHandbookDetail;

