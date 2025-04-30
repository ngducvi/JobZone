// AI Suggest page 
import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './RecruiterAISuggest.module.scss';
import { authAPI, recruiterApis } from '~/utils/api';
import images from '~/assets/images';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useScrollTop from '~/hooks/useScrollTop';

const cx = classNames.bind(styles);

const RecruiterAISuggest = () => {
    useScrollTop();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [suggestedCandidates, setSuggestedCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Fetch danh sách công việc của nhà tuyển dụng
    useEffect(() => {
        const fetchRecruiterJobs = async () => {
            try {
                setLoading(true);
                const response = await authAPI().get(recruiterApis.getAllJobByRecruiter);
                setJobs(response.data.jobs);
            } catch (error) {
                console.error("Error fetching recruiter jobs:", error);
                toast.error("Không thể tải danh sách công việc");
            } finally {
                setLoading(false);
            }
        };
        
        fetchRecruiterJobs();
    }, []);

    // Hàm xử lý khi chọn một công việc
    const handleSelectJob = async (job) => {
        setSelectedJob(job);
        await fetchAISuggestions(job.job_id);
    };

    // Hàm lấy gợi ý ứng viên từ AI
    const fetchAISuggestions = async (jobId) => {
        try {
            setIsGenerating(true);
            // Gọi API để lấy gợi ý ứng viên
            const response = await authAPI().post(recruiterApis.getAISuggestions, {
                job_id: jobId
            });
            setSuggestedCandidates(response.data.candidates);
        } catch (error) {
            console.error("Error getting AI suggestions:", error);
            toast.error("Không thể tạo gợi ý ứng viên");
        } finally {
            setIsGenerating(false);
        }
    };

    // Hàm xử lý khi click vào nút làm mới gợi ý
    const handleRefreshSuggestions = () => {
        if (selectedJob) {
            fetchAISuggestions(selectedJob.job_id);
        }
    };

    // Hàm xử lý khi click vào xem hồ sơ ứng viên
    const handleViewCandidate = (candidateId) => {
        navigate(`/recruiter/candidates/${candidateId}`);
    };

    // Format ngày tháng
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header-section')}>
                <h1>Gợi ý ứng viên thông minh</h1>
                <p>Sử dụng AI để tìm ứng viên phù hợp với công việc của bạn</p>
            </div>

            {loading ? (
                <div className={cx('loading')}>
                    <div className={cx('spinner')}></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            ) : (
                <div className={cx('ai-container')}>
                    <div className={cx('job-selector')}>
                        <h2>Chọn công việc để nhận gợi ý</h2>
                        
                        {jobs.length === 0 ? (
                            <div className={cx('no-jobs')}>
                                <i className="fas fa-briefcase"></i>
                                <h3>Chưa có công việc nào</h3>
                                <p>Đăng tin tuyển dụng để nhận gợi ý ứng viên phù hợp</p>
                                <button onClick={() => navigate('/recruiter/job-post')}>
                                    Đăng tin tuyển dụng
                                </button>
                            </div>
                        ) : (
                            <div className={cx('job-list')}>
                                {jobs.map((job) => (
                                    <div 
                                        key={job.job_id} 
                                        className={cx('job-card', { 'selected': selectedJob?.job_id === job.job_id })}
                                        onClick={() => handleSelectJob(job)}
                                    >
                                        <h3>{job.title}</h3>
                                        <div className={cx('job-meta')}>
                                            <span><i className="fas fa-map-marker-alt"></i> {job.location}</span>
                                            <span><i className="fas fa-clock"></i> {job.employment_type}</span>
                                        </div>
                                        <div className={cx('job-footer')}>
                                            <span className={cx('job-date')}>Đăng ngày: {formatDate(job.created_at)}</span>
                                            <span className={cx('job-applications')}>
                                                <i className="fas fa-users"></i> {job.applications_count || 0} ứng viên
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={cx('candidates-section')}>
                        {!selectedJob ? (
                            <div className={cx('no-candidates')}>
                                <i className="fas fa-users"></i>
                                <h3>Chưa có gợi ý</h3>
                                <p>Vui lòng chọn một công việc từ danh sách bên trái để nhận gợi ý ứng viên</p>
                            </div>
                        ) : isGenerating ? (
                            <div className={cx('loading')}>
                                <div className={cx('spinner')}></div>
                                <p>AI đang phân tích và tìm ứng viên phù hợp...</p>
                            </div>
                        ) : (
                            <>
                                <div className={cx('candidates-header')}>
                                    <h2>Ứng viên phù hợp với {selectedJob.title}</h2>
                                    <button 
                                        className={cx('refresh-button')} 
                                        onClick={handleRefreshSuggestions}
                                    >
                                        <i className="fas fa-sync-alt"></i> Làm mới gợi ý
                                    </button>
                                </div>

                                {suggestedCandidates.length === 0 ? (
                                    <div className={cx('no-matches')}>
                                        <i className="fas fa-search"></i>
                                        <h3>Không tìm thấy ứng viên phù hợp</h3>
                                        <p>Hãy thử điều chỉnh yêu cầu công việc hoặc quay lại sau</p>
                                    </div>
                                ) : (
                                    <div className={cx('candidates-grid')}>
                                        {suggestedCandidates.map((candidate) => (
                                            <div key={candidate.candidate_id} className={cx('candidate-card')}>
                                                <div className={cx('card-header')}>
                                                    <div className={cx('candidate-avatar')}>
                                                        <img 
                                                            src={candidate.profile_picture || images.avatar} 
                                                            alt="Avatar" 
                                                        />
                                                    </div>
                                                    <div className={cx('candidate-info')}>
                                                        <h3>{candidate.user?.name}</h3>
                                                        <p>{candidate.current_job_title || "Chưa cập nhật vị trí"}</p>
                                                        <div className={cx('match-score')}>
                                                            <div className={cx('score-bar')}>
                                                                <div 
                                                                    className={cx('score-fill')} 
                                                                    style={{ width: `${candidate.match_percentage}%` }}
                                                                ></div>
                                                            </div>
                                                            <span>{candidate.match_percentage}% phù hợp</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className={cx('skills')}>
                                                    {candidate.skills?.split(',')?.slice(0, 4)?.map((skill, index) => (
                                                        <span key={index} className={cx('skill-tag')}>
                                                            {skill.trim()}
                                                        </span>
                                                    )) || (
                                                        <span className={cx('skill-tag')}>
                                                            Chưa cập nhật kỹ năng
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className={cx('match-reasons')}>
                                                    <h4>Lý do phù hợp:</h4>
                                                    <ul>
                                                        {candidate.match_reasons?.map((reason, index) => (
                                                            <li key={index}>{reason}</li>
                                                        )) || <li>Không có thông tin</li>}
                                                    </ul>
                                                </div>
                                                
                                                <div className={cx('actions')}>
                                                    <button 
                                                        className={cx('view-profile')}
                                                        onClick={() => handleViewCandidate(candidate.candidate_id)}
                                                    >
                                                        <i className="fas fa-user"></i> Xem hồ sơ
                                                    </button>
                                                    <button className={cx('contact')}>
                                                        <i className="fas fa-envelope"></i> Liên hệ
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterAISuggest;
