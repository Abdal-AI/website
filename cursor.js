export function initCursor() {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  const canvas = document.querySelector('#cursor-canvas');
  if (!dot || !ring || !canvas) return;
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  
  const particles = [];

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Spawn particles for the "gravity wake"
    if (Math.random() > 0.4) {
      particles.push({
        x: mouseX,
        y: mouseY,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1.5 - 0.5, // slowly float upward
        life: 1,
        color: Math.random() > 0.5 ? '#ffffff' : '#8a2be2' // white and violet
      });
    }
  });

  // Bind hover states once since elements stay in DOM
  const interactiveEls = document.querySelectorAll('a, button, .glass-card, .tech-node, input, textarea');
  interactiveEls.forEach(el => {
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
  });
  
  function onEnter() {
    ring.classList.add('hover-state');
    dot.style.background = '#8a2be2';
    dot.style.boxShadow = '0 0 10px #8a2be2, 0 0 20px #8a2be2';
  }
  
  function onLeave() {
    ring.classList.remove('hover-state');
    dot.style.background = 'var(--cyber-blue)';
    dot.style.boxShadow = '0 0 10px var(--cyber-blue), 0 0 20px var(--cyber-blue)';
  }

  function animate() {
    // Smooth follow for the ring
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;

    if(dot) {
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    }
    if(ring) {
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
    }

    // Wake particles
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.015; // fade
      
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fill();

      if (p.life <= 0) {
        particles.splice(i, 1);
        i--;
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  animate();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}
