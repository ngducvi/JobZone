import classNames from 'classnames/bind';
import styles from './Loading.module.scss';

const cx = classNames.bind(styles);

export const LoadingSpinner = () => {
  return (
    <div className={cx('loading-wrapper')}>
      <div className={cx('loading-spinner')} />
    </div>
  );
};

export const CompanySkeleton = () => {
  return (
    <div className={cx('company-skeleton')}>
      <div className={cx('banner')} />
      <div className={cx('logo')} />
      <div className={cx('title')} />
      <div className={cx('stats')}>
        <div className={cx('stat')} />
        <div className={cx('stat')} />
        <div className={cx('stat')} />
      </div>
    </div>
  );
}; 