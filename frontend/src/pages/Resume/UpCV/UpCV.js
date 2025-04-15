// UpCV page

import React, { useCallback, useState, useContext } from 'react';
import classNames from 'classnames/bind';
import styles from './UpCV.module.scss';
import { useDropzone } from 'react-dropzone';
import { authAPI, userApis } from '~/utils/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faFileAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import UserContext from "~/context/UserContext";

const cx = classNames.bind(styles);

function UpCV() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    console.log('user', user);
   
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
    console.log('user', user);
    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a file to upload');
            return;
        }

        setIsLoading(true);
        try {
            const user_id = localStorage.getItem('user_id');
            const token = localStorage.getItem('token');

            // Log để debug
            console.log('Selected File:', selectedFile);
            console.log('User ID:', user_id);
            console.log('Token:', token);

            // Chuẩn bị dữ liệu gửi đi
            const formData = {
                user_id: user.id,
                cv_name: selectedFile.name,
                cv_link: selectedFile.path || selectedFile.name // Sử dụng path nếu có, không thì dùng name
            };

            console.log('Request Payload:', formData);

            // Gọi API với đầy đủ headers
            const response = await axios({
                method: 'post',
                url: 'http://localhost:8080/api/v1/user/candidate-cv/cv-id',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                data: formData
            });

            console.log('API Response:', response);

            if (response.data.code === 1) {
                toast.success('Tạo hồ sơ ứng viên thành công!');
                navigate('/user/manager-cv');
            } else {
                toast.error(response.data.message || 'Tạo hồ sơ thất bại');
            }
        } catch (error) {
            console.error('Full Error:', error);
            console.error('Error Response:', error.response?.data);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo hồ sơ');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <h2 className={cx('title')}>Upload Your CV</h2>
            <div className={cx('upload-section')}>
                <div
                    {...getRootProps()}
                    className={cx('dropzone', {
                        'dropzone-active': isDragActive,
                        'has-file': selectedFile
                    })}
                >
                    <input {...getInputProps()} />
                    <FontAwesomeIcon icon={faCloudUploadAlt} className={cx('upload-icon')} />
                    {selectedFile ? (
                        <div className={cx('file-info')}>
                            <FontAwesomeIcon icon={faFileAlt} className={cx('file-icon')} />
                            <span className={cx('file-name')}>{selectedFile.name}</span>
                            <button onClick={(e) => { e.stopPropagation(); removeFile(); }} className={cx('remove-file')}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                    ) : (
                        <div className={cx('upload-text')}>
                            <p>Drag & drop your CV here</p>
                            <p className={cx('upload-hint')}>or click to select file</p>
                            <p className={cx('file-types')}>Supported formats: PDF, DOC, DOCX</p>
                        </div>
                    )}
                </div>
                <button
                    className={cx('upload-button', { loading: isLoading })}
                    onClick={handleUpload}
                    disabled={!selectedFile || isLoading}
                >
                    {isLoading ? 'Uploading...' : 'Upload CV'}
                </button>
            </div>
            <div className={cx('tips')}>
                <h3>Tips for an Effective CV:</h3>
                <ul>
                    <li>Keep it clear and concise</li>
                    <li>Highlight relevant experience</li>
                    <li>Check for spelling and grammar</li>
                    <li>Include up-to-date contact information</li>
                </ul>
            </div>
        </div>
    );
}

export default UpCV;