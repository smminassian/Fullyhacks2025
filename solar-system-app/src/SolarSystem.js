import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './SolarSystem.css';

const SolarSystem = () => {
    const containerRef = useRef(null);
    const [selectedPlanet, setSelectedPlanet] = useState(null);
    const [currentSystem, setCurrentSystem] = useState('solar'); // 'solar' or 'proxima'
    const [showVideo, setShowVideo] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;

        // Clean up previous scene if it exists
        while (containerRef.current.firstChild) {
            containerRef.current.removeChild(containerRef.current.firstChild);
        }

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.5);
        containerRef.current.appendChild(renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 2, 100);
        pointLight.position.set(0, 0, 0);
        scene.add(pointLight);

        // Add stars
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 3000;
        const positions = new Float32Array(starsCount * 3);

        for (let i = 0; i < starsCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 2000;
            positions[i + 1] = (Math.random() - 0.5) * 2000;
            positions[i + 2] = (Math.random() - 0.5) * 2000;
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);

        // Add colored nebula for background
        const nebulaColors = currentSystem === 'solar' ?
            [0x0000ff, 0x00ffff, 0x8080ff] : // Blue nebula for Solar System
            [0xff2000, 0xff8000, 0xff4040];  // Red nebula for Proxima

        for (let i = 0; i < 3; i++) {
            const nebulaGeometry = new THREE.BufferGeometry();
            const nebulaCount = 500;
            const nebulaPositions = new Float32Array(nebulaCount * 3);

            const radius = 400 + i * 50;

            for (let j = 0; j < nebulaCount; j++) {
                const t = Math.random() * Math.PI * 2;
                const p = Math.acos(Math.random() * 2 - 1);
                const r = radius + (Math.random() - 0.5) * 100;

                nebulaPositions[j * 3] = r * Math.sin(p) * Math.cos(t);
                nebulaPositions[j * 3 + 1] = r * Math.sin(p) * Math.sin(t);
                nebulaPositions[j * 3 + 2] = r * Math.cos(p);
            }

            nebulaGeometry.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));

            const nebulaMaterial = new THREE.PointsMaterial({
                color: nebulaColors[i],
                size: 10,
                transparent: true,
                opacity: 0.1,
                blending: THREE.AdditiveBlending
            });

            const nebula = new THREE.Points(nebulaGeometry, nebulaMaterial);
            scene.add(nebula);
        }

        // Create star (Sun/Proxima) glow
        const starColor = currentSystem === 'solar' ? 0xffff99 : 0xff9980;
        const sunGlowGeometry = new THREE.SphereGeometry(currentSystem === 'solar' ? 6 : 4.5, 32, 32);
        const sunGlowMaterial = new THREE.MeshBasicMaterial({
            color: starColor,
            transparent: true,
            opacity: 0.3
        });
        const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
        scene.add(sunGlow);

        // Create a few comets
        const comets = [];
        for (let i = 0; i < 5; i++) {
            // Create comet body
            const cometGeometry = new THREE.SphereGeometry(0.5, 16, 16);
            const cometMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const comet = new THREE.Mesh(cometGeometry, cometMaterial);

            // Create comet tail
            const tailGeometry = new THREE.BufferGeometry();
            const tailVertices = [];
            const tailLength = Math.random() * 30 + 20;
            const tailSegments = 20;

            for (let j = 0; j < tailSegments; j++) {
                const t = j / (tailSegments - 1);
                tailVertices.push(0, 0, 0);
                tailVertices.push(-tailLength * t, 0, 0);
            }

            tailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(tailVertices, 3));

            const tailMaterial = new THREE.LineBasicMaterial({
                color: 0x88ccff,
                transparent: true,
                opacity: 0.6
            });

            const tail = new THREE.LineSegments(tailGeometry, tailMaterial);
            comet.add(tail);

            // Position comet randomly
            const radius = 200 + Math.random() * 300;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);

            comet.position.x = radius * Math.sin(phi) * Math.cos(theta);
            comet.position.y = radius * Math.sin(phi) * Math.sin(theta);
            comet.position.z = radius * Math.cos(phi);

            // Set random speed and direction
            comet.userData.speed = Math.random() * 0.4 + 0.2;
            comet.userData.direction = new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ).normalize();

            scene.add(comet);
            comets.push(comet);
        }

        // Planet data based on current system
        const systemData = currentSystem === 'solar' ? [
            {
                name: 'Sun',
                radius: 5,
                distance: 0,
                color: 0xffdd00,
                rotationSpeed: 0.001,
                orbitSpeed: 0,
                description: "The Sun is the star at the center of our Solar System. It's about 4.6 billion years old and accounts for 99.86% of the mass in the Solar System.",
                facts: [
                    "The Sun is so large that about 1.3 million Earths could fit inside it.",
                    "The Sun's core reaches temperatures of 15 million degrees Celsius.",
                    "Light from the Sun takes about 8 minutes to reach Earth.",
                    "The Sun converts 600 million tons of hydrogen into helium every second."
                ]
            },
            {
                name: 'Mercury',
                radius: 0.4,
                distance: 10,
                color: 0x8c8c8c,
                rotationSpeed: 0.005,
                orbitSpeed: 0.04,
                description: "Mercury is the smallest and innermost planet in the Solar System.",
                facts: [
                    "Mercury has no atmosphere, which causes it to have extreme temperature variations.",
                    "A day on Mercury lasts 176 Earth days.",
                    "Mercury's surface resembles our Moon with many impact craters.",
                    "Despite being closest to the Sun, Venus is actually hotter than Mercury."
                ]
            },
            {
                name: 'Venus',
                radius: 0.9,
                distance: 15,
                color: 0xe6e6fa,
                rotationSpeed: 0.005,
                orbitSpeed: 0.03,
                description: "Venus is the second planet from the Sun and the hottest planet in our Solar System.",
                facts: [
                    "Venus rotates backwards compared to other planets.",
                    "A day on Venus is longer than its year - it takes 243 Earth days to rotate once.",
                    "Venus has a crushing surface pressure 90 times that of Earth.",
                    "Venus is the brightest natural object in Earth's night sky after the Moon."
                ]
            },
            {
                name: 'Earth',
                radius: 1,
                distance: 20,
                color: 0x0000ff,
                rotationSpeed: 0.005,
                orbitSpeed: 0.025,
                description: "Earth is the third planet from the Sun, the only astronomical object known to harbor life.",
                facts: [
                    "Earth is the only planet not named after a god or goddess.",
                    "Earth's atmosphere is 78% nitrogen, 21% oxygen, and 1% other gases.",
                    "70% of Earth's surface is covered by water.",
                    "Earth has a powerful magnetic field that protects us from solar radiation."
                ]
            },
            {
                name: 'Mars',
                radius: 0.5,
                distance: 25,
                color: 0xff0000,
                rotationSpeed: 0.005,
                orbitSpeed: 0.02,
                description: "Mars is the fourth planet from the Sun and is often called the 'Red Planet'.",
                facts: [
                    "Mars has the largest dust storms in the Solar System.",
                    "Mars has two small moons: Phobos and Deimos.",
                    "Mars has seasons like Earth, but they last twice as long.",
                    "Mount Olympus on Mars is the tallest mountain in the Solar System at 22km high."
                ]
            },
            {
                name: 'Miller\'s Planet',
                radius: 1.3,
                distance: 30,
                color: 0x0077be,
                rotationSpeed: 0.008,
                orbitSpeed: 0.015,
                description: "Miller's Planet from the movie Interstellar. This planet orbits extremely close to a supermassive black hole called Gargantua.",
                facts: [
                    "Due to extreme time dilation, 1 hour on Miller's Planet equals 7 years on Earth.",
                    "The planet is covered by a shallow ocean with massive tidal waves.",
                    "The waves are caused by the gravitational pull of the black hole Gargantua.",
                    "The planet was named after Dr. Miller, a scientist who landed there to explore its potential for human habitation."
                ],
                showVideo: true
            },
            {
                name: 'Jupiter',
                radius: 2.5,
                distance: 35,
                color: 0xffa500,
                rotationSpeed: 0.005,
                orbitSpeed: 0.01,
                description: "Jupiter is the fifth planet from the Sun and the largest in the Solar System.",
                facts: [
                    "Jupiter has the shortest day of all the planets, rotating once every 10 hours.",
                    "The Great Red Spot is a storm that has been raging for at least 400 years.",
                    "Jupiter has at least 79 known moons.",
                    "Jupiter's magnetic field is 14 times stronger than Earth's."
                ]
            },
            {
                name: 'Saturn',
                radius: 2.2,
                distance: 45,
                color: 0xffd700,
                rotationSpeed: 0.005,
                orbitSpeed: 0.0075,
                description: "Saturn is the sixth planet from the Sun and is famous for its spectacular ring system.",
                facts: [
                    "Saturn's rings are mostly made of water ice.",
                    "Saturn has at least 82 moons, the largest being Titan.",
                    "Saturn is the least dense planet in the Solar System.",
                    "A day on Saturn lasts only 10.7 Earth hours."
                ]
            },
            {
                name: 'Uranus',
                radius: 1.8,
                distance: 55,
                color: 0x00ffff,
                rotationSpeed: 0.005,
                orbitSpeed: 0.005,
                description: "Uranus is the seventh planet from the Sun and an ice giant.",
                facts: [
                    "Uranus rotates on its side with an axial tilt of 98 degrees.",
                    "Uranus was the first planet discovered with a telescope.",
                    "Uranus has 13 known rings.",
                    "Uranus appears blue-green due to methane in its atmosphere."
                ]
            },
            {
                name: 'Neptune',
                radius: 1.7,
                distance: 65,
                color: 0x0000cd,
                rotationSpeed: 0.005,
                orbitSpeed: 0.004,
                description: "Neptune is the eighth and farthest known planet from the Sun.",
                facts: [
                    "Neptune was located through mathematical calculations.",
                    "Neptune has the strongest winds in the Solar System, reaching speeds of 2,100 km/h.",
                    "Neptune's largest moon, Triton, orbits the planet backwards.",
                    "A year on Neptune lasts 165 Earth years."
                ]
            }
        ] : [
            {
                name: 'Proxima Centauri',
                radius: 3.5,
                distance: 0,
                color: 0xff6347,
                rotationSpeed: 0.001,
                orbitSpeed: 0,
                description: "Proxima Centauri is a small, low-mass red dwarf star located 4.2 light-years away from the Sun.",
                facts: [
                    "Proxima Centauri is part of the Alpha Centauri star system.",
                    "It's only about 12% the mass of our Sun and much dimmer.",
                    "This red dwarf emits powerful flares.",
                    "It's expected to survive for trillions of years."
                ]
            },
            {
                name: 'Proxima b',
                radius: 1.1,
                distance: 15,
                color: 0xa0522d,
                rotationSpeed: 0.005,
                orbitSpeed: 0.03,
                description: "Proxima b is an exoplanet orbiting within the habitable zone of Proxima Centauri.",
                facts: [
                    "Proxima b orbits its star every 11.2 Earth days.",
                    "The planet is tidally locked, meaning one side always faces the star.",
                    "It receives about 65% of the energy from its star that Earth gets from the Sun.",
                    "Proxima b is potentially habitable."
                ]
            },
            {
                name: 'Proxima c',
                radius: 2,
                distance: 30,
                color: 0x4682b4,
                rotationSpeed: 0.005,
                orbitSpeed: 0.015,
                description: "Proxima c is a candidate exoplanet orbiting Proxima Centauri.",
                facts: [
                    "Proxima c takes about 5 years to complete one orbit.",
                    "It's likely too cold for liquid water on its surface.",
                    "The planet was discovered through radial velocity measurements.",
                    "It's still considered a candidate planet."
                ]
            },
            {
                name: 'Proxima d',
                radius: 0.4,
                distance: 8,
                color: 0x708090,
                rotationSpeed: 0.005,
                orbitSpeed: 0.06,
                description: "Proxima d is a small exoplanet orbiting Proxima Centauri.",
                facts: [
                    "Proxima d orbits very close to its star, completing an orbit in just 5 days.",
                    "It's likely too hot for liquid water on its surface.",
                    "The planet was discovered in 2022.",
                    "It may be similar to Mercury in our Solar System."
                ]
            }
        ];

        // Create orbit lines
        systemData.forEach(planet => {
            if (planet.distance > 0) {
                const orbitGeometry = new THREE.RingGeometry(planet.distance - 0.1, planet.distance + 0.1, 128);
                const orbitMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.2
                });
                const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
                orbit.rotation.x = Math.PI / 2;
                scene.add(orbit);
            }
        });

        // Create planets
        const planets = [];
        const planetMeshes = []; // For raycasting

        systemData.forEach(planet => {
            const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
            const material = new THREE.MeshLambertMaterial({ color: planet.color });
            const mesh = new THREE.Mesh(geometry, material);

            mesh.userData.planetData = planet;

            // Add special effects for Miller's Planet
            if (planet.name === "Miller's Planet") {
                // Add water surface effect
                const waterGeometry = new THREE.SphereGeometry(planet.radius * 1.01, 32, 32);
                const waterMaterial = new THREE.MeshPhongMaterial({
                    color: 0x0077be,
                    transparent: true,
                    opacity: 0.7,
                    shininess: 100
                });
                const water = new THREE.Mesh(waterGeometry, waterMaterial);
                mesh.add(water);

                // Add small wave rings around the planet
                const addWaveRing = () => {
                    const ringGeometry = new THREE.RingGeometry(planet.radius * 1.02, planet.radius * 1.04, 32);
                    const ringMaterial = new THREE.MeshBasicMaterial({
                        color: 0x00a0ff,
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: 0.5
                    });
                    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                    ring.rotation.x = Math.PI / 2;

                    // Randomly rotate the ring
                    ring.rotation.y = Math.random() * Math.PI * 2;

                    mesh.add(ring);

                    // Animate the ring expanding and fading
                    let scale = 1;
                    let opacity = 0.5;

                    const animateRing = () => {
                        scale += 0.01;
                        opacity -= 0.005;

                        ring.scale.set(scale, scale, scale);
                        ringMaterial.opacity = opacity;

                        if (opacity <= 0) {
                            mesh.remove(ring);
                            ring.geometry.dispose();
                            ringMaterial.dispose();
                        } else {
                            requestAnimationFrame(animateRing);
                        }
                    };

                    animateRing();
                };

                // Add a wave every few seconds
                setInterval(addWaveRing, 3000);
            }

            if (planet.name === 'Saturn') {
                const ringGeometry = new THREE.RingGeometry(2.8, 4, 32);
                const ringMaterial = new THREE.MeshBasicMaterial({
                    color: 0xf0e0b0,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.7
                });
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                ring.rotation.x = Math.PI / 2;
                mesh.add(ring);
            }

            const planetObj = new THREE.Object3D();

            if (planet.distance > 0) {
                const angle = Math.random() * Math.PI * 2;
                planetObj.position.x = Math.cos(angle) * planet.distance;
                planetObj.position.z = Math.sin(angle) * planet.distance;
            }

            planetObj.add(mesh);
            scene.add(planetObj);

            planets.push({
                mesh: planetObj,
                rotationSpeed: planet.rotationSpeed,
                orbitSpeed: planet.orbitSpeed,
                data: planet
            });

            planetMeshes.push(mesh);
        });

        // Position camera
        camera.position.z = 100;
        camera.position.y = 40;
        camera.lookAt(0, 0, 0);

        // Interaction variables
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        // Raycaster for planet selection
        const raycaster = new THREE.Raycaster();
        const mouseVector = new THREE.Vector2();

        // Event handlers
        const handleMouseDown = (e) => {
            isDragging = false;
            previousMousePosition = { x: e.offsetX, y: e.offsetY };
        };

        const handleMouseMove = (e) => {
            if (!isDragging && (Math.abs(e.offsetX - previousMousePosition.x) > 3 ||
                Math.abs(e.offsetY - previousMousePosition.y) > 3)) {
                isDragging = true;
            }

            if (isDragging) {
                const deltaMove = {
                    x: e.offsetX - previousMousePosition.x,
                    y: e.offsetY - previousMousePosition.y
                };

                const rotationSpeed = 0.003;
                scene.rotation.y += deltaMove.x * rotationSpeed;

                const maxVerticalRotation = Math.PI / 3;
                scene.rotation.x = Math.max(
                    -maxVerticalRotation,
                    Math.min(maxVerticalRotation, scene.rotation.x + deltaMove.y * rotationSpeed)
                );
            }

            previousMousePosition = { x: e.offsetX, y: e.offsetY };
        };

        const handleMouseUp = () => {
            if (!isDragging) {
                // It was a click, not a drag
                const rect = containerRef.current.getBoundingClientRect();
                mouseVector.x = ((previousMousePosition.x) / renderer.domElement.clientWidth) * 2 - 1;
                mouseVector.y = -((previousMousePosition.y) / renderer.domElement.clientHeight) * 2 + 1;

                raycaster.setFromCamera(mouseVector, camera);
                const intersects = raycaster.intersectObjects(planetMeshes);

                if (intersects.length > 0) {
                    const planetData = intersects[0].object.userData.planetData;
                    setSelectedPlanet(planetData);
                    setShowVideo(planetData.name === "Miller's Planet");
                } else {
                    setSelectedPlanet(null);
                    setShowVideo(false);
                }
            }

            isDragging = false;
        };

        const handleWheel = (e) => {
            e.preventDefault();
            const zoomSpeed = 0.1;

            if (e.deltaY > 0 && camera.position.z < 180) {
                camera.position.z += zoomSpeed * 10;
            } else if (e.deltaY < 0 && camera.position.z > 30) {
                camera.position.z -= zoomSpeed * 10;
            }
        };

        // Add event listeners
        containerRef.current.addEventListener('mousedown', handleMouseDown);
        containerRef.current.addEventListener('mousemove', handleMouseMove);
        containerRef.current.addEventListener('mouseup', handleMouseUp);
        containerRef.current.addEventListener('wheel', handleWheel);

        // Animation function
        const animate = () => {
            requestAnimationFrame(animate);

            // Animate planets
            planets.forEach(planet => {
                if (planet.data.distance > 0) {
                    const angle = Date.now() * 0.001 * planet.orbitSpeed;
                    planet.mesh.position.x = Math.cos(angle) * planet.data.distance;
                    planet.mesh.position.z = Math.sin(angle) * planet.data.distance;

                    if (planet.mesh.children.length > 0) {
                        planet.mesh.children[0].rotation.y += planet.rotationSpeed;
                    }
                } else if (planet.mesh.children.length > 0) {
                    planet.mesh.children[0].rotation.y += planet.rotationSpeed;
                }
            });

            // Animate comets
            comets.forEach(comet => {
                comet.position.x += comet.userData.direction.x * comet.userData.speed;
                comet.position.y += comet.userData.direction.y * comet.userData.speed;
                comet.position.z += comet.userData.direction.z * comet.userData.speed;

                const distance = comet.position.length();
                if (distance > 600) {
                    const radius = 200 + Math.random() * 100;
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos(Math.random() * 2 - 1);

                    comet.position.x = radius * Math.sin(phi) * Math.cos(theta);
                    comet.position.y = radius * Math.sin(phi) * Math.sin(theta);
                    comet.position.z = radius * Math.cos(phi);

                    comet.userData.direction = new THREE.Vector3(
                        Math.random() - 0.5,
                        Math.random() - 0.5,
                        Math.random() - 0.5
                    ).normalize();
                }

                const direction = comet.position.clone().normalize();
                comet.lookAt(direction.multiplyScalar(-1).add(comet.position));
            });

            // Slow rotation for nebula effect
            scene.rotation.y += 0.0001;

            renderer.render(scene, camera);
        };

        animate();

        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            if (containerRef.current) {
                containerRef.current.removeEventListener('mousedown', handleMouseDown);
                containerRef.current.removeEventListener('mousemove', handleMouseMove);
                containerRef.current.removeEventListener('mouseup', handleMouseUp);
                containerRef.current.removeEventListener('wheel', handleWheel);
            }
        };
    }, [currentSystem]);

    // Window resize handler
    const handleResize = () => {
        // This will be defined in the scene setup
    };

    return (
        <div className="flex flex-col items-center space-bg text-white min-h-screen">
            <div className="w-full p-6 rounded-lg bg-gradient-to-r from-indigo-900 to-purple-900 mb-6 shadow-lg">
                <h1 className="text-4xl font-bold mb-2 text-center title-glow">Cosmic Explorer</h1>
                <p className="text-center text-blue-200">Interactive 3D Star System Visualization</p>
            </div>

            <div className="mb-6 flex flex-wrap justify-center gap-4">
                <button
                    className={`px-6 py-3 rounded-full cosmic-button ${currentSystem === 'solar'
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold shadow-lg'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    onClick={() => setCurrentSystem('solar')}
                >
                    Our Solar System
                </button>
                <button
                    className={`px-6 py-3 rounded-full cosmic-button ${currentSystem === 'proxima'
                        ? 'bg-gradient-to-r from-red-600 to-red-800 text-white font-bold shadow-lg'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    onClick={() => setCurrentSystem('proxima')}
                >
                    Proxima Centauri System
                </button>
            </div>

            <div className="mb-4 text-center text-blue-300">
                <p className="text-base mb-1 float-animation">👆 Click on a celestial body to learn about it</p>
                <p className="text-base">🖱️ Drag to rotate | 🖲️ Scroll to zoom</p>
            </div>

            <div ref={containerRef} className="w-full md:w-4/5 h-[60vh] border rounded-lg border-blue-900 shadow-2xl overflow-hidden planet-container"></div>

            {selectedPlanet && (
                <div className="mt-8 p-6 bg-gray-900/80 border border-blue-900 rounded-lg w-full max-w-2xl shadow-lg planet-container">
                    <h2 className="text-3xl font-bold text-center mb-4 text-blue-300 title-glow">{selectedPlanet.name}</h2>
                    <p className="mb-4 text-gray-300 leading-relaxed text-lg">{selectedPlanet.description}</p>

                    {showVideo && selectedPlanet.name === "Miller's Planet" ? (
                        <div className="my-4">
                            <h3 className="font-semibold mb-3 text-yellow-400">Miller's Planet from Interstellar:</h3>
                            <div className="relative pt-2 pb-4 h-0 rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                                <iframe
                                    className="absolute top-0 left-0 w-full h-full"
                                    width="560"
                                    height="315"
                                    src="https://www.youtube.com/embed/60h6lpnSgck?si=hY8tB9HJ6WSP7M1W"
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h3 className="font-semibold mb-3 text-xl text-yellow-400">Interesting Facts:</h3>
                            <ul className="space-y-3">
                                {selectedPlanet.facts.map((fact, index) => (
                                    <li key={index} className="pl-6 relative text-gray-300 text-lg">
                                        <span className="absolute left-0 top-2 w-3 h-3 bg-blue-500 rounded-full"></span>
                                        {fact}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            )}

            <div className="mt-8 p-6 bg-gray-900/80 border border-blue-900 rounded-lg w-full max-w-2xl shadow-lg planet-container">
                <h3 className="font-semibold mb-4 text-xl text-center text-green-400">About {currentSystem === 'solar' ? 'Our Solar System' : 'Proxima Centauri'}</h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                    {currentSystem === 'solar'
                        ? "Our Solar System consists of the Sun and everything that orbits around it, including eight planets, dwarf planets, and countless smaller objects like asteroids and comets. It formed approximately 4.6 billion years ago from the gravitational collapse of a giant interstellar molecular cloud. We've also included Miller's Planet from the movie Interstellar as a special feature - click on it to see the iconic wave scene!"
                        : "Proxima Centauri is the closest star to our Sun at just 4.2 light-years away. It's a small red dwarf star with at least three known exoplanets, including Proxima b which is potentially habitable. As part of the Alpha Centauri star system, it's a prime target for future interstellar exploration missions."
                    }
                </p>
            </div>

            <div className="w-full text-center text-blue-400 text-sm mt-8 mb-6">
                <p className="float-animation">Created with Three.js & React | Cosmic Explorer v1.1</p>
            </div>
        </div>
    );

};

export default SolarSystem;