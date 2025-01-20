import images from "~/assets/images";
import { Link } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./Logo.module.scss";

const cx = classNames.bind(styles);

function Logo({ noName }) {
    return ( 
        <div className={cx("logo-container")}>
        <Link to="/" >
          <img src={images.logo} alt="JOB ZONE" className={cx("logo")} />
        </Link>
        {!noName && <span className={cx("company-name")}>JOB ZONE</span>}
      </div>
     );
}

export default Logo;