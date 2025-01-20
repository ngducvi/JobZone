import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import HeadlessTippy from "@tippyjs/react/headless";

import { SearchIcon } from "~/components/Icons";
import styles from "./Search.module.scss";
import SearchItem from "~/components/SearchItem";
import { useDebounce } from "~/hooks";
import api, { adminApis, authAPI, userApis } from "~/utils/api";
import { useNavigate } from "react-router-dom";
const cx = classNames.bind(styles);

function Search({ isAdmin, isLocked, reFetchData, onSearch }) {
  const [searchValue, setSearchValue] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [showResult, setShowResult] = useState(false);


  const debouncedValue = useDebounce(searchValue, 500);

  const navigate = useNavigate();

  const handleSearch = () => {
    setShowResult(false);
    if (isAdmin) {
      reFetchData();
    } else if (searchValue) {
      navigate(`/course/results?title=${searchValue}`);
    }
  };

  useEffect(() => {
    if (!debouncedValue.trim()) {
      setSearchResult([]);
      return;
    }

    const fetchCourseBySlug = async () => {
      try {
        if (isAdmin) {
          const result = await authAPI().get(adminApis.findCourse, {
            params: {
              title: debouncedValue,
            },
          });
          setSearchResult(result.data);
        } else {
          const result = await api.get(userApis.getCoursesByName, {
            params: {
              title: debouncedValue,
              is_locked: isLocked,
            },
          });
          setSearchResult(result.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchCourseBySlug();
  }, [debouncedValue, isAdmin, isLocked]);

  const handleHideResult = () => {
    setShowResult(false);
  };

  const handleChange = (e) => {
    const searchValue = e.target.value;
    if (!searchValue.startsWith(" ")) {
      setSearchValue(searchValue);
    }
  };

  return (
    <HeadlessTippy
      interactive
      visible={searchValue && showResult}
      onClickOutside={handleHideResult}
      render={(attrs) => (
        <div className={cx("result-wrapper")}>
          <div className={cx("search-result")} tabIndex="-1" {...attrs}>
            {searchValue && (
              <div className={cx("header")}>
                <SearchIcon />

                <span>Kết quả cho '{searchValue}'</span>
              </div>
            )}
            {searchResult.length > 0 && (
              <div className={cx("heading")}>
                <h5>KHÓA HỌC</h5>
              </div>
            )}
            {searchResult.length > 0 &&
              searchResult
                .slice(0, 8)
                .map((result, index) => (
                  <SearchItem
                    key={index}
                    closeSearchModal={handleHideResult}
                    title={result.title}
                    id={result._id}
                    img={result.image_url}
                  />
                ))}
          </div>
        </div>
      )}
    >
      <div className={cx("search")}>
        <input
          value={searchValue}
          onChange={handleChange}
          onFocus={() => setShowResult(true)}
          className={cx("search-input")}
          type="text"
          placeholder="Tìm kiếm prompt..."
          spellCheck="false"
        />
        <button className={cx("search-btn")} onClick={handleSearch}>
          <SearchIcon className={cx("search-icon")} />
        </button>
      </div>
    </HeadlessTippy>
  );
}

export default Search;
