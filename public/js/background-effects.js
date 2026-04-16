/**
 * Background Effects Manager
 * Handles different animated background effects for each theme
 * Includes user preference management and accessibility support
 */

(function() {
  'use strict';

  class BackgroundEffectsManager {
    constructor() {
      this.currentEffect = null;
      this.canvas = null;
      this.animationFrame = null;

      // Available effects
      this.effects = {
        'none': { name: 'None', description: 'No animation' },
        'matrix-rain': { name: 'Matrix Rain', description: 'Falling characters' },
        'particles': { name: 'Particles', description: 'Connected dots' },
        'gradient': { name: 'Animated Gradient', description: 'Shifting colors' },
        'waves': { name: 'Waves', description: 'Flowing waves' },
        'shapes': { name: 'Floating Shapes', description: 'Drifting circles' },
        'stars': { name: 'Starfield', description: '3D space stars' }
      };

      // Theme-specific recommended effects
      this.themeRecommendations = {
        'aurora-dark': ['gradient', 'particles', 'stars', 'none'],
        'crystal-light': ['shapes', 'gradient', 'particles', 'none'],
        'cyberpunk': ['particles', 'matrix-rain', 'gradient', 'none'],
        'matrix': ['matrix-rain', 'particles', 'none'],
        'ocean': ['waves', 'particles', 'gradient', 'none'],
        'sunset': ['gradient', 'waves', 'shapes', 'none'],
        'monochrome': ['shapes', 'particles', 'none']
      };

      this.init();
    }

    init() {
      // Listen for theme changes
      window.addEventListener('themechange', (e) => {
        this.handleThemeChange(e.detail.theme);
      });

      // Initialize with current theme
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'aurora-dark';
      this.loadEffect(currentTheme);
    }

    handleThemeChange(theme) {
      const savedEffect = this.getSavedEffect(theme);
      this.loadEffect(theme, savedEffect);
    }

    getSavedEffect(theme) {
      const key = `background-effect-${theme}`;
      const saved = localStorage.getItem(key);

      // If saved, use it
      if (saved && this.effects[saved]) {
        return saved;
      }

      // Otherwise, use first recommendation (auto-select best effect)
      return this.themeRecommendations[theme]?.[0] || 'none';
    }

    saveEffect(theme, effectId) {
      const key = `background-effect-${theme}`;
      localStorage.setItem(key, effectId);
    }

    loadEffect(theme, effectId) {
      // If no effectId specified, get saved/recommended
      if (!effectId) {
        effectId = this.getSavedEffect(theme);
      }

      // Check prefers-reduced-motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && effectId !== 'none') {
        console.log('[BackgroundEffects] Reduced motion preferred, skipping animation');
        effectId = 'none';
      }

      // Cleanup previous effect
      this.cleanup();

      // Get theme colors
      const colors = this.getThemeColors(theme);

      // Load new effect
      switch(effectId) {
        case 'matrix-rain':
          this.currentEffect = new MatrixRainEffect(this.getCanvas(), theme, colors);
          break;
        case 'particles':
          this.currentEffect = new ParticlesEffect(this.getCanvas(), theme, colors);
          break;
        case 'gradient':
          this.currentEffect = new GradientEffect(theme, colors);
          break;
        case 'waves':
          this.currentEffect = new WavesEffect(theme, colors);
          break;
        case 'shapes':
          this.currentEffect = new ShapesEffect(theme, colors);
          break;
        case 'stars':
          this.currentEffect = new StarfieldEffect(this.getCanvas(), theme, colors);
          break;
        case 'none':
        default:
          // No effect
          break;
      }

      if (this.currentEffect) {
        this.currentEffect.start();
      }
    }

    getCanvas() {
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'background-effect-canvas';
        this.canvas.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          pointer-events: none;
        `;

        // Ensure body exists before prepending
        if (document.body) {
          document.body.prepend(this.canvas);
        } else {
          console.warn('[BackgroundEffects] document.body not ready yet');
          return null;
        }

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Handle resize
        window.addEventListener('resize', () => {
          this.canvas.width = window.innerWidth;
          this.canvas.height = window.innerHeight;
          if (this.currentEffect?.resize) {
            this.currentEffect.resize();
          }
        });
      }
      return this.canvas;
    }

    cleanup() {
      if (this.currentEffect?.stop) {
        this.currentEffect.stop();
      }
      this.currentEffect = null;

      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }

      // Remove canvas
      if (this.canvas) {
        this.canvas.remove();
        this.canvas = null;
      }

      // Remove CSS effects
      document.querySelectorAll('.background-effect-style').forEach(el => el.remove());
    }

    getThemeColors(theme) {
      const colors = {
        'aurora-dark': { primary: '#8B5CF6', secondary: '#06B6D4', accent: '#EC4899' },
        'crystal-light': { primary: '#6366F1', secondary: '#EC4899', accent: '#14B8A6' },
        'cyberpunk': { primary: '#FF00FF', secondary: '#00FFFF', accent: '#FFFF00' },
        'matrix': { primary: '#00FF41', secondary: '#39FF14', accent: '#00CC34' },
        'ocean': { primary: '#0EA5E9', secondary: '#06B6D4', accent: '#38BDF8' },
        'sunset': { primary: '#F97316', secondary: '#EC4899', accent: '#FB923C' },
        'monochrome': { primary: '#FFFFFF', secondary: '#CCCCCC', accent: '#999999' }
      };
      return colors[theme] || colors['aurora-dark'];
    }
  }

  // Matrix Rain Effect (Canvas)
  class MatrixRainEffect {
    constructor(canvas, theme, colors) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.theme = theme;
      this.colors = colors;

      const letters = [
        "日","ﾊ","ﾐ","ﾋ","ｰ","ｳ","ｼ","ﾅ","ﾓ","ﾆ","ｻ","ﾜ","ﾂ","ｵ","ﾘ","ｱ","ﾎ","ﾃ","ﾏ","ｹ","ﾒ","ｴ","ｶ","ｷ","ﾑ","ﾕ","ﾗ","ｾ","ﾈ","ｽ","ﾀ","ﾇ","ﾍ",
        "0","1","2","3","4","5","6","7","8","9",
        ":","・",".","=","*","+","-","<",">","¦","｜"
      ];
      this.letters = letters;
      this.fontSize = 16;
      this.columns = Math.floor(canvas.width / this.fontSize);
      this.drops = Array(this.columns).fill(0).map(() => Math.floor(Math.random() * -100));
    }

    start() {
      this.draw();
    }

    draw = () => {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = this.colors.primary;
      this.ctx.font = `${this.fontSize}px monospace`;

      for (let i = 0; i < this.drops.length; i++) {
        const text = this.letters[Math.floor(Math.random() * this.letters.length)];
        this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);

        if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
          this.drops[i] = 0;
        }
        this.drops[i] += 0.3;
      }

      this.animationFrame = requestAnimationFrame(this.draw);
    }

    stop() {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
    }

    resize() {
      this.columns = Math.floor(this.canvas.width / this.fontSize);
      this.drops = Array(this.columns).fill(0).map(() => Math.floor(Math.random() * -100));
    }
  }

  // Particles Effect (Canvas)
  class ParticlesEffect {
    constructor(canvas, theme, colors) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.theme = theme;
      this.colors = colors;

      this.particles = [];
      this.particleCount = 80;
      this.maxDistance = 150;

      this.init();
    }

    init() {
      this.particles = [];
      for (let i = 0; i < this.particleCount; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1
        });
      }
    }

    start() {
      this.draw();
    }

    draw = () => {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Update and draw particles
      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.colors.primary;
        this.ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < this.maxDistance) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.colors.secondary + Math.floor((1 - distance / this.maxDistance) * 50).toString(16).padStart(2, '0');
            this.ctx.lineWidth = 1;
            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
            this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
            this.ctx.stroke();
          }
        }
      }

      this.animationFrame = requestAnimationFrame(this.draw);
    }

    stop() {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
    }

    resize() {
      this.init();
    }
  }

  // Animated Gradient Effect (CSS)
  class GradientEffect {
    constructor(theme, colors) {
      this.theme = theme;
      this.colors = colors;
    }

    start() {
      const style = document.createElement('style');
      style.className = 'background-effect-style';
      style.textContent = `
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            -45deg,
            ${this.colors.primary}33,
            ${this.colors.secondary}33,
            ${this.colors.accent}33,
            ${this.colors.primary}33
          );
          background-size: 400% 400%;
          animation: gradient-shift 15s ease infinite;
          z-index: -1;
          pointer-events: none;
        }
      `;
      document.head.appendChild(style);
    }

    stop() {
      // CSS is cleaned up by manager
    }
  }

  // Waves Effect (CSS + Multiple Animated Layers)
  class WavesEffect {
    constructor(theme, colors) {
      this.theme = theme;
      this.colors = colors;
    }

    start() {
      // Container for all wave layers
      const container = document.createElement('div');
      container.className = 'background-effect-style waves-container';
      container.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 40vh;
        z-index: -1;
        pointer-events: none;
        overflow: hidden;
      `;

      // Create 3 wave layers with different colors, speeds, and directions
      const waveLayers = [
        { color: this.colors.primary, opacity: '15', duration: '12s', direction: 'normal', delay: '0s', height: '120%' },
        { color: this.colors.secondary, opacity: '12', duration: '18s', direction: 'reverse', delay: '-3s', height: '110%' },
        { color: this.colors.accent, opacity: '10', duration: '15s', direction: 'normal', delay: '-6s', height: '100%' }
      ];

      waveLayers.forEach((layer, index) => {
        const wave = document.createElement('div');
        wave.className = `wave-layer wave-layer-${index}`;
        wave.style.cssText = `
          position: absolute;
          bottom: 0;
          left: 0;
          width: 200%;
          height: ${layer.height};
          background: ${layer.color}${layer.opacity};
          border-radius: 1000px 1000px 0 0;
          animation: wave-${index} ${layer.duration} ${layer.direction} ease-in-out ${layer.delay} infinite;
        `;
        container.appendChild(wave);
      });

      // Add keyframe animations
      const style = document.createElement('style');
      style.className = 'background-effect-style';
      style.textContent = `
        @keyframes wave-0 {
          0% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-25%) translateY(-15px); }
          100% { transform: translateX(-50%) translateY(0); }
        }
        @keyframes wave-1 {
          0% { transform: translateX(0) translateY(0) scaleY(0.8); }
          50% { transform: translateX(-25%) translateY(-20px) scaleY(0.9); }
          100% { transform: translateX(-50%) translateY(0) scaleY(0.8); }
        }
        @keyframes wave-2 {
          0% { transform: translateX(0) translateY(0) scaleY(0.6); }
          50% { transform: translateX(-25%) translateY(-10px) scaleY(0.7); }
          100% { transform: translateX(-50%) translateY(0) scaleY(0.6); }
        }
      `;

      document.head.appendChild(style);
      document.body.prepend(container);
    }

    stop() {
      // Cleaned up by manager
    }
  }

  // Floating Shapes Effect (CSS)
  class ShapesEffect {
    constructor(theme, colors) {
      this.theme = theme;
      this.colors = colors;
    }

    start() {
      const container = document.createElement('div');
      container.className = 'background-effect-style floating-shapes';
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        pointer-events: none;
        z-index: -1;
      `;

      // Create 10 floating shapes
      for (let i = 0; i < 10; i++) {
        const shape = document.createElement('div');
        const size = 50 + Math.random() * 100;
        const left = Math.random() * 100;
        const delay = Math.random() * 10;
        const duration = (15 + Math.random() * 10) / 1.2; // 1.2x faster

        shape.style.cssText = `
          position: absolute;
          left: ${left}%;
          top: ${Math.random() * 100}%;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: ${this.colors.primary}22;
          animation: float-shape ${duration}s ease-in-out ${delay}s infinite;
        `;
        container.appendChild(shape);
      }

      const style = document.createElement('style');
      style.className = 'background-effect-style';
      style.textContent = `
        @keyframes float-shape {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-30px) translateX(20px); }
          50% { transform: translateY(-60px) translateX(-20px); }
          75% { transform: translateY(-30px) translateX(10px); }
        }
      `;

      document.head.appendChild(style);
      document.body.prepend(container);
    }

    stop() {
      // Cleaned up by manager
    }
  }

  // Starfield Effect (Canvas)
  class StarfieldEffect {
    constructor(canvas, theme, colors) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.theme = theme;
      this.colors = colors;

      this.stars = [];
      this.starCount = 300;
      this.init();
    }

    init() {
      this.stars = [];
      for (let i = 0; i < this.starCount; i++) {
        this.stars.push({
          x: Math.random() * this.canvas.width - this.canvas.width / 2,
          y: Math.random() * this.canvas.height - this.canvas.height / 2,
          z: Math.random() * this.canvas.width,
          speed: Math.random() * 2 + 0.5
        });
      }
    }

    start() {
      this.draw();
    }

    draw = () => {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      const cx = this.canvas.width / 2;
      const cy = this.canvas.height / 2;

      this.stars.forEach(star => {
        star.z -= star.speed;
        if (star.z <= 0) {
          star.z = this.canvas.width;
        }

        const k = 128 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;
        const size = (1 - star.z / this.canvas.width) * 2;
        const opacity = 1 - star.z / this.canvas.width;

        this.ctx.fillStyle = this.colors.primary + Math.floor(opacity * 255).toString(16).padStart(2, '0');
        this.ctx.fillRect(px, py, size, size);
      });

      this.animationFrame = requestAnimationFrame(this.draw);
    }

    stop() {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
    }

    resize() {
      this.init();
    }
  }

  // Initialize globally when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.backgroundEffects = new BackgroundEffectsManager();
    });
  } else {
    // DOM already loaded
    window.backgroundEffects = new BackgroundEffectsManager();
  }
})();
