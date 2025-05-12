import React, { useEffect, useState } from 'react';
import { useMessage } from '~/context/MessageContext';
import { authAPI, userApis } from '~/utils/api';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

const Header = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const { totalUnreadMessages, fetchTotalUnreadMessages } = useMessage();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const fetchCurrentUser = async () => {
        try {
          const response = await authAPI().get(userApis.getCurrentUser);
          setCurrentUser(response.data);
          
          if (response.data?.user?.id) {
            fetchTotalUnreadMessages(response.data.user.id);
          }
        } catch (error) {
          console.error('Error fetching current user:', error);
        }
      };
      fetchCurrentUser();
      
      // Thiết lập interval để cập nhật số tin nhắn chưa đọc mỗi 10 giây
      const intervalId = setInterval(() => {
        if (currentUser?.user?.id) {
          fetchTotalUnreadMessages(currentUser.user.id);
        }
      }, 10000);
      
      return () => clearInterval(intervalId);
    }
  }, [fetchTotalUnreadMessages]);
  
  // Thêm useEffect riêng để theo dõi thay đổi của currentUser
  useEffect(() => {
    if (currentUser?.user?.id) {
      fetchTotalUnreadMessages(currentUser.user.id);
    }
  }, [currentUser, fetchTotalUnreadMessages]);
  
  const MessageBadge = ({ count }) => {
    if (!count || count <= 0) return null;
    
    return (
      <span className={cx('message-badge')}>
        {count > 99 ? '99+' : count}
      </span>
    );
  };
  
  return (
    <div className={cx('header')}>
      <div className={cx('header-links')}>
        <Link to={currentUser?.user?.role === 'recruiter' ? '/recruiter/messages' : '/messages'} className={cx('header-link')}>
          <div className={cx('link-icon')}>
            <i className="fas fa-envelope"></i>
            <MessageBadge count={totalUnreadMessages} />
          </div>
          <span className={cx('link-text')}>Messages</span>
        </Link>
      </div>
    </div>
  );
}

export default Header; 