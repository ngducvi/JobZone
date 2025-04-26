// UpCV page

import React, { useCallback, useState, useContext } from 'react';
import classNames from 'classnames/bind';
import styles from './UpCV.module.scss';
import { useDropzone } from 'react-dropzone';
import { authAPI, userApis } from '~/utils/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCloudUploadAlt, 
    faFileAlt, 
    faTimes, 
    faCheckCircle,
    faFileUpload,
    faShieldAlt,
    faSearch,
    faRocket
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import UserContext from "~/context/UserContext";
import PDFViewer from '~/components/PDFViewer/PDFViewer';

const cx = classNames.bind(styles);

function UpCV() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedPdfUrl, setUploadedPdfUrl] = useState(null);
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
   
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setSelectedFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxFiles: 1
    });

    const removeFile = () => {
        setSelectedFile(null);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Vui lòng chọn file để tải lên');
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const user_id = user.id;

            const formData = new FormData();
            formData.append('cv_file', selectedFile);
            formData.append('user_id', user_id);
            formData.append('cv_name', selectedFile.name);

            const response = await axios({
                method: 'post',
                url: 'http://localhost:8080/api/v1/user/create-candidate-cv-with-cv-id',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
                data: formData
            });

            if (response.data.code === 1) {
                toast.success('Tải lên CV thành công!');
                if (response.data.data && response.data.data.cv_link) {
                    setUploadedPdfUrl(response.data.data.cv_link);
                }
                setTimeout(() => {
                navigate('/user/manager-cv');
                }, 2000);
            } else {
                toast.error(response.data.message || 'Tải lên thất bại');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tải lên CV');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header-section')}>
                <div className={cx('header-content')}>
                    <div className={cx('header-icon')}>
                        <FontAwesomeIcon icon={faFileUpload} />
                    </div>
                    <h1>Tải lên CV của bạn</h1>
                    <p>Tải lên CV để nhà tuyển dụng có thể tìm thấy bạn dễ dàng hơn</p>
                </div>
            </div>

            <div className={cx('container')}>
                <div className={cx('upload-box')}>
                    <p className={cx('upload-desc')}>
                        Tải lên CV của bạn dưới dạng PDF, DOC hoặc DOCX. 
                        CV của bạn sẽ được lưu trữ an toàn và chỉ được chia sẻ với nhà tuyển dụng khi bạn cho phép.
                    </p>

                <div
                    {...getRootProps()}
                        className={cx('upload-area', {
                            'is-active': isDragActive,
                        'has-file': selectedFile
                    })}
                >
                    <input {...getInputProps()} />
                        <div className={cx('dropzone-content')}>
                            <FontAwesomeIcon 
                                icon={selectedFile ? faCheckCircle : faCloudUploadAlt} 
                                className={cx('icon')}
                            />
                    {selectedFile ? (
                        <div className={cx('file-info')}>
                            <span className={cx('file-name')}>{selectedFile.name}</span>
                                    <span className={cx('file-size')}>
                                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                    </span>
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            removeFile(); 
                                        }} 
                                        className={cx('remove-file')}
                                    >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                    ) : (
                        <div className={cx('upload-text')}>
                                    <span className={cx('primary-text')}>
                                        {isDragActive ? 'Thả file để tải lên' : 'Kéo và thả file vào đây'}
                                    </span>
                                    <span className={cx('secondary-text')}>hoặc click để chọn file</span>
                        </div>
                    )}
                </div>
                    </div>

                <button
                        className={cx('upload-btn', { loading: isLoading })}
                    onClick={handleUpload}
                    disabled={!selectedFile || isLoading}
                >
                        {isLoading ? 'Đang tải lên...' : 'Tải lên CV'}
                </button>
            </div>

                {uploadedPdfUrl && (
                    <div className={cx('preview-section')}>
                        <h3>Xem trước CV đã tải lên:</h3>
                        <PDFViewer url={uploadedPdfUrl} />
                        <div className={cx('pdf-actions')}>
                            <a 
                                href={uploadedPdfUrl} 
                                download
                                className={cx('download-link')}
                            >
                                <FontAwesomeIcon icon={faFileAlt} /> Tải xuống PDF
                            </a>
                        </div>
                    </div>
                )}

                <div className={cx('features-grid')}>
                    <div className={cx('feature-card')}>
                        <div className={cx('feature-icon', 'blue')}>
                            <FontAwesomeIcon icon={faFileUpload} />
                        </div>
                        <h3>Tải lên dễ dàng</h3>
                        <p>Hỗ trợ nhiều định dạng file phổ biến và dung lượng lên đến 10MB</p>
                    </div>
                    <div className={cx('feature-card')}>
                        <div className={cx('feature-icon', 'green')}>
                            <FontAwesomeIcon icon={faShieldAlt} />
                        </div>
                        <h3>Bảo mật tuyệt đối</h3>
                        <p>CV của bạn được mã hóa và lưu trữ an toàn trên hệ thống</p>
                    </div>
                    <div className={cx('feature-card')}>
                        <div className={cx('feature-icon', 'purple')}>
                            <FontAwesomeIcon icon={faSearch} />
                        </div>
                        <h3>Dễ dàng tìm kiếm</h3>
                        <p>Nhà tuyển dụng có thể tìm thấy CV của bạn dễ dàng</p>
                    </div>
                    <div className={cx('feature-card')}>
                        <div className={cx('feature-icon', 'red')}>
                            <FontAwesomeIcon icon={faRocket} />
                        </div>
                        <h3>Cơ hội việc làm</h3>
                        <p>Tăng cơ hội được tuyển dụng với CV chuyên nghiệp</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UpCV;