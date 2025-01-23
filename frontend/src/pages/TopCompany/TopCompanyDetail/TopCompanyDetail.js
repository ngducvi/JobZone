// TopCompanyDetail page
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./TopCompanyDetail.module.scss";
import classNames from "classnames/bind";
import { authAPI, userApis } from "~/utils/api";
import { useParams } from "react-router-dom";
import images from "~/assets/images";
import { LoadingSpinner, CompanySkeleton } from '~/components/Loading/Loading';

const cx = classNames.bind(styles);

function TopCompanyDetail() {
  const { company } = useParams();
    const [companyDetail, setCompanyDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await authAPI().get(
          userApis.getCompanyDetailByCompanyId(company)
        );
            setCompanyDetail(response.data.company);
      } catch (error) {
        console.error("Error fetching company detail:", error);
      }
    };
    fetchData();
  }, [company]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  if (isLoading) {
    return <CompanySkeleton />;
  }

  if (!companyDetail) {
    return <LoadingSpinner />;
  }

  return (
    <div className={cx("wrapper")}>
      <div className={cx("hero-section")}>
        <div className={cx("company-card")}>
          <div className={cx("company-banner")}>
            <img src={companyDetail?.banner || images.banner} alt="Banner" />
            <div className={cx("overlay")}></div>
          </div>
          
          <div className={cx("company-intro")}>
            <div className={cx("logo-container")}>
              <img src={companyDetail?.logos || images.company_1} alt="Logo" />
              <div className={cx("pulse-effect")}></div>
            </div>
            
            <div className={cx("company-stats")}>
              <h1>{companyDetail?.company_name}</h1>
              <div className={cx("stat-badges")}>
                <div className={cx("badge", "employees")}>
                  <i className="fas fa-users-gear"></i>
                  <span>{companyDetail?.company_emp || "250+"} Nhân viên</span>
                </div>
                <div className={cx("badge", "location")}>
                  <i className="fas fa-location-crosshairs"></i>
                  <span>{companyDetail?.address}</span>
                </div>
                <div className={cx("badge", "jobs")}>
                  <i className="fas fa-briefcase-clock"></i>
                  <span>12 Vị trí đang tuyển</span>
                </div>
              </div>
              
              <button className={cx("follow-button", { following: isFollowing })} onClick={handleFollow}>
                <div className={cx("button-content")}>
                  <i className={`fas fa-${isFollowing ? 'check-circle' : 'plus-circle'}`}></i>
                  <span>{isFollowing ? 'Đã theo dõi' : 'Theo dõi công ty'}</span>
                </div>
                <div className={cx("follower-count")}>
                  <i className="fas fa-user-group"></i>
                  <span>2.5k</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={cx("content-grid")}>
        <div className={cx("main-content")}>
          <div className={cx("info-card", "about")}>
            <div className={cx("card-header")}>
              <i className="fas fa-building-circle-check"></i>
              <h2>Giới thiệu công ty</h2>
            </div>
            <div className={cx("card-content")} dangerouslySetInnerHTML={{ __html: companyDetail?.description }} />
          </div>

          <div className={cx("info-card", "jobs")}>
            <div className={cx("card-header")}>
              <i className="fas fa-briefcase-clock"></i>
              <h2>Vị trí đang tuyển</h2>
            </div>
            <div className={cx("job-grid")}>
              {[1, 2, 3].map((_, index) => (
                <div key={index} className={cx("job-card")}>
                  <div className={cx("job-title")}>
                    <i className="fas fa-code-branch"></i>
                    <h3>Senior Frontend Developer</h3>
                  </div>
                  <div className={cx("job-tags")}>
                    <span><i className="fas fa-money-bill-wave"></i>15-20 triệu</span>
                    <span><i className="fas fa-location-dot"></i>Hà Nội</span>
                    <span><i className="fas fa-clock"></i>Full time</span>
                  </div>
                  <button className={cx("apply-btn")}>
                    <i className="fas fa-paper-plane"></i>
                    Ứng tuyển ngay
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className={cx("sidebar")}>
          <div className={cx("info-card", "contact")}>
            <div className={cx("card-header")}>
              <i className="fas fa-address-card"></i>
              <h3>Thông tin liên hệ</h3>
            </div>
            <div className={cx("contact-list")}>
              <a href={companyDetail?.website} className={cx("contact-item", "website")}>
                <i className="fas fa-globe-asia"></i>
                <span>{companyDetail?.website}</span>
              </a>
              <div className={cx("contact-item", "address")}>
                <i className="fas fa-map-location-dot"></i>
                <span>{companyDetail?.address}</span>
              </div>
              <div className={cx("contact-item", "size")}>
                <i className="fas fa-chart-network"></i>
                <span>{companyDetail?.company_emp} nhân viên</span>
              </div>
            </div>
          </div>

          <div className={cx("info-card", "share")}>
            <div className={cx("card-header")}>
              <i className="fas fa-share-nodes"></i>
              <h3>Chia sẻ thông tin</h3>
            </div>
            <div className={cx("share-buttons")}>
              <button className={cx("share-btn", "facebook")}>
                <i className="fab fa-facebook"></i>
                <span>Facebook</span>
              </button>
              <button className={cx("share-btn", "linkedin")}>
                <i className="fab fa-linkedin"></i>
                <span>LinkedIn</span>
              </button>
              <button className={cx("share-btn", "twitter")}>
                <i className="fab fa-twitter"></i>
                <span>Twitter</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default TopCompanyDetail;
