// JobSearch
import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './JobSearch.module.scss';
import JobCard from '~/components/JobCard/JobCard';
import images from '~/assets/images';
const cx = classNames.bind(styles);

const JobSearch = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSalary, setSelectedSalary] = useState('all');
  const [workType, setWorkType] = useState('all');
  const [companyType, setCompanyType] = useState('all');
  const [workArea, setWorkArea] = useState('all');
  const [businessArea, setBusinessArea] = useState('all');
  const filtersRef = useRef(null);

  const categories = [
    { id: 'marketing', name: 'Marketing', count: 3150 },
    { id: 'accounting', name: 'Kế toán', count: 2052 },
    { id: 'sales', name: 'Sales Ban lẻ/Dịch vụ tiêu dùng', count: 1326 },
    { id: 'hr', name: 'Nhân sự', count: 1249 },
    { id: 'engineering', name: 'Software Engineering', count: 1076 },
  ];

  const mockJobs = [
    {
      id: 1,
      title: "Security Operations Center Senior - Chuyên Viên Giám Sát",
      company: "Bảo Mật An Ninh Thông Tin",
      location: "Hồ Chí Minh",
      experience: "3 năm",
      tags: ["Quản trị và vận hành bảo mật"],
      logo: images.company_1,
      isHot: true,
      postedDate: "5 ngày trước",
      isVerified: true
    },
    {
      id: 2,
      title: "[Remote] BackEnd Developer/Fullstack-Yêu Cầu Từ 1 Năm Kinh Nghiệm",
      company: "CÔNG TY TNHH CÔNG NGHỆ ĐẠI PHÚ HƯNG",
      location: "Toàn Quốc",
      experience: "1 năm",
      salary: "10 - 15 triệu",
      tags: ["Backend Developer", "IT - Phần mềm", "Tuổi 24 - ..."],
      logo: images.company_1,
      postedDate: "5 ngày trước"
    },
    // Thêm các job khác từ hình mẫu
  ];

  useEffect(() => {
    const observerOptions = {
      root: filtersRef.current,
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(cx('visible'));
        }
      });
    }, observerOptions);

    // Observe all filter sections
    const filterSections = document.querySelectorAll(`.${cx('filter-section')}`);
    filterSections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  // Smooth scroll to section when clicking on filter headers
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section && filtersRef.current) {
      filtersRef.current.scrollTo({
        top: section.offsetTop - 20,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={cx('job-search')}>
      <div className={cx('search-header')}>
        <div className={cx('container')}>
          <div className={cx('search-form')}>
            <div className={cx('search-input')}>
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Vị trí tuyển dụng" />
            </div>
            <div className={cx('location-input')}>
              <i className="fas fa-map-marker-alt"></i>
              <input type="text" placeholder="Địa điểm" />
            </div>
            <button className={cx('search-button')}>Tìm kiếm</button>
          </div>
        </div>
      </div>

      <div className={cx('container')}>
        <div className={cx('content')}>
          <aside className={cx('filters')} ref={filtersRef}>
            <div className={cx('filter-section')} id="categories">
              <h3>Theo danh mục nghề</h3>
              {categories.map(category => (
                <label key={category.id} className={cx('checkbox-item')}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => {
                      setSelectedCategories(prev => 
                        prev.includes(category.id)
                          ? prev.filter(id => id !== category.id)
                          : [...prev, category.id]
                      );
                    }}
                  />
                  <span>{category.name}</span>
                  <span className={cx('count')}>({category.count})</span>
                </label>
              ))}
              <button className={cx('show-more')}>Xem thêm</button>
            </div>

            <div className={cx('filter-section')}>
              <h3>Kinh nghiệm</h3>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="experience"
                  value="all"
                  checked={selectedExperience === 'all'}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                />
                <span>Tất cả</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="experience"
                  value="none"
                  checked={selectedExperience === 'none'}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                />
                <span>Không yêu cầu</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="experience"
                  value="under1"
                  checked={selectedExperience === 'under1'}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                />
                <span>Dưới 1 năm</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="experience"
                  value="1year"
                  checked={selectedExperience === '1year'}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                />
                <span>1 năm</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="experience"
                  value="2years"
                  checked={selectedExperience === '2years'}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                />
                <span>2 năm</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="experience"
                  value="3years"
                  checked={selectedExperience === '3years'}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                />
                <span>3 năm</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="experience"
                  value="4years"
                  checked={selectedExperience === '4years'}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                />
                <span>4 năm</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="experience"
                  value="5years"
                  checked={selectedExperience === '5years'}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                />
                <span>5 năm</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="experience"
                  value="over5"
                  checked={selectedExperience === 'over5'}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                />
                <span>Trên 5 năm</span>
              </label>
            </div>

            <div className={cx('filter-section')}>
              <h3>Cấp bậc</h3>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="level"
                  value="all"
                  checked={selectedLevel === 'all'}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                />
                <span>Tất cả</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="level"
                  value="staff"
                  checked={selectedLevel === 'staff'}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                />
                <span>Nhân viên</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="level"
                  value="teamLead"
                  checked={selectedLevel === 'teamLead'}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                />
                <span>Trưởng nhóm</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="level"
                  value="manager"
                  checked={selectedLevel === 'manager'}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                />
                <span>Trưởng/Phó phòng</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="level"
                  value="supervisor"
                  checked={selectedLevel === 'supervisor'}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                />
                <span>Quản lý / Giám sát</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="level"
                  value="branchManager"
                  checked={selectedLevel === 'branchManager'}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                />
                <span>Trưởng chi nhánh</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="level"
                  value="viceDirector"
                  checked={selectedLevel === 'viceDirector'}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                />
                <span>Phó giám đốc</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="level"
                  value="director"
                  checked={selectedLevel === 'director'}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                />
                <span>Giám đốc</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="level"
                  value="intern"
                  checked={selectedLevel === 'intern'}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                />
                <span>Thực tập sinh</span>
              </label>
            </div>

            <div className={cx('filter-section')}>
              <h3>Mức lương</h3>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="salary"
                  value="all"
                  checked={selectedSalary === 'all'}
                  onChange={(e) => setSelectedSalary(e.target.value)}
                />
                <span>Tất cả</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="salary"
                  value="under10"
                  checked={selectedSalary === 'under10'}
                  onChange={(e) => setSelectedSalary(e.target.value)}
                />
                <span>Dưới 10 triệu</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="salary"
                  value="10-15"
                  checked={selectedSalary === '10-15'}
                  onChange={(e) => setSelectedSalary(e.target.value)}
                />
                <span>10 - 15 triệu</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="salary"
                  value="15-20"
                  checked={selectedSalary === '15-20'}
                  onChange={(e) => setSelectedSalary(e.target.value)}
                />
                <span>15 - 20 triệu</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="salary"
                  value="20-25"
                  checked={selectedSalary === '20-25'}
                  onChange={(e) => setSelectedSalary(e.target.value)}
                />
                <span>20 - 25 triệu</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="salary"
                  value="25-30"
                  checked={selectedSalary === '25-30'}
                  onChange={(e) => setSelectedSalary(e.target.value)}
                />
                <span>25 - 30 triệu</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="salary"
                  value="30-50"
                  checked={selectedSalary === '30-50'}
                  onChange={(e) => setSelectedSalary(e.target.value)}
                />
                <span>30 - 50 triệu</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="salary"
                  value="over50"
                  checked={selectedSalary === 'over50'}
                  onChange={(e) => setSelectedSalary(e.target.value)}
                />
                <span>Trên 50 triệu</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="salary"
                  value="negotiate"
                  checked={selectedSalary === 'negotiate'}
                  onChange={(e) => setSelectedSalary(e.target.value)}
                />
                <span>Thỏa thuận</span>
              </label>
              <div className={cx('salary-range')}>
                <input type="text" placeholder="Từ" />
                <span>-</span>
                <input type="text" placeholder="Đến" />
                <span>triệu</span>
              </div>
            </div>

            <div className={cx('filter-section')}>
              <h3>Lĩnh vực công ty</h3>
              <div className={cx('select-wrapper')}>
                <select 
                  value={businessArea} 
                  onChange={(e) => setBusinessArea(e.target.value)}
                >
                  <option value="all">Tất cả lĩnh vực</option>
                  {/* Thêm các option khác */}
                </select>
              </div>
            </div>

            <div className={cx('filter-section')}>
              <h3>Lĩnh vực công việc</h3>
              <div className={cx('select-wrapper')}>
                <select 
                  value={workArea} 
                  onChange={(e) => setWorkArea(e.target.value)}
                >
                  <option value="all">Tất cả lĩnh vực</option>
                  {/* Thêm các option khác */}
                </select>
              </div>
            </div>

            <div className={cx('filter-section')}>
              <h3>Hình thức làm việc</h3>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="workType"
                  value="all"
                  checked={workType === 'all'}
                  onChange={(e) => setWorkType(e.target.value)}
                />
                <span>Tất cả</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="workType"
                  value="fulltime"
                  checked={workType === 'fulltime'}
                  onChange={(e) => setWorkType(e.target.value)}
                />
                <span>Bán thời gian</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="workType"
                  value="parttime"
                  checked={workType === 'parttime'}
                  onChange={(e) => setWorkType(e.target.value)}
                />
                <span>Thực tập</span>
              </label>
            </div>

            <div className={cx('filter-section')}>
              <h3>Loại công ty</h3>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="companyType"
                  value="all"
                  checked={companyType === 'all'}
                  onChange={(e) => setCompanyType(e.target.value)}
                />
                <span>Tất cả</span>
              </label>
              <label className={cx('radio-item')}>
                <input
                  type="radio"
                  name="companyType"
                  value="pro"
                  checked={companyType === 'pro'}
                  onChange={(e) => setCompanyType(e.target.value)}
                />
                <span>Pro Company</span>
              </label>
            </div>
          </aside>

          <main className={cx('job-list')}>
            <div className={cx('job-list-header')}>
              <div className={cx('active-filters')}>
                <span>Lọc nâng cao</span>
                <div className={cx('filter-tags')}>
                  <span className={cx('filter-tag')}>
                    Có hài
                    <button className={cx('remove-tag')}>×</button>
                  </span>
                </div>
              </div>
              <div className={cx('sort-section')}>
                <span>Ưu tiên hiển thị theo:</span>
                <select className={cx('sort-select')}>
                  <option value="relevance">Search by AI</option>
                </select>
              </div>
            </div>

            <div className={cx('jobs')}>
              {mockJobs.map(job => (
                <JobCard key={job.id} {...job} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default JobSearch;
