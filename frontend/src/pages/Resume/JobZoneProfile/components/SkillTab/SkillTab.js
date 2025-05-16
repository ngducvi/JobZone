// SkillTab.js
import React, { useState, useEffect } from 'react';
import { authAPI, userApis } from '~/utils/api';
import { toast } from 'react-hot-toast';
import { FaPlus, FaMinus, FaEdit, FaTrash, FaSpinner, FaTimes } from 'react-icons/fa';
import classNames from 'classnames/bind';
import styles from './SkillTab.module.scss';

const cx = classNames.bind(styles);

const SkillTab = ({ skills: initialSkills, candidateProfile, onUpdateSkills, isMobile }) => {
    // Ensure skills is always an array
    const [skills, setSkills] = useState(() => {
        if (Array.isArray(initialSkills)) {
            return initialSkills;
        }
        if (typeof initialSkills === 'string') {
            return initialSkills.split(',').map(skill => ({
                skill_id: skill.trim(),
                skill_name: skill.trim(),
                skill_level: 'intermediate',
                candidate_skill_id: Date.now() + Math.random()
            }));
        }
        return [];
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [availableSkills, setAvailableSkills] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingSkill, setEditingSkill] = useState(null);
    const [skillLevel, setSkillLevel] = useState('');

    // Fetch available skills when component mounts
    useEffect(() => {
        const fetchAvailableSkills = async () => {
            try {
                setIsLoading(true);
                const response = await authAPI().get(userApis.getAllSkills);
                setAvailableSkills(response.data.skills || []);
            } catch (error) {
                console.error('Error fetching available skills:', error);
                toast.error('Không thể tải danh sách kỹ năng');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAvailableSkills();
    }, []);

    // Update parent component when skills change
    useEffect(() => {
        if (typeof onUpdateSkills === 'function') {
            onUpdateSkills(skills);
        }
    }, [skills, onUpdateSkills]);

    const handleAddSkill = async (skill) => {
        if (!candidateProfile?.candidate_id) {
            toast.error('Không tìm thấy thông tin ứng viên');
            return;
        }

        try {
            setIsLoading(true);
            const response = await authAPI().post(userApis.addCandidateSkill, {
                candidate_id: candidateProfile.candidate_id,
                skill_id: skill.skill_id,
                skill_level: skillLevel || 'intermediate'
            });

            if (response.data.success) {
                const newSkill = {
                    ...skill,
                    skill_level: skillLevel || 'intermediate',
                    candidate_skill_id: Date.now().toString() // Temporary ID for frontend
                };
                setSkills(prev => [...prev, newSkill]);
                setShowAddModal(false);
                setSkillLevel('');
                toast.success('Thêm kỹ năng thành công');
            } else {
                toast.error(response.data.message || 'Không thể thêm kỹ năng');
            }
        } catch (error) {
            console.error('Error adding skill:', error);
            toast.error(error.response?.data?.message || 'Không thể thêm kỹ năng');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateSkillLevel = async (skillId, newLevel) => {
        if (!candidateProfile?.candidate_id) {
            toast.error('Không tìm thấy thông tin ứng viên');
            return;
        }

        try {
            setIsLoading(true);
            const skill = skills.find(s => s.candidate_skill_id === skillId);
            if (!skill) return;

            const response = await authAPI().put(userApis.updateCandidateSkill, {
                candidate_skill_id: skillId,
                skill_level: newLevel
            });

            if (response.data.code === 1) {
                setSkills(prev => prev.map(s => 
                    s.candidate_skill_id === skillId 
                        ? { ...s, skill_level: newLevel }
                        : s
                ));
                setEditingSkill(null);
                toast.success('Cập nhật trình độ kỹ năng thành công');
            }
        } catch (error) {
            console.error('Error updating skill level:', error);
            toast.error('Không thể cập nhật trình độ kỹ năng');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSkill = async (skillId) => {
        if (!candidateProfile?.candidate_id) {
            toast.error('Không tìm thấy thông tin ứng viên');
            return;
        }

        const skillToDelete = skills.find(s => s.candidate_skill_id === skillId);
        if (!skillToDelete) {
            toast.error('Không tìm thấy kỹ năng cần xóa');
            return;
        }

        try {
            setIsLoading(true);
            const response = await authAPI().delete(
                userApis.deleteCandidateSkill(candidateProfile.candidate_id, skillToDelete.skill_name)
            );

            if (response.data.success) {
                setSkills(prev => prev.filter(s => s.candidate_skill_id !== skillId));
                toast.success('Xóa kỹ năng thành công');
            } else {
                toast.error(response.data.message || 'Không thể xóa kỹ năng');
            }
        } catch (error) {
            console.error('Error deleting skill:', error);
            toast.error(error.response?.data?.message || 'Không thể xóa kỹ năng');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredSkills = availableSkills.filter(skill => 
        skill.skill_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSkillLevelLabel = (level) => {
        switch (level) {
            case 'beginner': return 'Cơ bản';
            case 'intermediate': return 'Trung bình';
            case 'advanced': return 'Nâng cao';
            case 'expert': return 'Chuyên gia';
            default: return 'Trung bình';
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h2>Kỹ năng</h2>
                <button 
                    className={cx('add-btn')} 
                    onClick={() => setShowAddModal(true)}
                    disabled={isLoading}
                >
                    <FaPlus /> Thêm kỹ năng
                </button>
            </div>

            <div className={cx('skills-list')}>
                {!Array.isArray(skills) || skills.length === 0 ? (
                    <div className={cx('empty-state')}>
                        Chưa có kỹ năng nào được thêm vào
                    </div>
                ) : (
                    skills.map(skill => (
                        <div key={skill.candidate_skill_id || skill.skill_id} className={cx('skill-item')}>
                            <div className={cx('skill-info')}>
                                <span className={cx('skill-name')}>{skill.skill_name}</span>
                                {editingSkill === (skill.candidate_skill_id || skill.skill_id) ? (
                                    <select
                                        value={skillLevel}
                                        onChange={(e) => {
                                            handleUpdateSkillLevel(skill.candidate_skill_id || skill.skill_id, e.target.value);
                                            setSkillLevel(e.target.value);
                                        }}
                                        className={cx('level-select')}
                                    >
                                        <option value="beginner">Cơ bản</option>
                                        <option value="intermediate">Trung bình</option>
                                        <option value="advanced">Nâng cao</option>
                                        <option value="expert">Chuyên gia</option>
                                    </select>
                                ) : (
                                    <span 
                                        className={cx('skill-level')}
                                        onClick={() => {
                                            setEditingSkill(skill.candidate_skill_id || skill.skill_id);
                                            setSkillLevel(skill.skill_level || 'intermediate');
                                        }}
                                    >
                                        {getSkillLevelLabel(skill.skill_level || 'intermediate')}
                                    </span>
                                )}
                            </div>
                            <div className={cx('skill-actions')}>
                               
                                <button
                                    className={cx('delete-btn')}
                                    onClick={() => handleDeleteSkill(skill.candidate_skill_id || skill.skill_id)}
                                    disabled={isLoading}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Skill Modal */}
            {showAddModal && (
                <div className={cx('modal-overlay')}>
                    <div className={cx('modal-content')}>
                        <div className={cx('modal-header')}>
                            <h3>Thêm kỹ năng mới</h3>
                            <button 
                                className={cx('close-btn')} 
                                onClick={() => {
                                    setShowAddModal(false);
                                    setSearchTerm('');
                                }}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className={cx('modal-body')}>
                            <div className={cx('search-box')}>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm kỹ năng..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className={cx('skills-grid')}>
                                {filteredSkills.map(skill => (
                                    <div
                                        key={skill.skill_id}
                                        className={cx('skill-option', {
                                            selected: skills.some(s => s.skill_id === skill.skill_id)
                                        })}
                                        onClick={() => {
                                            if (!skills.some(s => s.skill_id === skill.skill_id)) {
                                                handleAddSkill(skill);
                                            }
                                        }}
                                    >
                                        <span className={cx('skill-name')}>{skill.skill_name}</span>
                                        {skill.description && (
                                            <span className={cx('skill-description')}>
                                                {skill.description}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {filteredSkills.length === 0 && (
                                <div className={cx('no-results')}>
                                    Không tìm thấy kỹ năng phù hợp
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className={cx('loading-overlay')}>
                    <FaSpinner className={cx('spinner')} />
                    <span>Đang xử lý...</span>
                </div>
            )}
        </div>
    );
};

export default SkillTab;