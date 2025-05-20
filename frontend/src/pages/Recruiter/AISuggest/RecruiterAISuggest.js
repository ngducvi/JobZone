// AI Suggest page 
import React, { useState, useEffect, useContext } from 'react';
import classNames from 'classnames/bind';
import styles from './RecruiterAISuggest.module.scss';
import images from '~/assets/images';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authAPI, userApis, recruiterApis } from "~/utils/api";
import UserContext from "~/context/UserContext";
import useScrollTop from '~/hooks/useScrollTop';
import { FaTimes, FaRobot, FaSpinner, FaChartBar, FaFileAlt, FaQuestionCircle, FaUserCheck, FaEdit } from "react-icons/fa";
import { EventSourcePolyfill } from 'event-source-polyfill';
import ModelAI from '~/components/ModelAI';

const cx = classNames.bind(styles);

const APPLICATION_STATUS = [
    "Đang xét duyệt",
    "Chờ phỏng vấn",
    "Đã phỏng vấn",
    "Đạt phỏng vấn",
    "Đã nhận",
    "Đã từ chối",
    "Hết hạn",
];

const RecruiterAISuggest = () => {
    useScrollTop();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [jobApplications, setJobApplications] = useState({});
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState("Đang xét duyệt");
    const [hasBusinessLicense, setHasBusinessLicense] = useState(false);
    const [isCheckingLicense, setIsCheckingLicense] = useState(true);
    const [companyInfo, setCompanyInfo] = useState(null);
    const token = localStorage.getItem("token");
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [isAnalyzingCV, setIsAnalyzingCV] = useState(false);
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
    const [isAnalyzingFit, setIsAnalyzingFit] = useState(false);
    const [isAnalyzingJobPost, setIsAnalyzingJobPost] = useState(false);
    const [cvAnalysis, setCvAnalysis] = useState(null);
    const [interviewQuestions, setInterviewQuestions] = useState(null);
    const [candidateFit, setCandidateFit] = useState(null);
    const [jobPostAnalysis, setJobPostAnalysis] = useState(null);
    const [selectedModel, setSelectedModel] = useState("gemini-1.5-pro");
    const [matchScores, setMatchScores] = useState({});
    const [showMatchDetail, setShowMatchDetail] = useState(null);
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [isComparing, setIsComparing] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [isScreening, setIsScreening] = useState(false);
    const [screeningResult, setScreeningResult] = useState(null);
    const [jobSkillsMap, setJobSkillsMap] = useState({});
    const [candidateSkillsMap, setCandidateSkillsMap] = useState({});
    const [loadingMatchScores, setLoadingMatchScores] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsCheckingLicense(true);
                // Fetch company info
                const responseCompany = await authAPI().get(
                    recruiterApis.getAllRecruiterCompanies
                );
                setCompanyInfo(responseCompany.data.companies[0]);
                console.log("Company info:", responseCompany.data.companies[0]);

                // Check business license
                const responseCheckLicense = await authAPI().get(
                    recruiterApis.checkBusinessLicense(responseCompany.data.companies[0].company_id)
                );
                setHasBusinessLicense(responseCheckLicense.data.businessLicense);

                if (responseCheckLicense.data.businessLicense) {
                    // Fetch jobs
                    const responseJobs = await authAPI().get(
                    recruiterApis.getAllJobsByCompanyId(
                        responseCompany.data.companies[0].company_id
                    )
                );
                    setJobs(responseJobs.data.jobs);
                    console.log(responseJobs.data.jobs);

                    // Get all job applications for each job
                const applications = {};
                    for (const job of responseJobs.data.jobs) {
                    const responseJobApplications = await authAPI().get(
                        recruiterApis.getAllJobApplicationsByJobId(job.job_id)
                    );
                        applications[job.job_id] = responseJobApplications.data.jobApplications;
                    }
                    setJobApplications(applications);
                    console.log(jobApplications);
                }
            } catch (error) {
                console.error(error);
                toast.error("Có lỗi xảy ra khi tải dữ liệu");
            } finally {
                setIsCheckingLicense(false);
            }
        };

        if (token) {
            fetchData();
        }
    }, [token]);

    useEffect(() => {
        if (selectedJob && jobApplications[selectedJob.job_id]) {
            // Only fetch skills for visible applications
            const visibleApplications = jobApplications[selectedJob.job_id]
                .filter(app => app.status === activeTab);
                
            visibleApplications.forEach(async (app) => {
                const candidateId = app.candidate?.candidate_id;
                if (candidateId && !candidateSkillsMap[candidateId]) {
                    try {
                        const res = await authAPI().get(recruiterApis.getCandidateSkills(candidateId));
                        setCandidateSkillsMap(prev => ({ ...prev, [candidateId]: res.data.skills || [] }));
                        if (app.candidate) app.candidate.skills = res.data.skills || [];
                        // Calculate match score immediately after getting skills
                        fetchMatchScore(app);
                    } catch (err) {
                        if (app.candidate) app.candidate.skills = [];
                        console.error('Error fetching candidate skills:', err);
                    }
                } else if (candidateId && !matchScores[app.application_id]) {
                    // If we have skills but no match score, calculate it
                    fetchMatchScore(app);
                }
            });
        }
        // eslint-disable-next-line
    }, [selectedJob, jobApplications, activeTab]);

    const handleSelectJob = async (job) => {
        setSelectedJob(job);
        // Fetch job skills from backend
        try {
            const res = await authAPI().get(recruiterApis.getJobSkills(job.job_id));
            setJobSkillsMap(prev => ({ ...prev, [job.job_id]: res.data.skills || [] }));
            // Attach to job object for AI
            job.skills = res.data.skills || [];
        } catch (err) {
            job.skills = [];
        }
        await fetchAISuggestions(job.job_id);
    };

    const fetchAISuggestions = async (jobId) => {
        try {

        } catch (error) {
            console.error("Error getting AI suggestions:", error);
            toast.error("Không thể tạo gợi ý ứng viên");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            await authAPI().post(recruiterApis.editJobApplicationStatus, {
                job_application_id: applicationId,
                status: newStatus,
                user_id: user.id,
                recruiter_id: companyInfo.user_id,
                company_id: companyInfo.company_id,
                company_name: companyInfo.company_name,
            });

            const updatedApplications = jobApplications[selectedJob.job_id].map(
                (application) => {
                    if (application.application_id === applicationId) {
                        return { ...application, status: newStatus };
                    }
                    return application;
                }
            );
            setJobApplications((prev) => ({
                ...prev,
                [selectedJob.job_id]: updatedApplications,
            }));

            toast.success("Cập nhật trạng thái thành công");
        } catch (error) {
            console.error("Error updating application status:", error);
            toast.error("Không thể cập nhật trạng thái");
        }
    };

    const handleViewCandidate = (candidateId) => {
        navigate(`/recruiter/candidate-detail/${candidateId}`);
    };

    const getApplicationCountByStatus = (status) => {
        return jobApplications[selectedJob?.job_id]?.filter(
            (app) => app.status === status
        ).length || 0;
    };

    const analyzeCV = async (candidate) => {
        if (!candidate?.CV_link) {
            toast.error("Ứng viên chưa có CV");
            return;
        }

        setIsAnalyzingCV(true);
        setSelectedCandidate(candidate);
        const token = localStorage.getItem("token");

        const prompt = `Là một chuyên gia tuyển dụng, hãy phân tích CV của ứng viên và đưa ra nhận xét chi tiết:

1. Thông tin cơ bản:
- Tên: ${candidate.user?.name}
- Vị trí hiện tại: ${candidate.candidate?.current_job_title}
- Công ty hiện tại: ${candidate.candidate?.current_company}
- Kinh nghiệm: ${candidate.candidate?.experience}
- Kỹ năng: ${candidate.candidate?.skills}

2. Phân tích:
- Điểm mạnh
- Điểm yếu
- Kinh nghiệm phù hợp
- Kỹ năng phù hợp
- Đề xuất câu hỏi phỏng vấn cụ thể

3. Đánh giá tổng quan:
- Mức độ phù hợp với vị trí
- Tiềm năng phát triển
- Đề xuất cải thiện`;



        try {
            const eventSource = new EventSourcePolyfill(
                `${process.env.REACT_APP_API_URL}/openai/chat-stream?prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(selectedModel)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Accept': 'text/event-stream',
                    },
                    withCredentials: false,
                    heartbeatTimeout: 60000,
                }
            );

            let aiResponse = "";

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    aiResponse += data;
                    setCvAnalysis(aiResponse);
                } catch (error) {
                    console.error('Error parsing event data:', error);
                }
            };

            eventSource.onerror = (error) => {
                console.error('EventSource error:', error);
                eventSource.close();
                setIsAnalyzingCV(false);
            };

        } catch (error) {
            console.error('Error:', error);
            toast.error("Đã xảy ra lỗi khi phân tích CV");
            setIsAnalyzingCV(false);
        }
    };

    const generateInterviewQuestions = async (candidate) => {
        setIsGeneratingQuestions(true);
        setSelectedCandidate(candidate);
        const token = localStorage.getItem("token");

        const prompt = `Là một chuyên gia tuyển dụng, hãy tạo danh sách câu hỏi phỏng vấn cho ứng viên:

Thông tin ứng viên:
- Tên: ${candidate.user?.name}
- Vị trí ứng tuyển: ${selectedJob?.title}
- Kinh nghiệm: ${candidate.candidate?.experience}
- Kỹ năng: ${candidate.candidate?.skills}

Hãy tạo các câu hỏi theo các nhóm:
1. Câu hỏi chung về kinh nghiệm
2. Câu hỏi kỹ thuật
3. Câu hỏi về kỹ năng mềm
4. Câu hỏi về mục tiêu nghề nghiệp
5. Câu hỏi về văn hóa công ty`;

        try {
            const eventSource = new EventSourcePolyfill(
                `${process.env.REACT_APP_API_URL}/openai/chat-stream?prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(selectedModel)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Accept': 'text/event-stream',
                    },
                    withCredentials: false,
                    heartbeatTimeout: 60000,
                }
            );

            let aiResponse = "";

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    aiResponse += data;
                    setInterviewQuestions(aiResponse);
                } catch (error) {
                    console.error('Error parsing event data:', error);
                }
            };

            eventSource.onerror = (error) => {
                console.error('EventSource error:', error);
                eventSource.close();
                setIsGeneratingQuestions(false);
            };

        } catch (error) {
            console.error('Error:', error);
            toast.error("Đã xảy ra lỗi khi tạo câu hỏi phỏng vấn");
            setIsGeneratingQuestions(false);
        }
    };

    const analyzeCandidateFit = async (candidate) => {
        setIsAnalyzingFit(true);
        setSelectedCandidate(candidate);
        const token = localStorage.getItem("token");
        const jobSkills = jobSkillsMap[selectedJob.job_id] || [];
        const candidateSkills = candidateSkillsMap[candidate.candidate?.candidate_id] || [];
        const prompt = `Là một chuyên gia tuyển dụng, hãy đánh giá mức độ phù hợp của ứng viên với vị trí:

Thông tin ứng viên:
- Tên: ${candidate.user?.name}
- Vị trí ứng tuyển: ${selectedJob?.title}
- Kinh nghiệm: ${candidate.candidate?.experience}
- Kỹ năng: ${candidateSkills.join(', ')}

Thông tin công việc:
- Mô tả: ${selectedJob?.description}
- Yêu cầu: ${selectedJob?.job_requirements}
- Kỹ năng cần thiết: ${jobSkills.join(', ')}

Hãy đánh giá theo các tiêu chí:
1. Phù hợp về kỹ năng
2. Phù hợp về kinh nghiệm
3. Phù hợp về mục tiêu nghề nghiệp
4. Phù hợp về văn hóa công ty
5. Điểm mạnh và điểm yếu
6. Đề xuất cải thiện`;

        try {
            const eventSource = new EventSourcePolyfill(
                `${process.env.REACT_APP_API_URL}/openai/chat-stream?prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(selectedModel)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Accept': 'text/event-stream',
                    },
                    withCredentials: false,
                    heartbeatTimeout: 60000,
                }
            );

            let aiResponse = "";

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    aiResponse += data;
                    setCandidateFit(aiResponse);
                } catch (error) {
                    console.error('Error parsing event data:', error);
                }
            };

            eventSource.onerror = (error) => {
                console.error('EventSource error:', error);
                eventSource.close();
                setIsAnalyzingFit(false);
            };

        } catch (error) {
            console.error('Error:', error);
            toast.error("Đã xảy ra lỗi khi đánh giá ứng viên");
            setIsAnalyzingFit(false);
        }
    };

    const analyzeJobPost = async () => {
        if (!selectedJob) {
            toast.error("Vui lòng chọn công việc trước");
            return;
        }

        setIsAnalyzingJobPost(true);
        const token = localStorage.getItem("token");

        const prompt = `Là một chuyên gia tuyển dụng, hãy phân tích job post và đưa ra đề xuất cải thiện:

Thông tin công việc:
- Tiêu đề: ${selectedJob.title}
- Mô tả: ${selectedJob.description}
- Yêu cầu: ${selectedJob.job_requirements}
- Quyền lợi: ${selectedJob.benefits}
- Mức lương: ${selectedJob.salary}
- Kinh nghiệm yêu cầu: ${selectedJob.experience}
- Địa điểm: ${selectedJob.location}

Hãy phân tích theo các tiêu chí:
1. Tính hấp dẫn của job post
2. Tính rõ ràng của thông tin
3. Tính cạnh tranh của mức lương và phúc lợi
4. Tính phù hợp giữa yêu cầu và quyền lợi
5. Đề xuất cải thiện chi tiết`;

        try {
            const eventSource = new EventSourcePolyfill(
                `${process.env.REACT_APP_API_URL}/openai/chat-stream?prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(selectedModel)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Accept': 'text/event-stream',
                    },
                    withCredentials: false,
                    heartbeatTimeout: 60000,
                }
            );

            let aiResponse = "";

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    aiResponse += data;
                    setJobPostAnalysis(aiResponse);
                } catch (error) {
                    console.error('Error parsing event data:', error);
                }
            };

            eventSource.onerror = (error) => {
                console.error('EventSource error:', error);
                eventSource.close();
                setIsAnalyzingJobPost(false);
            };

        } catch (error) {
            console.error('Error:', error);
            toast.error("Đã xảy ra lỗi khi phân tích job post");
            setIsAnalyzingJobPost(false);
        }
    };

    const fetchMatchScore = async (application) => {
        if (!application.candidate?.candidate_id || !selectedJob?.job_id) return;
        
        setLoadingMatchScores(prev => ({ ...prev, [application.application_id]: true }));
        
        try {
            const jobSkills = jobSkillsMap[selectedJob.job_id] || [];
            const candidateSkills = candidateSkillsMap[application.candidate?.candidate_id] || [];
            
        const res = await fetch(`${process.env.REACT_APP_API_URL}/openai/match-score`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                candidate: {
                        ...application.candidate,
                        skills: candidateSkills,
                },
                job: {
                        ...selectedJob,
                        skills: jobSkills,
                },
                model: selectedModel,
            }),
        });
            
            if (!res.ok) throw new Error('Failed to fetch match score');
            
        const data = await res.json();
            setMatchScores(prev => ({
            ...prev,
            [application.application_id]: data,
        }));
        } catch (error) {
            console.error("Error calculating match score:", error);
            toast.error("Không thể tính toán độ phù hợp");
        } finally {
            setLoadingMatchScores(prev => ({ ...prev, [application.application_id]: false }));
        }
    };

    const handleShowMatchDetail = (applicationId) => {
        setShowMatchDetail(applicationId);
    };

    const handleCloseMatchDetail = () => {
        setShowMatchDetail(null);
    };

    const handleCandidateSelection = (application) => {
        setSelectedCandidates(prev => {
            const isSelected = prev.some(c => c.application_id === application.application_id);
            if (isSelected) {
                return prev.filter(c => c.application_id !== application.application_id);
            } else {
                return [...prev, application];
            }
        });
    };

    const compareCandidates = async () => {
        if (selectedCandidates.length < 2) {
            toast.error("Vui lòng chọn ít nhất 2 ứng viên để so sánh");
            return;
        }

        setIsComparing(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/openai/compare-candidates`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    candidates: selectedCandidates.map(candidate => ({
                        name: candidate.user?.name,
                        experience: candidate.candidate?.experience,
                        skills: candidateSkillsMap[candidate.candidate?.candidate_id] || [],
                        current_salary: candidate.candidate?.current_salary,
                        expected_salary: candidate.candidate?.expected_salary,
                        location: candidate.candidate?.location,
                        qualifications: candidate.candidate?.qualifications,
                        career_objective: candidate.candidate?.career_objective,
                    })),
                    job: selectedJob,
                    model: selectedModel,
                }),
            });
            const data = await response.json();
            setComparisonResult(data);
        } catch (error) {
            console.error("Error comparing candidates:", error);
            toast.error("Không thể so sánh ứng viên");
        } finally {
            setIsComparing(false);
        }
    };

    const screenCandidates = async () => {
        if (!selectedJob) {
            toast.error("Vui lòng chọn công việc trước");
            return;
        }
        
        if (!jobApplications[selectedJob.job_id] || jobApplications[selectedJob.job_id].length === 0) {
            toast.error("Không có ứng viên để sàng lọc");
            return;
        }

        setIsScreening(true);
        try {
            // Lấy tất cả ứng viên đang ở trạng thái "Đang xét duyệt"
            const candidatesToScreen = jobApplications[selectedJob.job_id]
                .filter(app => app.status === "Đang xét duyệt")
                .map(candidate => ({
                    name: candidate.user?.name,
                    experience: candidate.candidate?.experience,
                    skills: candidateSkillsMap[candidate.candidate?.candidate_id] || [],
                    current_salary: candidate.candidate?.current_salary,
                    expected_salary: candidate.candidate?.expected_salary,
                    location: candidate.candidate?.location,
                    qualifications: candidate.candidate?.qualifications,
                    career_objective: candidate.candidate?.career_objective,
                }));
            
            if (candidatesToScreen.length === 0) {
                toast.warning("Không có ứng viên ở trạng thái 'Đang xét duyệt' để sàng lọc");
                setIsScreening(false);
                return;
            }
            
            const response = await fetch(`${process.env.REACT_APP_API_URL}/openai/screen-candidates`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    candidates: candidatesToScreen,
                    job: selectedJob,
                    model: selectedModel,
                    screeningCriteria: [
                        "Kỹ năng phù hợp với công việc ít nhất 60%",
                        "Kinh nghiệm đáp ứng yêu cầu tối thiểu",
                        "Mức lương mong muốn phù hợp với ngân sách",
                        "Địa điểm làm việc phù hợp hoặc có khả năng di chuyển",
                        "Trình độ học vấn đáp ứng yêu cầu"
                    ]
                }),
            });
            
            const data = await response.json();
            setScreeningResult(data);
            
            // Tự động cập nhật trạng thái ứng viên dựa trên kết quả sàng lọc
            if (data.screening_results) {
                for (const result of data.screening_results) {
                    const application = jobApplications[selectedJob.job_id].find(
                        app => app.user?.name === result.name
                    );
                    
                    if (application) {
                        let newStatus;
                        if (result.status === "pass") {
                            newStatus = "Chờ phỏng vấn";
                        } else if (result.status === "reject") {
                            newStatus = "Đã từ chối";
                        } else {
                            // Keep as is for "review" status
                            continue;
                        }
                        
                        // Update the status in the database
                        await handleStatusChange(application.application_id, newStatus);
                    }
                }
            }
            
            toast.success(`Đã sàng lọc ${data.screening_results.length} ứng viên thành công`);
        } catch (error) {
            console.error("Error screening candidates:", error);
            toast.error("Không thể sàng lọc ứng viên");
        } finally {
            setIsScreening(false);
        }
    };

    if (isCheckingLicense) {
        return (
            <div className={cx("wrapper")}>
                <div className={cx("loading")}>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <p>Đang tải...</p>
                </div>
            </div>
        );
    }

    if (!hasBusinessLicense) {
        return (
            <div className={cx("wrapper")}>
                <div className={cx("no-license")}>
                    <div className={cx("message")}>
                        <i className="fa-solid fa-exclamation-circle"></i>
                        <h2>Bạn cần cập nhật giấy phép kinh doanh</h2>
                        <p>Để sử dụng tính năng gợi ý ứng viên, vui lòng cập nhật thông tin giấy phép kinh doanh của công ty.</p>
                        <button className={cx("add-license-btn")} onClick={() => navigate("/recruiter/settings", { state: { activeTab: 'license' } })}>
                            <i className="fa-solid fa-plus"></i>
                            Thêm giấy phép kinh doanh
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header-section')}>
                <h1>Gợi ý ứng viên thông minh</h1>
                <p>Sử dụng AI để tìm ứng viên phù hợp với công việc của bạn</p>
            </div>

            <div className={cx('ai-container')}>
                <div className={cx('job-selector')}>
                    <h2>Chọn công việc để nhận gợi ý</h2>
                    {jobs.length === 0 ? (
                        <div className={cx('no-jobs')}>
                            <i className="fas fa-briefcase"></i>
                            <h3>Chưa có công việc nào</h3>
                            <p>Đăng tin tuyển dụng để nhận gợi ý ứng viên phù hợp</p>
                            <button onClick={() => navigate('/recruiter/post-job')}>
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
                                        <span className={cx('job-date')}>
                                            <i className="fas fa-calendar"></i> 
                                            {new Date(job.created_at).toLocaleDateString('vi-VN')}
                                        </span>
                                        <span className={cx('job-applications')}>
                                            <i className="fas fa-users"></i> 
                                            {jobApplications[job.job_id]?.length || 0}
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
                                <div className={cx('ai-actions')}>
                                    {selectedCandidates.length >= 2 && (
                                        <button
                                            className={cx('ai-action-btn')}
                                            onClick={compareCandidates}
                                            disabled={isComparing}
                                        >
                                            {isComparing ? (
                                                <>
                                                    <FaSpinner className={cx("spinner")} />
                                                    Đang so sánh...
                                                </>
                                            ) : (
                                                <>
                                                    <FaChartBar />
                                                    So sánh ứng viên ({selectedCandidates.length})
                                                </>
                                            )}
                                        </button>
                                    )}
                                    <button
                                        className={cx('ai-action-btn')}
                                        onClick={screenCandidates}
                                        disabled={isScreening}
                                    >
                                        {isScreening ? (
                                            <>
                                                <FaSpinner className={cx("spinner")} />
                                                Đang sàng lọc...
                                            </>
                                        ) : (
                                            <>
                                                <FaUserCheck />
                                                Sàng lọc tự động
                                            </>
                                        )}
                                    </button>
                                    <button
                                        className={cx('ai-action-btn')}
                                        onClick={analyzeJobPost}
                                        disabled={isAnalyzingJobPost}
                                    >
                                        {isAnalyzingJobPost ? (
                                            <>
                                                <FaSpinner className={cx("spinner")} />
                                                Đang phân tích...
                                            </>
                                        ) : (
                                            <>
                                                <FaEdit />
                                                Phân tích job post
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className={cx('tabs')}>
                                {APPLICATION_STATUS.map((status) => (
                                    <button
                                        key={status}
                                        className={cx('tab', { active: activeTab === status })}
                                        onClick={() => setActiveTab(status)}
                                    >
                                        {status} ({getApplicationCountByStatus(status)})
                                    </button>
                                ))}
                            </div>

                            {jobApplications[selectedJob.job_id]?.length > 0 ? (
                                <table className={cx('candidate-table')}>
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th>Tên</th>
                                            <th>Địa điểm</th>
                                            <th>Lương</th>
                                            <th>Trạng thái CV</th>
                                            <th>CV</th>
                                            <th>Về tôi</th>
                                            <th>Mục tiêu nghề nghiệp</th>
                                            <th>% Phù hợp</th>
                                            <th>Trạng thái</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {jobApplications[selectedJob.job_id]
                                            .filter((application) => application.status === activeTab)
                                            .map((application) => (
                                                <tr key={application.application_id}>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCandidates.some(c => c.application_id === application.application_id)}
                                                            onChange={() => handleCandidateSelection(application)}
                                                            className={cx('candidate-checkbox')}
                                                        />
                                                    </td>
                                                    <td>{application.user?.name || "Không có tên"}</td>
                                                    <td>{application.candidate?.location || "Không có địa điểm"}</td>
                                                    <td>${application.candidate?.current_salary || "Không có thông tin"}</td>
                                                    <td>{application.status || "Không có thông tin"}</td>
                                                    <td>
                                                        <a
                                                            href={application.candidate?.CV_link}
                                                            className={cx('download-btn')}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            Tải CV
                                                        </a>
                                                    </td>
                                                    <td>{application.candidate?.about_me || "Không có thông tin"}</td>
                                                    <td>{application.candidate?.career_objective || "Không có thông tin"}</td>
                                                    <td>
                                                        {loadingMatchScores[application.application_id] ? (
                                                            <div className={cx('loading-score')}>
                                                                <FaSpinner className={cx("spinner")} />
                                                                <span>Đang tính...</span>
                                                            </div>
                                                        ) : matchScores[application.application_id] ? (
                                                                <>
                                                                    {matchScores[application.application_id].score}%
                                                                    <button
                                                                        className={cx('detail-btn')}
                                                                        onClick={() => handleShowMatchDetail(application.application_id)}
                                                                    >
                                                                        Chi tiết
                                                                    </button>
                                                                </>
                                                        ) : (
                                                            <button 
                                                                className={cx('calculate-btn')}
                                                                onClick={() => fetchMatchScore(application)}
                                                            >
                                                                Tính độ phù hợp
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <select
                                                            value={application.status}
                                                            onChange={(e) => handleStatusChange(application.application_id, e.target.value)}
                                                            className={cx('status-select')}
                                                        >
                                                            {APPLICATION_STATUS.map((status) => (
                                                                <option key={status} value={status}>
                                                                    {status}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <div className={cx('action-buttons')}>
                                                            <button
                                                                className={cx('action-btn')}
                                                                onClick={() => generateInterviewQuestions(application)}
                                                                disabled={isGeneratingQuestions}
                                                            >
                                                                <FaQuestionCircle />
                                                                Câu hỏi PV
                                                            </button>
                                                            <button
                                                                className={cx('action-btn')}
                                                                onClick={() => analyzeCandidateFit(application)}
                                                                disabled={isAnalyzingFit}
                                                            >
                                                                <FaUserCheck />
                                                                Đánh giá phù hợp
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className={cx('no-matches')}>
                                    <i className="fas fa-search"></i>
                                    <h3>Không tìm thấy ứng viên phù hợp</h3>
                                    <p>Hãy thử điều chỉnh yêu cầu công việc hoặc quay lại sau</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* AI Analysis Modal */}
            {selectedCandidate && (
                <div className={cx('analysis-modal')}>
                    <div className={cx('modal-content')}>
                        <button className={cx('close-btn')} onClick={() => setSelectedCandidate(null)}>
                            <FaTimes />
                        </button>
                        <h3>Phân tích ứng viên: {selectedCandidate.user?.name}</h3>

                        {cvAnalysis && (
                            <div className={cx('analysis-section')}>
                                <h4>Phân tích CV</h4>
                                <div className={cx('analysis-content')}>
                                    {cvAnalysis.split('\n').map((line, index) => (
                                        <p key={index}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {interviewQuestions && (
                            <div className={cx('analysis-section')}>
                                <h4>Câu hỏi phỏng vấn</h4>
                                <div className={cx('analysis-content')}>
                                    {interviewQuestions.split('\n').map((line, index) => (
                                        <p key={index}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {candidateFit && (
                            <div className={cx('analysis-section')}>
                                <h4>Đánh giá mức độ phù hợp</h4>
                                <div className={cx('analysis-content')}>
                                    {candidateFit.split('\n').map((line, index) => (
                                        <p key={index}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Job Post Analysis Modal */}
            {jobPostAnalysis && (
                <div className={cx('analysis-modal')}>
                    <div className={cx('modal-content')}>
                        <button className={cx('close-btn')} onClick={() => setJobPostAnalysis(null)}>
                            <FaTimes />
                        </button>
                        <h3>Phân tích job post: {selectedJob.title}</h3>
                        <div className={cx('analysis-content')}>
                            {jobPostAnalysis.split('\n').map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showMatchDetail && matchScores[showMatchDetail] && (
                <div className={cx('analysis-modal')}>
                    <div className={cx('modal-content')}>
                        <button className={cx('close-btn')} onClick={handleCloseMatchDetail}>
                            <FaTimes />
                        </button>
                        <h3>Chi tiết đánh giá phù hợp</h3>
                        <div className={cx('analysis-content')}>
                            <div className={cx('score-overview')}>
                                <h4>Tổng điểm: {matchScores[showMatchDetail].score}%</h4>
                                <p>{matchScores[showMatchDetail].overall_reason}</p>
                            </div>

                            <div className={cx('score-details')}>
                                {Object.entries(matchScores[showMatchDetail].details).map(([category, detail]) => (
                                    <div key={category} className={cx('score-category')}>
                                        <h5>{category.charAt(0).toUpperCase() + category.slice(1)}</h5>
                                        <div className={cx('score-bar')}>
                                            <div 
                                                className={cx('score-fill')}
                                                style={{ width: `${detail.score}%` }}
                                            ></div>
                                            <span>{detail.score}%</span>
                                        </div>
                                        <p>{detail.reason}</p>
                                    </div>
                                ))}
                            </div>

                            <div className={cx('suggestions')}>
                                <h4>Đề xuất</h4>
                                <ul>
                                    {matchScores[showMatchDetail].suggestions.map((suggestion, index) => (
                                        <li key={index}>{suggestion}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Comparison Modal */}
            {comparisonResult && (
                <div className={cx('analysis-modal')}>
                    <div className={cx('modal-content')}>
                        <button className={cx('close-btn')} onClick={() => setComparisonResult(null)}>
                            <FaTimes />
                        </button>
                        <h3>Kết quả so sánh ứng viên</h3>

                        <div className={cx('comparison-section')}>
                            <div className={cx('overall-comparison')}>
                                <h4>Ứng viên phù hợp nhất</h4>
                                <p className={cx('best-candidate')}>
                                    {comparisonResult.comparison.overall.best_candidate}
                                </p>
                                <p className={cx('reason')}>
                                    {comparisonResult.comparison.overall.reason}
                                </p>
                            </div>

                            <div className={cx('candidates-comparison')}>
                                {comparisonResult.comparison.candidates.map((candidate, index) => (
                                    <div key={index} className={cx('candidate-card')}>
                                        <h5>{candidate.name}</h5>
                                        <div className={cx('rank')}>Xếp hạng: {candidate.rank}</div>
                                        <div className={cx('fit-score')}>
                                            Điểm phù hợp: {candidate.fit_score}%
                                        </div>
                                        
                                        <div className={cx('strengths')}>
                                            <h6>Điểm mạnh</h6>
                                            <ul>
                                                {candidate.strengths.map((strength, i) => (
                                                    <li key={i}>{strength}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className={cx('weaknesses')}>
                                            <h6>Điểm yếu</h6>
                                            <ul>
                                                {candidate.weaknesses.map((weakness, i) => (
                                                    <li key={i}>{weakness}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className={cx('recommendation')}>
                                            <h6>Đề xuất</h6>
                                            <p>{candidate.recommendation}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={cx('summary-section')}>
                                <h4>Tổng kết</h4>
                                <div className={cx('key-differences')}>
                                    <h5>Khác biệt chính</h5>
                                    <ul>
                                        {comparisonResult.summary.key_differences.map((diff, index) => (
                                            <li key={index}>{diff}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className={cx('recommendations')}>
                                    <h5>Đề xuất</h5>
                                    <ul>
                                        {comparisonResult.summary.recommendations.map((rec, index) => (
                                            <li key={index}>{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Screening Results Modal */}
            {screeningResult && (
                <div className={cx('analysis-modal')}>
                    <div className={cx('modal-content')}>
                        <button className={cx('close-btn')} onClick={() => setScreeningResult(null)}>
                            <FaTimes />
                        </button>
                        <h3>Kết quả sàng lọc tự động</h3>

                        <div className={cx('screening-summary')}>
                            <h4>Tổng quan</h4>
                            <div className={cx('summary-stats')}>
                                <div className={cx('stat-item', 'pass')}>
                                    <span className={cx('stat-value')}>{screeningResult.summary.passed}</span>
                                    <span className={cx('stat-label')}>Đạt yêu cầu</span>
                                </div>
                                <div className={cx('stat-item', 'review')}>
                                    <span className={cx('stat-value')}>{screeningResult.summary.review}</span>
                                    <span className={cx('stat-label')}>Cần xem xét</span>
                                </div>
                                <div className={cx('stat-item', 'reject')}>
                                    <span className={cx('stat-value')}>{screeningResult.summary.rejected}</span>
                                    <span className={cx('stat-label')}>Không phù hợp</span>
                                </div>
                            </div>
                        </div>

                        <div className={cx('screening-results')}>
                            <h4>Chi tiết ứng viên</h4>
                            {screeningResult.screening_results.map((result, index) => (
                                <div 
                                    key={index} 
                                    className={cx('screening-candidate', {
                                        'pass': result.status === 'pass',
                                        'review': result.status === 'review',
                                        'reject': result.status === 'reject'
                                    })}
                                >
                                    <h5>{result.name}</h5>
                                    <div className={cx('status-badge', result.status)}>
                                        {result.status === 'pass' ? 'Đạt yêu cầu' :
                                         result.status === 'review' ? 'Cần xem xét' : 'Không phù hợp'}
                                    </div>
                                    
                                    <div className={cx('score-display')}>
                                        <div className={cx('score-bar')}>
                                            <div 
                                                className={cx('score-fill')}
                                                style={{ width: `${result.score}%` }}
                                            ></div>
                                        </div>
                                        <span className={cx('score-value')}>{result.score}%</span>
                                    </div>
                                    
                                    <div className={cx('reasons')}>
                                        <h6>Lý do:</h6>
                                        <ul>
                                            {result.reasons.map((reason, i) => (
                                                <li key={i}>{reason}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <div className={cx('recommendation')}>
                                        <h6>Đề xuất:</h6>
                                        <p>{result.recommendation}</p>
                                    </div>
                                    
                                    {result.suggested_interview_questions && (
                                        <div className={cx('interview-questions')}>
                                            <h6>Câu hỏi phỏng vấn gợi ý:</h6>
                                            <ol>
                                                {result.suggested_interview_questions.map((question, i) => (
                                                    <li key={i}>{question}</li>
                                                ))}
                                            </ol>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className={cx('recommendations')}>
                            <h4>Đề xuất chung</h4>
                            <ul>
                                {screeningResult.summary.recommendations.map((recommendation, index) => (
                                    <li key={index}>{recommendation}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterAISuggest;
