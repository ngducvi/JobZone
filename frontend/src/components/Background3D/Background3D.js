import { useEffect } from 'react';
import * as THREE from 'three';

function Background3D() {
  useEffect(() => {
    // Set up scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('background-container').appendChild(renderer.domElement);

    // Add particles with two colors
    const geometry1 = new THREE.BufferGeometry();
    const geometry2 = new THREE.BufferGeometry();
    const vertices1 = [];
    const vertices2 = [];
    
    for (let i = 0; i < 2500; i++) {
      vertices1.push(
        THREE.MathUtils.randFloatSpread(2000),
        THREE.MathUtils.randFloatSpread(2000),
        THREE.MathUtils.randFloatSpread(2000)
      );
    }
    
    for (let i = 0; i < 2500; i++) {
      vertices2.push(
        THREE.MathUtils.randFloatSpread(2000),
        THREE.MathUtils.randFloatSpread(2000),
        THREE.MathUtils.randFloatSpread(2000)
      );
    }
    
    geometry1.setAttribute('position', new THREE.Float32BufferAttribute(vertices1, 3));
    geometry2.setAttribute('position', new THREE.Float32BufferAttribute(vertices2, 3));
    
    const particles1 = new THREE.Points(
      geometry1,
      new THREE.PointsMaterial({ 
        color: 0x013a74,
        size: 2,
        transparent: true,
        opacity: 0.6
      })
    );
    
    const particles2 = new THREE.Points(
      geometry2,
      new THREE.PointsMaterial({ 
        color: 0x02a346,
        size: 2,
        transparent: true,
        opacity: 0.6
      })
    );
    
    scene.add(particles1);
    scene.add(particles2);
    camera.position.z = 500;

    // Animation
    function animate() {
      requestAnimationFrame(animate);
      particles1.rotation.x += 0.0001;
      particles1.rotation.y += 0.0002;
      particles2.rotation.x -= 0.0002;
      particles2.rotation.y -= 0.0001;
      renderer.render(scene, camera);
    }
    
    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      geometry1.dispose();
      geometry2.dispose();
    };
  }, []);

  return <div id="background-container" style={{ position: 'fixed', top: 0, left: 0, zIndex: -1, opacity: 0.3 }} />;
}

export default Background3D; 