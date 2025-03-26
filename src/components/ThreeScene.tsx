
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ThreeSceneProps {
  className?: string;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ className }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  
  useEffect(() => {
    if (!mountRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Create grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x66FCF1, 0x45A29E);
    gridHelper.position.y = -2;
    scene.add(gridHelper);
    
    // Add city mesh
    const cityGeometry = new THREE.BoxGeometry(0.5, 1, 0.5);
    const cityMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x1F2833,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    
    // Create a city of buildings
    for (let i = 0; i < 50; i++) {
      const building = new THREE.Mesh(cityGeometry, cityMaterial);
      const height = Math.random() * 3 + 0.5;
      building.scale.y = height;
      building.position.x = Math.random() * 10 - 5;
      building.position.z = Math.random() * 10 - 5;
      building.position.y = height / 2 - 2;
      scene.add(building);
    }
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x66FCF1, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0x66FCF1, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Animation loop
    let animationFrameId: number;
    
    const animate = () => {
      if (gridHelper) {
        gridHelper.rotation.y += 0.002;
      }
      
      if (cameraRef.current && rendererRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      animationFrameId = window.requestAnimationFrame(animate);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.cancelAnimationFrame(animationFrameId);
      rendererRef.current?.dispose();
      
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);
  
  return <div ref={mountRef} className={`w-full h-full ${className}`} />;
};

export default ThreeScene;
