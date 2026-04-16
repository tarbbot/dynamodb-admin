/**
 * Matrix Digital Rain Effect
 * Simplified implementation inspired by github.com/willianjusten/labs
 * Adapted for multi-theme support
 */

(function() {
  'use strict';

  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');

  // Japanese Katakana + symbols (authentic Matrix characters)
  const letters = [
    "日","ﾊ","ﾐ","ﾋ","ｰ","ｳ","ｼ","ﾅ","ﾓ","ﾆ","ｻ","ﾜ","ﾂ","ｵ","ﾘ","ｱ","ﾎ","ﾃ","ﾏ","ｹ","ﾒ","ｴ","ｶ","ｷ","ﾑ","ﾕ","ﾗ","ｾ","ﾈ","ｽ","ﾀ","ﾇ","ﾍ",
    "0","1","2","3","4","5","6","7","8","9",
    ":","・",".","=","*","+","-","<",">","¦","｜"
  ];

  const fontSize = 16;
  let columns, drops;

  // Theme-specific colors
  function getThemeColor() {
    const theme = document.documentElement.getAttribute('data-theme');

    switch(theme) {
      case 'matrix':
        return '#0F0'; // Classic Matrix green
      case 'aurora-dark':
        return '#8B5CF6'; // Purple
      case 'cyberpunk':
        return '#FF00FF'; // Magenta
      case 'ocean':
        return '#0EA5E9'; // Sky blue
      case 'sunset':
        return '#F97316'; // Orange
      case 'crystal-light':
        return '#6366F1'; // Indigo
      case 'monochrome':
        return '#FFFFFF'; // White
      default:
        return '#0F0';
    }
  }

  function init() {
    // Setup canvas
    c.id = 'matrix-rain-bg';
    c.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      z-index: -1;
      pointer-events: none;
      display: block;
    `;

    document.body.prepend(c);
    resize();
  }

  function resize() {
    c.height = window.innerHeight;
    c.width = window.innerWidth;

    columns = Math.floor(c.width / fontSize);
    drops = [];

    // Initialize drops at random positions
    for (let x = 0; x < columns; x++) {
      drops[x] = Math.floor(Math.random() * -100); // Start above screen
    }
  }

  function draw() {
    // Black overlay for fade effect (lower = longer trails)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, c.width, c.height);

    // Set color based on theme
    ctx.fillStyle = getThemeColor();
    ctx.font = `${fontSize}px monospace`;

    // Draw characters
    for (let i = 0; i < drops.length; i++) {
      // Random character from letters array
      const text = letters[Math.floor(Math.random() * letters.length)];

      // Draw character
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      // Reset drop to top when it reaches bottom (with random probability)
      if (drops[i] * fontSize > c.height && Math.random() > 0.975) {
        drops[i] = 0;
      }

      // Move drop down (slower speed)
      drops[i] += 0.3; // Reduced from 1 to 0.3 (70% slower)
    }

    requestAnimationFrame(draw);
  }

  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 250);
  });

  // Re-render on theme change (color changes)
  window.addEventListener('themechange', () => {
    // Colors will update automatically on next draw
  });

  // Initialize and start
  init();
  draw();

  // Expose stop method if needed
  window.MatrixRain = {
    stop: () => c.remove()
  };
})();
