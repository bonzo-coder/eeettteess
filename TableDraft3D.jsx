import { useEffect, useRef, useState } from "react";
import * as THREE from 'three';

export default function ScissorLiftTable({ contentRef }) {
  const canvasContainerRef = useRef(null);
  const [error, setError] = useState(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const tableGroupRef = useRef(null);
  const tableHeightRef = useRef(0.05);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (typeof THREE === 'undefined') {
      setError('Error: Three.js library failed to load. Please check your network or try again later.');
      return;
    }

    let scene, camera, renderer, tableTop, scissorFront1, scissorFront2, scissorBack1, scissorBack2, base, tableGroup, resizeObserver;
    try {
      const getContainerSize = () => {
        const container = canvasContainerRef.current;

        if (!container) {
          return { width: window.innerWidth, height: window.innerHeight };
        }

        const { width, height } = container.getBoundingClientRect();

        return {
          width: Math.max(Math.round(width) || 0, 320),
          height: Math.max(Math.round(height) || 0, 320)
        };
      };

      scene = new THREE.Scene();
      sceneRef.current = scene;
      const initialSize = getContainerSize();
      camera = new THREE.PerspectiveCamera(75, initialSize.width / initialSize.height, 0.1, 1000);
      cameraRef.current = camera;
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(initialSize.width, initialSize.height);
      rendererRef.current = renderer;

      if (!canvasContainerRef.current) {
        setError('Error: Canvas container not found in the DOM.');
        return;
      }
      canvasContainerRef.current.appendChild(renderer.domElement);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(0, 10, 10);
      scene.add(directionalLight);

      const tableMaterial = new THREE.MeshBasicMaterial({ color: 0x4682b4, wireframe: true });
      const scissorMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, wireframe: true });

      const tableTopGeometry = new THREE.BoxGeometry(4, 0.2, 2);
      tableTop = new THREE.Mesh(tableTopGeometry, tableMaterial);
      scene.add(tableTop);

      const scissorGeometry = new THREE.BoxGeometry(3.6, 0.1, 0.1);
      const scissorFront1 = new THREE.Mesh(scissorGeometry, scissorMaterial);
      const scissorFront2 = new THREE.Mesh(scissorGeometry, scissorMaterial);
      const scissorBack1 = new THREE.Mesh(scissorGeometry, scissorMaterial);
      const scissorBack2 = new THREE.Mesh(scissorGeometry, scissorMaterial);
      scene.add(scissorFront1, scissorFront2, scissorBack1, scissorBack2);

      const baseGeometry = new THREE.BoxGeometry(4, 0.2, 2);
      const base = new THREE.Mesh(baseGeometry, tableMaterial);
      base.position.y = -0.1;
      scene.add(base);

      const tableGroup = new THREE.Group();
      tableGroup.add(tableTop, scissorFront1, scissorFront2, scissorBack1, scissorBack2, base);
      scene.add(tableGroup);

      camera.position.set(0, 2, 5);
      camera.lookAt(0, 0, 0);

      let tableHeight = 0.05;
      const maxHeight = 2;
      const scissorLength = 4;

      function updateScissorMechanism(height, scrollFraction) {
        try {
          tableTop.position.y = height;

          const hypotenuseSquared = scissorLength * scissorLength;
          const heightSquared = height * height;
          let angle;
          try {
            const cosAngle = Math.sqrt((hypotenuseSquared - heightSquared) / hypotenuseSquared);
            if (isNaN(cosAngle)) {
              throw new Error('Invalid angle calculation');
            }
            angle = Math.acos(cosAngle);
          } catch (e) {
            setError('Angle calculation error: ' + e.message);
            angle = 0;
          }
          const offsetX = (scissorLength);

          const tableWidth = 4;
          const tableDepth = 2;
          const tableHalfWidth = tableWidth / 2;
          const tableHalfDepth = tableDepth / 2;
          const baseY = -0.1;

          scissorFront1.position.set(0, (height + baseY)*1.1 / 2, 1);
          scissorFront1.rotation.z = -angle;
          scissorFront1.position.x = tableHalfWidth * 0.9 - offsetX + 2.2;

          scissorFront2.position.set(0, (height + baseY)*1.1 / 2, 1);
          scissorFront2.rotation.z = angle;
          scissorFront2.position.x = -tableHalfWidth + offsetX - 2.1;

          scissorBack1.position.set(0, (height + baseY)*1.1 / 2, -0.5);
          scissorBack1.rotation.z = -angle;
          scissorBack1.position.x = tableHalfWidth - offsetX + 2;

          scissorBack2.position.set(0, (height + baseY)*1.1 / 2, -0.5);
          scissorBack2.rotation.z = angle;
          scissorBack2.position.x = -tableHalfWidth + offsetX - 2;

          tableGroup.rotation.y = scrollFraction * Math.PI / 4;
        } catch (e) {
          setError('Error in updateScissorMechanism: ' + e.message);
        }
      }

      try {
        updateScissorMechanism(tableHeightRef.current, 0);
      } catch (e) {
        setError('Error: Failed to initialize scissor mechanism. ' + e.message);
      }

      const handleScroll = () => {
        const section = document.querySelector('.accessories-page');
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        const sectionScroll = Math.min(Math.max((windowHeight - rect.top) / (section.offsetHeight + windowHeight), 0), 1);

        tableHeightRef.current = 0.05 + sectionScroll * (maxHeight - 0.05);
        updateScissorMechanism(tableHeightRef.current, sectionScroll);
      };

      window.addEventListener('scroll', handleScroll);

      const handleResize = () => {
        try {
          const nextSize = getContainerSize();

          camera.aspect = nextSize.width / nextSize.height;
          camera.updateProjectionMatrix();
          renderer.setSize(nextSize.width, nextSize.height);
        } catch (e) {
          setError('Error in resize handler: ' + e.message);
        }
      };

      window.addEventListener('resize', handleResize);
      if (typeof ResizeObserver !== 'undefined' && canvasContainerRef.current) {
        resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(canvasContainerRef.current);
      }

      const animate = () => {
        try {
          animationIdRef.current = requestAnimationFrame(animate);
          renderer.render(scene, camera);
        } catch (e) {
          setError('Error in animation loop: ' + e.message);
        }
      };
      animate();

      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        if (resizeObserver) resizeObserver.disconnect();
        if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);

        if (rendererRef.current) {
          rendererRef.current.dispose();
          rendererRef.current.forceContextLoss();
          rendererRef.current.domElement?.remove();
          rendererRef.current = null;
        }
        if (sceneRef.current) {
          sceneRef.current.clear();
          sceneRef.current = null;
        }
        cameraRef.current = null;
        tableGroupRef.current = null;
      };
    } catch (e) {
      setError('Error in updateScissorMechanism: ' + e.message);
    }
  }, []);

  return (
    <div>
      {error && (
        <div className="fixed top-2.5 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-80 text-red-500 text-lg p-2.5 rounded">
          {error}
        </div>
      )}
      <div
        ref={canvasContainerRef}
        id="canvas-container"
      ></div>
    </div>
  );
}
