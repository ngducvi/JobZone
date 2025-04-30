import React, { useEffect, useRef } from "react";
import classNames from "classnames/bind";
import styles from "./NotFound.module.scss";
import { useNavigate } from "react-router-dom";
import Logo from "~/components/Logo";
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
const cx = classNames.bind(styles);

const NotFound = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    // Initialize Three.js scene
    if (!canvasRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    // Create text geometry for "404"
    const fontLoader = new FontLoader();
    
    // Create particles for background effect
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Create material with custom colors matching the site theme
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: new THREE.Color('#013a74'),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    // Create the particle system
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Create floating 3D objects (cubes and spheres)
    const objects = [];
    const colors = [0x013a74, 0x02a346];
    
    for (let i = 0; i < 20; i++) {
      let geometry;
      
      // Alternate between different shapes
      if (i % 3 === 0) {
        geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      } else if (i % 3 === 1) {
        geometry = new THREE.SphereGeometry(0.1, 16, 16);
      } else {
        geometry = new THREE.TetrahedronGeometry(0.15);
      }
      
      const material = new THREE.MeshBasicMaterial({ 
        color: colors[i % colors.length],
        transparent: true,
        opacity: 0.7
      });
      
      const object = new THREE.Mesh(geometry, material);
      
      // Position randomly
      object.position.x = (Math.random() - 0.5) * 10;
      object.position.y = (Math.random() - 0.5) * 10;
      object.position.z = (Math.random() - 0.5) * 10;
      
      // Store random rotation speeds
      object.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.01
        },
        floatSpeed: (Math.random() - 0.5) * 0.005
      };
      
      objects.push(object);
      scene.add(object);
    }
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Mouse movement effect
    const mouse = {
      x: 0,
      y: 0
    };
    
    document.addEventListener('mousemove', (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate particle system
      particlesMesh.rotation.x += 0.0005;
      particlesMesh.rotation.y += 0.0005;
      
      // Move camera slightly based on mouse position
      camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (mouse.y * 0.5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      
      // Animate each object
      objects.forEach(object => {
        // Rotate objects
        object.rotation.x += object.userData.rotationSpeed.x;
        object.rotation.y += object.userData.rotationSpeed.y;
        object.rotation.z += object.userData.rotationSpeed.z;
        
        // Float up and down
        object.position.y += Math.sin(Date.now() * 0.001) * object.userData.floatSpeed;
      });
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', handleResize);
      
      // Dispose of resources
      objects.forEach(object => {
        object.geometry.dispose();
        object.material.dispose();
      });
      
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      
      renderer.dispose();
      
      // Remove all children from the scene
      while(scene.children.length > 0) { 
        scene.remove(scene.children[0]); 
      }
    };
  }, []);

  return (
    <div className={cx("not-found")}>
      <canvas ref={canvasRef} className={cx("canvas-3d")} />
      <Logo />
      <section className={cx("container")}>
        <div className={cx("status-icon", "failure")}>
          <i className="fa-solid fa-exclamation"></i>
        </div>
        <h2 className={cx("title", "failure")}>Trang không tồn tại!</h2>
        <p className={cx("description")}>Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa. Vui lòng kiểm tra lại URL hoặc quay về trang chủ.</p>
        <button
          className={cx("home-button")}
          onClick={() => navigate("/", { replace: true })}
        >
          Quay về trang chủ
        </button>
      </section>
    </div>
  );
};

export default NotFound;
