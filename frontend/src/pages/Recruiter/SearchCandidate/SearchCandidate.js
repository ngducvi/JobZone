import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./SearchCandidate.module.scss";
import { authAPI, recruiterApis } from "~/utils/api";
import images from "~/assets/images";
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);

const SearchCandidate = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    experience: 'all',
    salary: 'all',
    employment_type: 'all',
    location: 'all',
    skills: [],
    availability: 'all',
    education: 'all'
  });

  const experienceOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Không có kinh nghiệm', label: 'Không có kinh nghiệm' },
    { value: 'Dưới 1 năm', label: 'Dưới 1 năm' },
    { value: '1-2 năm', label: '1-2 năm' },
    { value: '2-5 năm', label: '2-5 năm' },
    { value: 'Trên 5 năm', label: 'Trên 5 năm' }
  ];

  const salaryOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: '0-10000000', label: 'Dưới 10 triệu' },
    { value: '10000000-20000000', label: '10-20 triệu' },
    { value: '20000000-30000000', label: '20-30 triệu' },
    { value: '30000000-50000000', label: '30-50 triệu' },
    { value: '50000000', label: 'Trên 50 triệu' }
  ];

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await authAPI().get(recruiterApis.getAllCandidate);
      setCandidates(response.data.candidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  const handleSearch = () => {
    setIsSearching(true);
    // Implement search logic here
    setIsSearching(false);
  };
  const handleCandidateClick = (candidateId) => {
    console.log("Clicking candidate with ID:", candidateId);
    navigate(`/recruiter/candidate-detail/${candidateId}`);
  };
  return (
    <div className={cx('wrapper')}>
      <div className={cx('candidate-search')}>
        <div className={cx('search-header')}>
          <div className={cx('container')}>
            <div className={cx('search-form')}>
              <div className={cx('search-input')}>
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, kỹ năng..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <div className={cx('location-input')}>
                <i className="fas fa-map-marker-alt"></i>
                <input
                  type="text"
                  placeholder="Địa điểm"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>
              <button 
                className={cx('search-button', { searching: isSearching })}
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <><i className="fas fa-spinner"></i> Đang tìm...</>
                ) : (
                  <><i className="fas fa-search"></i> Tìm kiếm</>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className={cx('container')}>
          <div className={cx('content')}>
            <aside className={cx('filters')}>
              <div className={cx('filter-section')}>
                <h3>Search by Keywords</h3>
                <div className={cx('filter-input')}>
                  <i className="fas fa-search"></i>
                  <input type="text" placeholder="Job title, keywords, or company" />
                </div>
              </div>

              <div className={cx('filter-section')}>
                <h3>Location</h3>
                <div className={cx('filter-input')}>
                  <i className="fas fa-map-marker-alt"></i>
                  <input type="text" placeholder="City or postcode" />
                </div>
              </div>

              <div className={cx('filter-section')}>
                <h3>Category</h3>
                <select className={cx('filter-select')}>
                  <option value="commercial">Commercial</option>
                  {/* Add more options */}
                </select>
              </div>

              <div className={cx('filter-section')}>
                <h3>Candidate Gender</h3>
                <select className={cx('filter-select')}>
                  <option value="male">Male</option>
                  {/* Add more options */}
                </select>
              </div>

              <div className={cx('filter-section')}>
                <h3>Date Posted</h3>
                <div className={cx('date-options')}>
                  <button>All</button>
                  <button>Last Hour</button>
                  <button>Last 24 Hour</button>
                  <button>Last 7 Days</button>
                  <button>Last 14 Days</button>
                  <button>Last 30 Days</button>
                </div>
              </div>

              <div className={cx('filter-section')}>
                <h3>Experience</h3>
                <div className={cx('filter-options')}>
                  <label>
                    <input type="checkbox" /> Fresh
                  </label>
                  <label>
                    <input type="checkbox" /> 1 Year
                  </label>
                  <label>
                    <input type="checkbox" /> 2 Year
                  </label>
                  <label>
                    <input type="checkbox" /> 3 Year
                  </label>
                  <label>
                    <input type="checkbox" /> 4 Year
                  </label>
                </div>
              </div>

              <div className={cx('filter-section')}>
                <h3>Qualification</h3>
                <div className={cx('filter-options')}>
                  <label>
                    <input type="checkbox" /> Certificate
                  </label>
                  <label>
                    <input type="checkbox" /> Associate Degree
                  </label>
                  <label>
                    <input type="checkbox" /> Bachelor Degree
                  </label>
                  <label>
                    <input type="checkbox" /> Master's Degree
                  </label>
                  <label>
                    <input type="checkbox" /> Doctorate Degree
                  </label>
                </div>
              </div>
            </aside>

            <main className={cx('candidate-list')}>
              <div className={cx('candidate-list-header')}>
                <div className={cx('total-candidates')}>
                  Tìm thấy {candidates.length} ứng viên
                </div>
                <div className={cx('sort-section')}>
                  <select className={cx('sort-select')}>
                    <option value="relevance">Mức độ phù hợp</option>
                    <option value="recent">Mới nhất</option>
                  </select>
                </div>
              </div>

              <div className={cx('candidates')}>
                {candidates.map((candidate) => {
                  console.log("Candidate data:", candidate);
                  return (
                    <div 
                      key={candidate.candidate_id} 
                      className={cx('candidate-card')}
                      
                    >
                      <div className={cx('candidate-avatar')}>
                        <img src={candidate.profile_picture || images.avatar} alt="Avatar" />
                      </div>
                      
                      <div className={cx('candidate-info')}>
                        <h3 className={cx('candidate-name')}>{candidate.user.name}</h3>
                        <div className={cx('candidate-meta')}>
                          <span><i className="fas fa-map-marker-alt"></i>{candidate.location}</span>
                          <span>{candidate.current_job_title}</span>
                        </div>
                        <div className={cx('skills')}>
                          {candidate.skills.split(',').slice(0, 3).map((skill, index) => (
                            <span key={index} className={cx('skill-tag')}>{skill.trim()}</span>
                          ))}
                        </div>
                      </div>

                      <button className={cx('view-profile-btn')} onClick={() => handleCandidateClick(candidate.candidate_id)}>
                        View Profile
                      </button>
                    </div>
                  );
                })}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchCandidate;
