// TestTemplate
import React, { useState } from 'react';
import styles from './TestTemplate.module.scss';
import classNames from 'classnames/bind';
import { FaShoppingCart, FaRegHeart, FaSearch, FaRegStar, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebookF, FaYoutube, FaInstagram } from 'react-icons/fa';

const cx = classNames.bind(styles);

function TestTemplate() {
    const [activeTab, setActiveTab] = useState('all');

    const products = [
        {
            id: 1,
            name: "Rắn Vàng SUPER VIP Royal Darius XO",
            price: "4,999,000đ",
            image: "product1.jpg",
            category: "premium"
        },
        {
            id: 2,
            name: "SET LONG PHỤNG HOÀ MINH",
            price: "1,705,000đ",
            image: "product2.jpg",
            category: "set"
        },
        // Thêm các sản phẩm khác...
    ];

    return (
        <div className={cx('wrapper')}>
            <div className={cx('banner')}>
                <div className={cx('banner-content')}>
                    <h1>Quà Tặng Cao Cấp - BST Rồng Rắn Lên Mây 2025</h1>
                    <p>VĂN HOÁ VIỆT NAM - TINH HOA THẾ GIỚI</p>
                </div>
            </div>

            <div className={cx('container')}>
                <div className={cx('filter-section')}>
                    <div className={cx('tabs')}>
                        <button 
                            className={cx('tab-btn', { active: activeTab === 'all' })}
                            onClick={() => setActiveTab('all')}
                        >
                            Tất cả sản phẩm
                        </button>
                        <button 
                            className={cx('tab-btn', { active: activeTab === 'premium' })}
                            onClick={() => setActiveTab('premium')}
                        >
                            Sản phẩm cao cấp
                        </button>
                        <button 
                            className={cx('tab-btn', { active: activeTab === 'set' })}
                            onClick={() => setActiveTab('set')}
                        >
                            Bộ quà tặng
                        </button>
                    </div>

                    <div className={cx('search-box')}>
                        <FaSearch className={cx('search-icon')} />
                        <input type="text" placeholder="Tìm kiếm sản phẩm..." />
                    </div>
                </div>

                <div className={cx('product-grid')}>
                    {products.map(product => (
                        <div key={product.id} className={cx('product-card')}>
                            <div className={cx('product-image')}>
                                <img src={product.image} alt={product.name} />
                                <div className={cx('product-actions')}>
                                    <button className={cx('action-btn')}>
                                        <FaShoppingCart />
                                    </button>
                                    <button className={cx('action-btn')}>
                                        <FaRegHeart />
                                    </button>
                                </div>
                            </div>
                            <div className={cx('product-info')}>
                                <h3>{product.name}</h3>
                                <div className={cx('rating')}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <FaRegStar key={star} className={cx('star')} />
                                    ))}
                                </div>
                                <div className={cx('price')}>{product.price}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={cx('newsletter')}>
                <div className={cx('newsletter-content')}>
                    <h2>Đăng ký nhận thông tin</h2>
                    <p>Nhận ngay voucher giảm giá cho đơn hàng đầu tiên</p>
                    <div className={cx('newsletter-form')}>
                        <input type="email" placeholder="Nhập email của bạn" />
                        <button>Đăng ký</button>
                    </div>
                </div>
            </div>

            <footer className={cx('footer')}>
                <div className={cx('footer-content')}>
                    <div className={cx('footer-section')}>
                        <h3>Thông tin liên hệ</h3>
                        <div className={cx('contact-info')}>
                            <div className={cx('info-item')}>
                                <span className={cx('label')}>Trụ sở chính:</span>
                                <span>Bắc Ninh, Phường Vũ Ninh, TP. Bắc Ninh</span>
                            </div>
                            <div className={cx('info-item')}>
                                <span className={cx('label')}>Hotline:</span>
                                <span>+84961-66xxxx</span>
                            </div>
                            <div className={cx('info-item')}>
                                <span className={cx('label')}>Email:</span>
                                <span>contact@gmail.com</span>
                            </div>
                        </div>
                    </div>

                    <div className={cx('footer-section')}>
                        <h3>Liên kết nhanh</h3>
                        <ul className={cx('quick-links')}>
                            <li>Giới thiệu về chúng tôi</li>
                            <li>Quy trình mua hàng</li>
                            <li>Hình thức thanh toán</li>
                            <li>Chính sách bảo mật</li>
                            <li>Điều khoản sử dụng</li>
                            <li>Blog</li>
                        </ul>
                    </div>

                    <div className={cx('footer-section')}>
                        <h3>Kết nối với chúng tôi</h3>
                        <div className={cx('social-links')}>
                            <a href="#" className={cx('social-btn', 'facebook')}>
                                <FaFacebookF />
                            </a>
                            <a href="#" className={cx('social-btn', 'youtube')}>
                                <FaYoutube />
                            </a>
                            <a href="#" className={cx('social-btn', 'instagram')}>
                                <FaInstagram />
                            </a>
                        </div>
                    </div>
                </div>

                <div className={cx('footer-bottom')}>
                    <div className={cx('copyright')}>
                        <p>© 2024 PANDA GROUP - Thiết kế website bởi PANDA GROUP</p>
                        <p>Toàn bộ hình ảnh và nội dung thuộc bản quyền của PANDA GROUP và đã được đăng ký bản quyền.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default TestTemplate;