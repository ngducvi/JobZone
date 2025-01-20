import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';

import styles from './BackButton.module.scss';
import { PrevArrowIcon } from '~/components/Icons';

const cx = classNames.bind(styles);

function BackButton() {
    const navigate = useNavigate();

    function handleClick() {
        navigate(-1);
    }

    return (
        <div className={cx('back-home')} onClick={handleClick}>
            <span className={cx('sub-title')}>
                <PrevArrowIcon />
                <span>Quay lại</span>
            </span>
        </div>
    );
}

export default BackButton;
