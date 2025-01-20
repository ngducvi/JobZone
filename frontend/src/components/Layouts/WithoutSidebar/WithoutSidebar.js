import classNames from 'classnames/bind';

import styles from './WithoutSidebar.module.scss';

import Header from '~/components/Layouts/components/Header';


const cx = classNames.bind(styles);

function WithoutSidebar({ children }) {

    return (
        <div className={cx('wrapper')}>
            <Header transparent hasBackBtn />
            <div className={cx('container')}>
                <div className={cx('content')}>{children}</div>
            </div>
            {/* <Footer /> */}
        </div>
    );
}

export default WithoutSidebar;
