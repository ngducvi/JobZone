import React from 'react';
import classNames from 'classnames/bind';
import styles from './DeleteModal.module.scss';

const cx = classNames.bind(styles);

function DeleteModal({ title, children, onClose, onConfirm }) {
    return (
        <div className={cx('modal-overlay')}>
            <div className={cx('modal')}>
                <div className={cx('modal-header')}>
                    <h2>{title}</h2>
                    <button className={cx('close-btn')} onClick={onClose}>×</button>
                </div>
                <div className={cx('modal-content')}>
                    {children}
                </div>
                <div className={cx('modal-footer')}>
                    <button className={cx('cancel-btn')} onClick={onClose}>Hủy</button>
                    <button className={cx('confirm-btn')} onClick={onConfirm}>Xác nhận</button>
                </div>
            </div>
        </div>
    );
}

export default DeleteModal;
