import * as THREE from 'three';

export function initThreeScene() {
  const canvas = document.querySelector('#bg-canvas');
  const scene = new THREE.Scene();

  // Add a very subtle fog for depth
  scene.fog = new THREE.FogExp2(0x050505, 0.0015);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true // Background is transparent
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create Neural Network / Data Sphere Nodes
  const particleCount = 250;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const group = new THREE.Group();
  scene.add(group);

  const colorPalette = [
    new THREE.Color('#8a2be2'), // Electric Violet
    new THREE.Color('#00f3ff'), // Cyber Blue
    new THREE.Color('#ffffff')  // White accent
  ];

  for (let i = 0; i < particleCount; i++) {
    // Generate points on a sphere
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(Math.random() * 2 - 1);
    const radius = 12 + Math.random() * 8; // Random variance in sphere thickness

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Assign random theme color
    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Particle Material (Glowing Nodes)
  const material = new THREE.PointsMaterial({
    size: 0.35,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(geometry, material);
  group.add(particles);

  // Connection lines (The Neural Network)
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.05,
    blending: THREE.AdditiveBlending
  });

  const lineGeometry = new THREE.BufferGeometry();
  let linePositions = [];
  
  // Find nearby particles and connect them
  for (let i = 0; i < particleCount; i++) {
    for (let j = i + 1; j < particleCount; j++) {
      const dx = positions[i * 3] - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < 5.0) {
        linePositions.push(
          positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
          positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
        );
      }
    }
  }

  lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  group.add(lines);

  // Position group on the right side mostly, for desktop
  if(window.innerWidth > 768) {
      group.position.x = 12;
  }

  // Mouse interaction variables
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
  });

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Gentle floating rotation
    group.rotation.y += 0.001;
    group.rotation.x = Math.sin(elapsedTime * 0.3) * 0.1;

    // Mouse parallax
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;

    group.rotation.x += 0.05 * (targetY - group.rotation.x);
    group.rotation.y += 0.05 * (targetX - group.rotation.y);

    // Dynamic glow for the lines
    lineMaterial.opacity = 0.05 + Math.sin(elapsedTime * 1.5) * 0.02;

    renderer.render(scene, camera);
  }

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if(window.innerWidth > 768) {
        group.position.x = 12;
    } else {
        group.position.x = 0;
    }
  });
}
