// UpCV page

import React, { useState, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './UpCV.module.scss';
import { useDropzone } from 'react-dropzone';
import upCVImage from '../../../assets/images/cv_banner.png';

const cx = classNames.bind(styles);

const UpCV = () => {
    const [selectedFile, setSelectedFile] = useState(null);

    const onDrop = useCallback(acceptedFiles => {
        setSelectedFile(acceptedFiles[0]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxSize: 5242880 // 5MB
    });

    const handleUpload = () => {
        if (!selectedFile) {
            alert('Vui lòng chọn file CV trước khi tải lên');
            return;
        }
        // Xử lý upload file
        console.log('Uploading file:', selectedFile);
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('upload-section')}>
                <div className={cx('upload-banner')}>
                    <div className={cx('banner-content')}>
                        <h2>Upload CV để các cơ hội việc làm tự tìm đến bạn</h2>
                        <p>Giảm đến 50% thời gian cần thiết để tìm được một công việc phù hợp</p>
                    </div>
                    <div className={cx('banner-image')}>
                        <img src={upCVImage} alt="Upload CV" />
                    </div>
                </div>

                <div className={cx('upload-box')}>
                    <p className={cx('upload-desc')}>
                        Bạn đã có sẵn CV của mình, chỉ cần tải CV lên, hệ thống sẽ tự động đề xuất CV của bạn tới những nhà tuyển dụng ưu tín.
                        <br />
                        Tiết kiệm thời gian, tìm việc thông minh, nắm bắt cơ hội và làm chủ đường đua nghề nghiệp của chính mình.
                    </p>

                    <div {...getRootProps()} className={cx('upload-area', { active: isDragActive })}>
                        <input {...getInputProps()} className={cx('file-input')} />
                        <label className={cx('upload-label')}>
                            <span>{selectedFile ? selectedFile.name : 'Tải lên CV từ máy tính, chọn hoặc kéo thả'}</span>
                            <small>Hỗ trợ định dạng .doc, .docx, .pdf có kích thước dưới 5MB</small>
                            <button className={cx('choose-btn')}>
                                {selectedFile ? 'Chọn file khác' : 'Chọn CV'}
                            </button>
                        </label>
                    </div>

                    <button 
                        className={cx('upload-btn')} 
                        onClick={handleUpload}
                        disabled={!selectedFile}
                    >
                        <i className="fas fa-cloud-upload-alt"></i>
                        {' '}Tải CV lên
                    </button>
                </div>

                <div className={cx('features-grid')}>
                    <div className={cx('feature-card')}>
                        <div className={cx('feature-icon', 'green')}>
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <h3>Nhận về các cơ hội tốt nhất</h3>
                        <p>CV của bạn sẽ được ưu tiên hiển thị tới các nhà tuyển dụng đã xác thực. Nhận được tới mời với những cơ hội việc làm hấp dẫn từ các doanh nghiệp uy tín.</p>
                    </div>

                    <div className={cx('feature-card')}>
                        <div className={cx('feature-icon', 'blue')}>
                            <i className="fas fa-chart-line"></i>
                        </div>
                        <h3>Theo dõi số liệu, tối ưu CV</h3>
                        <p>Theo dõi số lượt xem CV. Biết chính xác nhà tuyển dụng nào trên TopCV đang quan tâm đến CV của bạn.</p>
                    </div>

                    <div className={cx('feature-card')}>
                        <div className={cx('feature-icon', 'purple')}>
                            <i className="fas fa-share"></i>
                        </div>
                        <h3>Chia sẻ CV bất cứ nơi đâu</h3>
                        <p>Upload một lần và sử dụng đường link gửi tới nhiều nhà tuyển dụng.</p>
                    </div>

                    <div className={cx('feature-card')}>
                        <div className={cx('feature-icon', 'red')}>
                            <i className="fas fa-handshake"></i>
                        </div>
                        <h3>Kết nối nhanh chóng với nhà tuyển dụng</h3>
                        <p>Dễ dàng kết nối với các nhà tuyển dụng nào xem và quan tâm tới CV của bạn</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpCV;