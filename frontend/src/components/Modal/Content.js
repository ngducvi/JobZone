import { useState, useContext, useMemo, useCallback } from 'react';
import ModalTypeContext from '~/context/ModalTypeContext';
import classNames from 'classnames/bind';
import styles from './Modal.module.scss';
import routes from '~/config/routes';
import images from '~/assets/images';
import {  PrevArrowIcon, TickIcon, UserIcon } from '~/components/Icons';
// import { FacebookIcon, GithubIcon, GoogleIcon, PrevArrowIcon, TickIcon, UserIcon } from '~/components/Icons';
// import { auth,  signInWithPopup } from '~/firebaseConfig';
// import { auth, googleProvider, facebookProvider, githubProvider, signInWithPopup } from '~/firebaseConfig';
import config from '~/config';
import { toCamelCase } from '~/utils/toCamelCase';
import ForgotPassword from './ForgotPassword';
import Login from './Login';

import Register from './Register';
import ResetPassword from './ResetPassword';
import { Link } from 'react-router-dom';
// import api from '~/utils/api';
import LoginRecruiter from './LoginRecruiter';
import RegisterRecruiter from './RegisterRecruiter';
import UserContext from '~/context/UserContext';

const cx = classNames.bind(styles);

function Content() {
    const { modalType, setModalType } = useContext(ModalTypeContext);
    const { user } = useContext(UserContext);
    const [previousModalType, setPreviousModalType] = useState(null);
    const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
    const handleClick = useCallback(
        (to) => {
            const camelCaseScreen = toCamelCase(to);
            setPreviousModalType(modalType);
            setModalType(camelCaseScreen);
        },
        [modalType, setModalType],
    );

    const handleBackClick = useCallback(() => {
        if (previousModalType) {
            setModalType(previousModalType);
            setPreviousModalType(null);
        }
    }, [previousModalType, setModalType]);

    const renderAuthButtons = () => {
        const isRegister = modalType === 'register';
        const isRecruiter = modalType === 'registerRecruiter';
        const buttonLabel = isRegister || isRecruiter ? 'Đăng ký' : 'Đăng nhập';

        const providers = [
            {
                icon: <UserIcon />,
                label: `${buttonLabel} bằng tài khoản`,
                action: () => handleClick(
                    isRegister 
                        ? config.routes.registerEmail 
                        : isRecruiter 
                            ? 'registerRecruiterEmail' 
                            : config.routes.loginEmail
                ),
            },
            // { icon: <GoogleIcon />, label: `${buttonLabel} với Google`, action: () => handleLogin(googleProvider) },

            // {
            //     icon: <FacebookIcon />,
            //     label: `${buttonLabel} với Facebook`,
            //     action: () => handleLogin(facebookProvider),
            // },
            // { icon: <GithubIcon />, label: `${buttonLabel} với GitHub`, action: () => handleLogin(githubProvider) },
        ];

        return providers.map(({ icon, label, action }, index) => (
            <span key={index} className={cx('wrapper-btn')} onClick={action}>
                <span className={cx('icon')}>{icon}</span>
                <span className={cx('title')}>{label}</span>
            </span>
        ));
    };

    const modalTitle = useMemo(() => {
        if (modalType.includes('register') && !modalType.includes('Recruiter')) return 'Đăng ký tài khoản Job Zone';
        if (modalType.includes('registerRecruiter')) return 'Đăng ký tài khoản nhà tuyển dụng';
        if (modalType.includes('login')) return 'Đăng nhập tài khoản Job Zone';
        return modalType === 'forgotPassword' ? 'Quên mật khẩu?' : 'Đặt lại mật khẩu';
    }, [modalType]);

    const modalDescription = useMemo(() => {
        if (modalType === 'forgotPassword')
            return 'Nhập email của bạn và chúng tôi sẽ gửi cho bạn mã khôi phục mật khẩu.';
        if (modalType === 'changePassword') 
            return 'Đặt mật khẩu mới cho tài khoản của bạn để có thể tiếp tục truy cập các khóa học.';
    }, [modalType]);

    return (
        <div className={cx('container')}>
            <header className={cx('header')}>
                <Link to={routes.home} className={cx('logo-link')}>
                    <img className={cx('logo')} src={images.logo} alt="JobZone" />
                    <span className={cx('logo-text')}>JobZone</span>
                </Link>

                {previousModalType && (
                    <button className={cx('back-btn')} onClick={handleBackClick}>
                        <PrevArrowIcon /> Quay lại
                    </button>
                )}

                <h1 className={cx('heading')}>{modalTitle}</h1>
                <p className={cx('description', {
                    'warn': modalType !== 'forgotPassword' && modalType !== 'resetPassword'
                })}>
                    {modalDescription}
                </p>

                {resetPasswordSuccess && modalType === 'loginEmail' && (
                    <div className={cx('success-message')}>
                        <TickIcon /> Mật khẩu đã được đặt lại. Vui lòng đăng nhập.
                    </div>
                )}
            </header>

            <main className={cx('main')}>
                <div className={cx('main-content')}>
                    {(modalType === 'register' || modalType === 'login' || modalType === 'registerRecruiter') && (
                        <div className={cx('auth-buttons')}>
                            {renderAuthButtons()}
                        </div>
                    )}

                    {modalType === 'loginEmail' && <Login />}
                    {modalType === 'LoginRecruiter' && <LoginRecruiter />}
                    {modalType === 'registerEmail' && <Register />}
                    {modalType === 'registerRecruiterEmail' && <RegisterRecruiter />}
                    {modalType === 'forgotPassword' && <ForgotPassword setModalType={setModalType} />}
                    {modalType === 'resetPassword' && (
                        <ResetPassword setModalType={setModalType} setResetPasswordSuccess={setResetPasswordSuccess} />
                    )}

                    <div className={cx('footer-links')}>
                        {modalType !== 'forgotPassword' && modalType !== 'resetPassword' && (
                            <>
                                <p className={cx('register-or-login')}>
                                    {modalType.includes('register') ? 'Bạn đã có tài khoản? ' : 'Bạn chưa có tài khoản? '}
                                    <span onClick={() => setModalType(
                                        modalType.includes('register') 
                                            ? (modalType.includes('Recruiter') ? 'LoginRecruiter' : 'loginEmail')
                                            : (modalType.includes('Recruiter') ? 'registerRecruiter' : 'register')
                                    )}>
                                        {modalType.includes('register') ? 'Đăng nhập' : 'Đăng ký'}
                                    </span>
                                </p>

                                <button 
                                    className={cx('forgot-password')} 
                                    onClick={() => setModalType('forgotPassword')}
                                >
                                    Quên mật khẩu?
                                </button>
                            </>
                        )}

                        <p className={cx('policy')}>
                            Việc bạn tiếp tục sử dụng trang web này đồng nghĩa bạn đồng ý với
                            <span> điều khoản sử dụng </span>
                            của chúng tôi.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Content;
