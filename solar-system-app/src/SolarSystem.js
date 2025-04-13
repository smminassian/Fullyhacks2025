import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './SolarSystem.css';

const SolarSystem = () => {
    const containerRef = useRef(null);
    const [selectedPlanet, setSelectedPlanet] = useState(null);
    const [currentSystem, setCurrentSystem] = useState('solar'); // 'solar', 'proxima', or 'mov'
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

        // Add colored nebula for background based on current system
        let nebulaColors;
        if (currentSystem === 'solar') {
            nebulaColors = [0x0000ff, 0x00ffff, 0x8080ff]; // Blue nebula for Solar System
        } else if (currentSystem === 'proxima') {
            nebulaColors = [0xff2000, 0xff8000, 0xff4040]; // Red nebula for Proxima
        } else if (currentSystem === 'mov') {
            nebulaColors = [0x5d3fd3, 0x7b68ee, 0x9370db]; // Purple nebula for Mov System
        }

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

        // Create star (Sun/Proxima/Gargantua) glow
        let starColor;
        let starSize;
        
        if (currentSystem === 'solar') {
            starColor = 0xffff99;
            starSize = 6;
        } else if (currentSystem === 'proxima') {
            starColor = 0xff9980;
            starSize = 4.5;
        } else if (currentSystem === 'mov') {
            starColor = 0x000000;  // Black for Gargantua black hole
            starSize = 7;
        }
        
        const starGlowGeometry = new THREE.SphereGeometry(starSize, 32, 32);
        const starGlowMaterial = new THREE.MeshBasicMaterial({
            color: starColor,
            transparent: true,
            opacity: currentSystem === 'mov' ? 0.8 : 0.3
        });
        const starGlow = new THREE.Mesh(starGlowGeometry, starGlowMaterial);
        scene.add(starGlow);

        // Add accretion disk for Gargantua (only in Mov system)
        if (currentSystem === 'mov') {
            // Inner accretion disk
            const innerDiskGeometry = new THREE.RingGeometry(8, 15, 64);
            const innerDiskMaterial = new THREE.MeshBasicMaterial({
                color: 0xffff00,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.7
            });
            const innerDisk = new THREE.Mesh(innerDiskGeometry, innerDiskMaterial);
            innerDisk.rotation.x = Math.PI / 2;
            scene.add(innerDisk);
            
            // Outer accretion disk
            const outerDiskGeometry = new THREE.RingGeometry(15, 25, 64);
            const outerDiskMaterial = new THREE.MeshBasicMaterial({
                color: 0xff6600,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.5
            });
            const outerDisk = new THREE.Mesh(outerDiskGeometry, outerDiskMaterial);
            outerDisk.rotation.x = Math.PI / 2;
            scene.add(outerDisk);
        }

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
        let systemData;
        
        if (currentSystem === 'solar') {
            systemData = [
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
            ];
        } else if (currentSystem === 'proxima') {
            systemData = [
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
        } else if (currentSystem === 'mov') {
            systemData = [
                {
                    name: 'Gargantua',
                    radius: 5,
                    distance: 0,
                    color: 0x000000,
                    rotationSpeed: 0.001,
                    orbitSpeed: 0,
                    description: "Gargantua is a supermassive black hole from the movie Interstellar. It has a mass of 100 million suns.",
                    facts: [
                        "Gargantua rotates at 99.8% of the speed of light.",
                        "The black hole's enormous gravity creates extreme time dilation effects.",
                        "Its visual appearance was created using accurate physics simulations.",
                        "Kip Thorne, a theoretical physicist, consulted on the design of Gargantua for scientific accuracy."
                    ]
                },
                {
                    name: 'Miller\'s Planet',
                    radius: 1.3,
                    distance: 14,
                    color: 0x0077be,
                    rotationSpeed: 0.008,
                    orbitSpeed: 0.035,
                    description: "Miller's Planet orbits extremely close to the black hole Gargantua, causing massive time dilation.",
                    facts: [
                        "Due to extreme time dilation, 1 hour on Miller's Planet equals 7 years on Earth.",
                        "The planet is covered by a shallow ocean with massive tidal waves.",
                        "The waves are caused by the gravitational pull of the black hole Gargantua.",
                        "The planet was named after Dr. Miller, a scientist who landed there to explore its potential for human habitation."
                    ],
                    showVideo: true
                },
                {
                    name: 'Mann\'s Planet',
                    radius: 1.6,
                    distance: 22,
                    color: 0xf0f8ff,
                    rotationSpeed: 0.005,
                    orbitSpeed: 0.025,
                    description: "Mann's Planet is an ice-covered world from the movie Interstellar.",
                    facts: [
                        "The planet has a frozen, inhospitable surface with ammonia-rich atmosphere.",
                        "It was falsely reported as habitable by Dr. Mann to lure rescue.",
                        "The planet has intense storms and unstable ice formations.",
                        "Despite its appearance, the planet cannot support human life without extensive terraforming."
                    ]
                },
                {
                    name: 'Minecraft',
                    radius: 1.5,
                    distance: 30,
                    color: 0x228B22,
                    rotationSpeed: 0.007,
                    orbitSpeed: 0.015,
                    description: "A cubic planet inspired by the popular video game Minecraft, added to the Mov System.",
                    facts: [
                        "The planet's surface is entirely composed of cube-shaped biomes.",
                        "Resources can be mined from the planet's crust to build structures.",
                        "The planet has a day-night cycle with hostile creatures appearing at night.",
                        "Gravity on Minecraft is uniform regardless of mass, with all objects falling at the same rate."
                    ]
                }
            ];
        }

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
            let geometry;
            
            // Create cubic geometry for Minecraft planet
            if (planet.name === 'Minecraft') {
                geometry = new THREE.BoxGeometry(planet.radius * 1.5, planet.radius * 1.5, planet.radius * 1.5);
            } else {
                geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
            }
            
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

            // Add special effects for Mann's Planet
            if (planet.name === "Mann's Planet") {
                // Add ice crystal particles around the planet
                const iceParticlesGeometry = new THREE.BufferGeometry();
                const iceParticlesCount = 300;
                const iceParticlesPositions = new Float32Array(iceParticlesCount * 3);

                for (let i = 0; i < iceParticlesCount; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const height = (Math.random() - 0.5) * 0.5;
                    const distance = planet.radius * 1.1 + (Math.random() * 0.3);
                    
                    iceParticlesPositions[i * 3] = Math.cos(angle) * distance;
                    iceParticlesPositions[i * 3 + 1] = height;
                    iceParticlesPositions[i * 3 + 2] = Math.sin(angle) * distance;
                }

                iceParticlesGeometry.setAttribute('position', new THREE.BufferAttribute(iceParticlesPositions, 3));
                
                const iceParticlesMaterial = new THREE.PointsMaterial({
                    color: 0xccccff,
                    size: 0.1,
                    transparent: true,
                    opacity: 0.7,
                    blending: THREE.AdditiveBlending
                });
                
                const iceParticles = new THREE.Points(iceParticlesGeometry, iceParticlesMaterial);
                mesh.add(iceParticles);
                
                // Add stormy cloud layer
                const cloudGeometry = new THREE.SphereGeometry(planet.radius * 1.05, 32, 32);
                const cloudMaterial = new THREE.MeshPhongMaterial({
                    color: 0xe0e0e0,
                    transparent: true,
                    opacity: 0.3,
                    shininess: 50
                });
                const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
                mesh.add(clouds);
            }

            // Add special effects for Minecraft planet
            if (planet.name === "Minecraft") {
                // Create texture to simulate Minecraft blocks
                const size = 512;
                const data = new Uint8Array(size * size * 4);
                
                // Create a pixelated texture pattern
                const blockSize = 32;  // Size of each "block"
                const colors = [
                    [34, 139, 34],  // Forest green
                    [139, 69, 19],  // Brown
                    [65, 105, 225], // Blue
                    [222, 184, 135] // Sand
                ];
                
                for (let i = 0; i < size; i++) {
                    for (let j = 0; j < size; j++) {
                        const blockX = Math.floor(i / blockSize);
                        const blockY = Math.floor(j / blockSize);
                        
                        // Choose a color based on the block position
                        const colorIndex = (blockX + blockY * 3) % colors.length;
                        const color = colors[colorIndex];
                        
                        // Add some variation within blocks
                        const variation = Math.floor(Math.random() * 20) - 10;
                        
                        const idx = (i + j * size) * 4;
                        data[idx] = Math.max(0, Math.min(255, color[0] + variation));
                        data[idx + 1] = Math.max(0, Math.min(255, color[1] + variation));
                        data[idx + 2] = Math.max(0, Math.min(255, color[2] + variation));
                        data[idx + 3] = 255;
                    }
                }
                
                const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
                texture.needsUpdate = true;
                
                // Apply the texture to the cube
                mesh.material = new THREE.MeshLambertMaterial({
                    map: texture
                });
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

            // Position planet
            if (planet.distance > 0) {
                const angle = Math.random() * Math.PI * 2;
                mesh.position.x = Math.cos(angle) * planet.distance;
                mesh.position.z = Math.sin(angle) * planet.distance;
                
                // Store initial orbit angle
                mesh.userData.orbitAngle = angle;
                mesh.userData.orbitDistance = planet.distance;
            }
            
            scene.add(mesh);
            planets.push(mesh);
            
            if (planet.name !== 'Sun' && planet.name !== 'Proxima Centauri' && planet.name !== 'Gargantua') {
                planetMeshes.push(mesh);
            }
        });

        // Set up camera position
        camera.position.z = 50;
        camera.position.y = 30;
        camera.lookAt(0, 0, 0);

        // Set up controls for orbit
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let cameraOrbitAngleX = 0;
        let cameraOrbitAngleY = 0.5;
        
        // Handle mouse events
        const handleMouseDown = (event) => {
            isDragging = true;
            previousMousePosition = {
                x: event.clientX,
                y: event.clientY
            };
        };
        
        const handleMouseMove = (event) => {
            if (!isDragging) return;

            const deltaMove = {
                x: event.clientX - previousMousePosition.x,
                y: event.clientY - previousMousePosition.y
            };

            // Update orbit angles based on mouse movement
            cameraOrbitAngleX += deltaMove.x * 0.01;
            cameraOrbitAngleY = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, cameraOrbitAngleY + deltaMove.y * 0.01));

            // Update camera position
            const radius = camera.position.length();
            camera.position.x = radius * Math.sin(cameraOrbitAngleY) * Math.cos(cameraOrbitAngleX);
            camera.position.y = radius * Math.cos(cameraOrbitAngleY);
            camera.position.z = radius * Math.sin(cameraOrbitAngleY) * Math.sin(cameraOrbitAngleX);
            
            camera.lookAt(0, 0, 0);
            
            previousMousePosition = {
                x: event.clientX,
                y: event.clientY
            };
        };
        
        const handleMouseUp = () => {
            isDragging = false;
        };
        
        const handleMouseWheel = (event) => {
            const zoomSpeed = 0.1;
            const newZoom = camera.position.length() + (event.deltaY > 0 ? zoomSpeed * 5 : -zoomSpeed * 5);
            
            // Limit zoom range
            if (newZoom > 10 && newZoom < 200) {
                const direction = new THREE.Vector3().subVectors(camera.position, new THREE.Vector3(0, 0, 0)).normalize();
                camera.position.copy(direction.multiplyScalar(newZoom));
            }
        };
        
        // Handle planet click
        const handleClick = (event) => {
            // Calculate mouse position in normalized device coordinates
            const rect = renderer.domElement.getBoundingClientRect();
            const mouse = new THREE.Vector2(
                ((event.clientX - rect.left) / rect.width) * 2 - 1,
                -((event.clientY - rect.top) / rect.height) * 2 + 1
            );
            
            // Set up raycaster
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);
            
            // Check for intersections with planets
            const intersects = raycaster.intersectObjects(planetMeshes);
            
            if (intersects.length > 0) {
                const planet = intersects[0].object;
                setSelectedPlanet(planet.userData.planetData);
                
                // Show video for Miller's Planet if available
                if (planet.userData.planetData.showVideo) {
                    setShowVideo(true);
                }
            } else {
                setSelectedPlanet(null);
                setShowVideo(false);
            }
        };
        
        // Add event listeners
        renderer.domElement.addEventListener('mousedown', handleMouseDown);
        renderer.domElement.addEventListener('mousemove', handleMouseMove);
        renderer.domElement.addEventListener('mouseup', handleMouseUp);
        renderer.domElement.addEventListener('wheel', handleMouseWheel);
        renderer.domElement.addEventListener('click', handleClick);
        
        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Rotate planets
            planets.forEach(planet => {
                if (planet.userData.planetData) {
                    // Self-rotation
                    planet.rotation.y += planet.userData.planetData.rotationSpeed;
                    
                    // Orbit around star
                    if (planet.userData.planetData.orbitSpeed > 0) {
                        planet.userData.orbitAngle += planet.userData.planetData.orbitSpeed;
                        
                        planet.position.x = Math.cos(planet.userData.orbitAngle) * planet.userData.orbitDistance;
                        planet.position.z = Math.sin(planet.userData.orbitAngle) * planet.userData.orbitDistance;
                    }
                }
            });
            
            // Update comets
            comets.forEach(comet => {
                comet.position.add(comet.userData.direction.clone().multiplyScalar(comet.userData.speed));
                
                // Reset comet position if it goes too far
                if (comet.position.length() > 600) {
                    const radius = 200 + Math.random() * 300;
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
                
                // Update tail direction to point away from comet movement
                const tail = comet.children[0];
                tail.lookAt(comet.position.clone().add(comet.userData.direction.clone().multiplyScalar(-1)));
            });
            
            renderer.render(scene, camera);
        };
        
        animate();
        
        // Handle window resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.5);
        };
        
        window.addEventListener('resize', handleResize);
        
        // Clean up function
        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.domElement.removeEventListener('mousedown', handleMouseDown);
            renderer.domElement.removeEventListener('mousemove', handleMouseMove);
            renderer.domElement.removeEventListener('mouseup', handleMouseUp);
            renderer.domElement.removeEventListener('wheel', handleMouseWheel);
            renderer.domElement.removeEventListener('click', handleClick);
            
            // Dispose geometries and materials
            scene.traverse(object => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
            
            // Stop any ongoing animations
            planets.forEach(planet => {
                clearInterval(planet.userData.waveInterval);
            });
            
            renderer.dispose();
        };
    }, [currentSystem, setSelectedPlanet, setShowVideo]);

    // System selector handler
    const handleSystemChange = (system) => {
        setCurrentSystem(system);
        setSelectedPlanet(null);
        setShowVideo(false);
    };
    
    // Video modal component
    const VideoModal = () => {
        if (!showVideo) return null;
        
        return (
            <div className="video-modal">
                <button className="close-button" onClick={() => setShowVideo(false)}>×</button>
                <iframe 
                    width="560" 
                    height="315" 
                    src="https://www.youtube.com/embed/o_Ay_iDRAbc" 
                    title="Miller's Planet Scene" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>
        );
    };
    
    // Planet info panel
    const PlanetInfo = () => {
        if (!selectedPlanet) return null;
        
        return (
            <div className="planet-info">
                <h2>{selectedPlanet.name}</h2>
                <p className="description">{selectedPlanet.description}</p>
                <h3>Facts:</h3>
                <ul>
                    {selectedPlanet.facts.map((fact, index) => (
                        <li key={index}>{fact}</li>
                    ))}
                </ul>
                {selectedPlanet.showVideo && (
                    <button className="video-button" onClick={() => setShowVideo(true)}>
                        Watch Scene
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="solar-system-container">
            <div className="system-selector">
                <button 
                    className={currentSystem === 'solar' ? 'active' : ''} 
                    onClick={() => handleSystemChange('solar')}
                >
                    Solar System
                </button>
                <button 
                    className={currentSystem === 'proxima' ? 'active' : ''} 
                    onClick={() => handleSystemChange('proxima')}
                >
                    Proxima Centauri
                </button>
                <button 
                    className={currentSystem === 'mov' ? 'active' : ''} 
                    onClick={() => handleSystemChange('mov')}
                >
                    Mov System
                </button>
            </div>
            
            <div className="main-content">
                <div ref={containerRef} className="canvas-container"></div>
                <PlanetInfo />
            </div>
            
            <VideoModal />
            
            <div className="instructions">
                <p>Click on a planet to learn more about it. Drag to rotate the view. Scroll to zoom in/out.</p>
            </div>
        </div>
    );
};

export default SolarSystem;