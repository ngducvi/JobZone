import React, { useState, useEffect, useRef } from 'react';
import styles from './AnimatedText.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const AnimatedText = ({ text, className }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const textRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (textRef.current) {
        const rect = textRef.current.getBoundingClientRect();
        setMousePosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={textRef}
      className={cx('animated-text', className)}
      style={{
        '--text-mouse-x': `${mousePosition.x}px`,
        '--text-mouse-y': `${mousePosition.y}px`,
      }}
    >
      {text}
    </div>
  );
};

export default AnimatedText;
