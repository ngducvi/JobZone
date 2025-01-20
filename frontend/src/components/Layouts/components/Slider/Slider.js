import classNames from 'classnames/bind';
import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import images from '~/assets/images';
import styles from './Slider.module.scss';

const cx = classNames.bind(styles);

function NextArrow(props) {
    const { className, style, onClick } = props;

    return (
        <div
            className={className}
            style={{
                ...style,
                zIndex: 10,
                width: 36,
                height: 36,
                right: -18,
                boxShadow: '0 3px 6px #00000029',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '50%',
                backgroundColor: '#101A1D',
            }}
            onClick={onClick}
        ></div>
    );
}

function PrevArrow(props) {
    const { className, style, onClick } = props;

    return (
        <div
            className={className}
            style={{
                ...style,
                zIndex: 10,
                width: 36,
                height: 36,
                left: -18,
                background: '#101A1D',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '50%',
            }}
            onClick={onClick}
        />
    );
}

function HomeSlider() {
    const settings = {
        dots: true,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        lazyLoad: true,
        speed: 1000,
        autoplay: true,
        autoplaySpeed: 2000,
        cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',

        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
    };
    return (
        <div className="slider-container">
            <div className={cx('slider-wrapper')}>
                <Slider {...settings}>
                    <div className={cx('slider-item')}>
                        <div className={cx('slider-content')}>
                            <div>
                                <h1>Content1</h1>
                                <span>desc 1</span>
                            </div>
                            <div className={cx('wrap-img')}>
                                <img className={cx('slider-img')} src={images.cat1} alt="cat1" />
                            </div>
                        </div>
                    </div>
                    <div className={cx('slider-item')}>
                        <div className={cx('slider-content')}>
                            <div>
                                <h1>Content2</h1>
                                <span>desc 2</span>
                            </div>
                            <div className={cx('wrap-img')}>
                                <img className={cx('slider-img')} src={images.cat2} alt="cat2" />
                            </div>
                        </div>
                    </div>
                    <div className={cx('slider-item')}>
                        <div className={cx('slider-content')}>
                            <div>
                                <h1>Content3</h1>
                                <span>desc 3</span>
                            </div>
                            <div className={cx('wrap-img')}>
                                <img className={cx('slider-img')} src={images.cat3} alt="cat3" />
                            </div>
                        </div>
                    </div>
                </Slider>
            </div>
        </div>
    );
}

export default HomeSlider;
