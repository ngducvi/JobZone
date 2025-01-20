import classNames from 'classnames/bind';
import styles from './InputWrapper.module.scss';

const cx = classNames.bind(styles);

function FormWrapper({ children }) {
    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')}>{children}</div>
        </div>
    );
}

export default FormWrapper;
