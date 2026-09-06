import { useEffect, useRef, useState } from "react";
import * as THREE from 'three';

        export default function ScissorLiftTable({ contentRef }) {
  // ...używaj przekazanego contentRef zamiast lokalnego

            const canvasContainerRef = useRef(null);
            const [error, setError] = useState(null);
            const rendererRef = useRef(null);
            const sceneRef = useRef(null);
            const cameraRef = useRef(null);
            const tableGroupRef = useRef(null);
            const tableHeightRef = useRef(0.05); // Start very closed

            const scissorLength = 4; // Matches table width
            const maxHeight = 2;
            const tableWidth = 4;
            const tableDepth = 2;
            const tableHalfWidth = tableWidth / 2; // 2
            const tableHalfDepth = tableDepth / 2; // 1
            const baseY = -0.1;

            useEffect(() => {
                // Check if Three.js loaded
                if (typeof THREE === 'undefined') {
                    setError('Error: Three.js library failed to load. Please check your network or try again later.');
                    return;
                }

                // Scene setup
                let scene, camera, renderer, tableTop, scissorFront1, scissorFront2, scissorBack1, scissorBack2, base, tableGroup;
                try {
                    scene = new THREE.Scene();
                    sceneRef.current = scene;
                    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                    cameraRef.current = camera;
                    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                    renderer.setSize(window.innerWidth, window.innerHeight);
                    rendererRef.current = renderer;

                    if (!canvasContainerRef.current) {
                        setError('Error: Canvas container not found in the DOM.');
                        return;
                    }
                    canvasContainerRef.current.appendChild(renderer.domElement);

                    // Lighting
                    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
                    scene.add(ambientLight);
                    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
                    directionalLight.position.set(0, 10, 10);
                    scene.add(directionalLight);

                    // Materials
                    const tableMaterial = new THREE.MeshBasicMaterial({ color: 0x4682b4, wireframe: true });
                    const scissorMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, wireframe: true });

                    // Table top
                    const tableTopGeometry = new THREE.BoxGeometry(4, 0.2, 2);
                    tableTop = new THREE.Mesh(tableTopGeometry, tableMaterial);
                    scene.add(tableTop);

                    // Scissor legs
                    const scissorGeometry = new THREE.BoxGeometry(3.6, 0.1, 0.1); // Length matches table width
                    const scissorFront1 = new THREE.Mesh(scissorGeometry, scissorMaterial); // Top-right to bottom-left (front)
                    const scissorFront2 = new THREE.Mesh(scissorGeometry, scissorMaterial); // Top-left to bottom-right (front)
                    const scissorBack1 = new THREE.Mesh(scissorGeometry, scissorMaterial);  // Top-right to bottom-left (back)
                    const scissorBack2 = new THREE.Mesh(scissorGeometry, scissorMaterial);  // Top-left to bottom-right (back)
                    scene.add(scissorFront1, scissorFront2, scissorBack1, scissorBack2);

                    // Base
                    const baseGeometry = new THREE.BoxGeometry(4, 0.2, 3);
                    const base = new THREE.Mesh(baseGeometry, tableMaterial);
                    base.position.y = -0.1;
                    scene.add(base);

                    // Group to rotate the entire table
                    const tableGroup = new THREE.Group();
                    tableGroup.add(tableTop, scissorFront1, scissorFront2, scissorBack1, scissorBack2, base);
                    scene.add(tableGroup);

                    // Camera position
                    camera.position.set(2, 1, 3);
                    camera.lookAt(0,0,0);

                    // Animation variables
                    let tableHeight = 0.05; // Start very closed
                    const maxHeight = 2;
                    const scissorLength = 4; // Length matches table width

                    // Update scissor mechanism
                    function updateScissorMechanism(height, scrollFraction) {
                        try {
                            tableTop.position.y = height;

                            // Calculate scissor angle based on height
                            const hypotenuseSquared = scissorLength * scissorLength ;
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
                                angle = 0; // Fallback
                            }
                            const offsetX = (scissorLength );

                            // Table and base corner positions
                            const tableWidth = 4;
                            const tableDepth = 2;
                            const tableHalfWidth = tableWidth / 2; // 2
                            const tableHalfDepth = tableDepth / 2; // 1
                            const baseY = -0.1;

                            // Front scissor legs (z = 1)
                            // scissorFront1: Top-right (2, height, 1) to bottom-left (-2, -0.1, 1)
                            scissorFront1.position.set(0, (height + baseY)*1.1 / 2, 1);
                            scissorFront1.rotation.z = -angle;
                            scissorFront1.position.x = tableHalfWidth * 0.9  - offsetX +2.2 ;

                            // scissorFront2: Top-left (-2, height, 1) to bottom-right (2, -0.1, 1)
                            scissorFront2.position.set(0, (height + baseY)*1.1 / 2, 1);
                            scissorFront2.rotation.z = angle;
                            scissorFront2.position.x = -tableHalfWidth   + offsetX -2.1 ;

                            // Back scissor legs (z = -1)
                            // scissorBack1: Top-right (2, height, -1) to bottom-left (-2, -0.1, -1)
                            scissorBack1.position.set(0, (height + baseY)*1.1 / 2, -0.5);
                            scissorBack1.rotation.z = -angle;
                            scissorBack1.position.x = tableHalfWidth- offsetX +2;

                            // // scissorBack2: Top-left (-2, height, -1) to bottom-right (2, -0.1, -1)
                            scissorBack2.position.set(0, (height + baseY)*1.1 / 2, -0.5);
                            scissorBack2.rotation.z = angle;
                            scissorBack2.position.x = -tableHalfWidth + offsetX -2;

                            // Rotate the entire table group
                            tableGroup.rotation.y = scrollFraction * Math.PI / 4;
                        } catch (e) {
                            setError('Error in updateScissorMechanism: ' + e.message);
                        }
                    }

                    // Initial position
                    try {
                        updateScissorMechanism(tableHeightRef.current, 0);
                    } catch (e) {
                        setError('Error: Failed to initialize scissor mechanism. ' + e.message);
                    }

                    // Scroll handler
                    const handleScroll = () => {
                        const contentElement = contentRef?.current;
                        if (!contentElement) {
                            setError('Error: Content element not found.');
                            return;
                        }
                        const scrollY = window.scrollY;
                        const maxScroll = contentElement.offsetHeight - window.innerHeight;
                        const scrollFraction = Math.min(scrollY / maxScroll, 1);
                        tableHeightRef.current = 0.05 + scrollFraction * (maxHeight - 0.05);
                        updateScissorMechanism(tableHeightRef.current, scrollFraction);
                    };

                    window.addEventListener('scroll', handleScroll);

                    // Resize handler
                    const handleResize = () => {
                        try {
                            camera.aspect = window.innerWidth / window.innerHeight;
                            camera.updateProjectionMatrix();
                            renderer.setSize(window.innerWidth, window.innerHeight);
                        } catch (e) {
                            setError('Error in resize handler: ' + e.message);
                        }
                    };

                    window.addEventListener('resize', handleResize);

                    // Animation loop
                    const animate = () => {
                        try {
                            requestAnimationFrame(animate);
                            renderer.render(scene, camera);
                        } catch (e) {
                            setError('Error in animation loop: ' + e.message);
                        }
                    };
                    animate();

                    // Cleanup on unmount
                    return () => {
                        window.removeEventListener('scroll', handleScroll);
                        window.removeEventListener('resize', handleResize);
                        if (canvasContainerRef.current && renderer.domElement) {
                            canvasContainerRef.current.removeChild(renderer.domElement);
                        }
                    };
                }  catch (e) {
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
                        className="w-screen h-screen fixed top-0 left-0"
                    ></div>
                   
                    </div>
                
            );
        };
