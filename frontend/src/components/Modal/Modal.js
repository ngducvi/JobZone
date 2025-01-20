import React, { useState, useEffect, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './Modal.module.scss';
import Content from './Content';

const cx = classNames.bind(styles);

function Modal({ onClose, isSetting, isAdmin, children, isSmall }) {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    }, [onClose]);

    useEffect(() => {
        // Disable scrolling on mount
        document.body.style.overflow = 'hidden';
        return () => {
            // Enable scrolling on unmount
            document.body.style.overflow = '';
        };
    }, []);

    useEffect(() => {
        return () => {
            clearTimeout(handleClose); // Clean up the timeout
        };
    }, [handleClose]);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('overlay', { closing: isClosing })} onClick={handleClose}></div>
            <div className={cx('content', { closing: isClosing, small: !!isSmall })}>
                <button className={cx('close')} onClick={handleClose}>
                    x
                </button>

                {isSetting || isAdmin ? (
                    <div className={cx('body')}>{children}</div>
                ) : (
                    <Content closingModal={handleClose} />
                )}
            </div>
        </div>
    );
}

export default Modal;
