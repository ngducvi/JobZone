import classNames from "classnames/bind";
import { Link } from "react-router-dom";
import styles from "./Footer.module.scss";
import AnimatedText from "./AnimatedText";
const cx = classNames.bind(styles);

function Footer() {
  return (
    <footer className={cx("footer")}>
      <div className={cx("footer-content")}>
        <div className={cx("footer-section")}>
          <h3>JOBZONE</h3>
          <p>Kết nối cơ hội, định hướng sự nghiệp</p>
          <div className={cx("social-links")}>
            <a href="#">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="#">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>

        <div className={cx("footer-section")}>
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link to="/career-services">Career Services</Link>
            </li>
            <li>
              <Link to="/cv-writing">CV Writing</Link>
            </li>
            <li>
              <Link to="/career-resources">Career Resources</Link>
            </li>
            <li>
              <Link to="/company-listings">Company Listings</Link>
            </li>
            <li>
              <Link to="/success-stories">Success Stories</Link>
            </li>
            <li>
              <Link to="/contact">Contact Us</Link>
            </li>
          </ul>
        </div>

        <div className={cx("footer-section")}>
          <h4>Jobs By Industry</h4>
          <ul>
            <li>
              <Link to="/jobs/it">Information Technology Jobs</Link>
            </li>
            <li>
              <Link to="/jobs/recruitment">
                Recruitment/Employment Firms Jobs
              </Link>
            </li>
            <li>
              <Link to="/jobs/education">Education/Training Jobs</Link>
            </li>
            <li>
              <Link to="/jobs/manufacturing">Manufacturing Jobs</Link>
            </li>
            <li>
              <Link to="/jobs/call-center">Call Center Jobs</Link>
            </li>
            <li>
              <Link to="/jobs/ngo">N.G.O./Social Services Jobs</Link>
            </li>
          </ul>
        </div>

        <div className={cx("footer-section")}>
          <h4>Latest Articles</h4>
          <div className={cx("article-links")}>
            <Link to="/article/1">
              <span>Sed fermentum at lectus nec porta.</span>
              <span className={cx("date")}>Jan 28, 2024</span>
            </Link>
            <Link to="/article/2">
              <span>Sed fermentum at lectus nec porta.</span>
              <span className={cx("date")}>Jan 28, 2024</span>
            </Link>
            <Link to="/article/3">
              <span>Sed fermentum at lectus nec porta.</span>
              <span className={cx("date")}>Jan 28, 2024</span>
            </Link>
          </div>
        </div>
      </div>
      <div className={cx("footer-bottom")}>
        <AnimatedText
          text="JOB-ZONE"
          className="2xl:text-[9rem] text-[12vw]"
        />
      </div>
      <div className={cx("footer-bottom")}>
        <p>© 2024 JobZone - Kết nối việc làm. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
