import React from 'react';
import classNames from 'classnames/bind';
import styles from './AdminLayout.module.scss';
import SidebarAdmin from '../components/SidebarAdmin';
import { useContext } from 'react';
import SidebarContext from '~/context/SidebarContext';

const cx = classNames.bind(styles);

function AdminLayout({ children }) {
  const { isOpenSidebar } = useContext(SidebarContext);

  return (
    <div className={cx('wrapper')}>
      <SidebarAdmin />
      <div className={cx('content', { 'content-expanded': !isOpenSidebar })}>
        {children}
      </div>
    </div>
  );
}

export default AdminLayout;
