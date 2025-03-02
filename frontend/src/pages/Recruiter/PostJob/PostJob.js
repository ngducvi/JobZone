// PostJob page
import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './PostJob.module.scss';
import { authAPI, recruiterApis } from '~/utils/api';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

function PostJob() {
  const [jobTitle, setJobTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [specialisms, setSpecialisms] = useState('');
  const [salary, setSalary] = useState('');
  const [username, setUsername] = useState('');
  const [jobType, setJobType] = useState('');
  const [careerLevel, setCareerLevel] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await authAPI().post(recruiterApis.postJob, {
        jobTitle,
        description,
        email,
        specialisms,
        salary,
        username,
        jobType,
        careerLevel,
      });
      setSuccess('Đăng tin tuyển dụng thành công!');
      navigate('/recruiter/jobs');
    } catch (err) {
      setError('Đã xảy ra lỗi khi đăng tin tuyển dụng. Vui lòng thử lại.');
    }
  };

  const handlePreview = () => {
    // Logic to handle preview (e.g., open a modal or navigate to a preview page)
    console.log("Previewing job:", {
      jobTitle,
      description,
      email,
      specialisms,
      salary,
      username,
      jobType,
      careerLevel,
    });
    // Bạn có thể mở một modal hoặc thực hiện hành động khác ở đây
  };

  return (
    <div className={cx('wrapper')}>
      <h1>Đăng Tin Tuyển Dụng</h1>
      {error && <p className={cx('error-message')}>{error}</p>}
      {success && <p className={cx('success-message')}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div className={cx('form-group')}>
          <label htmlFor="jobTitle">Tiêu đề công việc</label>
          <input
            type="text"
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required
          />
        </div>
        <div className={cx('form-group')}>
          <label htmlFor="description">Mô tả công việc</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className={cx('form-group')}>
          <label htmlFor="email">Địa chỉ email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={cx('form-group')}>
          <label htmlFor="specialisms">Chuyên môn</label>
          <input
            type="text"
            id="specialisms"
            value={specialisms}
            onChange={(e) => setSpecialisms(e.target.value)}
            required
          />
        </div>
        <div className={cx('form-group')}>
          <label htmlFor="salary">Mức lương</label>
          <input
            type="text"
            id="salary"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            required
          />
        </div>
        <div className={cx('form-group')}>
          <label htmlFor="username">Tên người đăng</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className={cx('form-group')}>
          <label htmlFor="jobType">Loại công việc</label>
          <select
            id="jobType"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            required
          >
            <option value="">Chọn loại</option>
            <option value="full-time">Toàn thời gian</option>
            <option value="part-time">Bán thời gian</option>
          </select>
        </div>
        <div className={cx('form-group')}>
          <label htmlFor="careerLevel">Cấp độ nghề nghiệp</label>
          <select
            id="careerLevel"
            value={careerLevel}
            onChange={(e) => setCareerLevel(e.target.value)}
            required
          >
            <option value="">Chọn cấp độ</option>
            <option value="junior">Junior</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
          </select>
        </div>
        <div className={cx('button-group')}>
          <button type="submit" className={cx('submit-btn')}>Đăng tin</button>
          <button type="button" className={cx('preview-btn')} onClick={handlePreview}>Xem trước</button>
        </div>
      </form>
    </div>
  );
}

export default PostJob;