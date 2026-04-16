/**
 * Theme Manager
 * Handles theme switching, persistence, and UI
 */

class ThemeManager {
  constructor() {
    this.themes = [
      {
        id: 'aurora-dark',
        name: 'Aurora Dark',
        description: 'Purple/Cyan/Pink aurora',
        icon: '🌌',
        colors: ['#8B5CF6', '#06B6D4', '#EC4899']
      },
      {
        id: 'crystal-light',
        name: 'Crystal Light',
        description: 'Clean light indigo/pink',
        icon: '☀️',
        colors: ['#6366F1', '#EC4899', '#14B8A6']
      },
      {
        id: 'cyberpunk',
        name: 'Cyberpunk Neon',
        description: 'Neon magenta/cyan',
        icon: '🌃',
        colors: ['#FF00FF', '#00FFFF', '#FFFF00']
      },
      {
        id: 'matrix',
        name: 'Matrix Green',
        description: 'Terminal green mono',
        icon: '💻',
        colors: ['#00FF41', '#39FF14', '#00FF41']
      },
      {
        id: 'ocean',
        name: 'Ocean Deep',
        description: 'Calming ocean blues',
        icon: '🌊',
        colors: ['#0EA5E9', '#14B8A6', '#06B6D4']
      },
      {
        id: 'sunset',
        name: 'Sunset Warm',
        description: 'Warm orange/pink',
        icon: '🌅',
        colors: ['#F97316', '#EC4899', '#FBBF24']
      },
      {
        id: 'monochrome',
        name: 'Monochrome Elite',
        description: 'B&W minimalist',
        icon: '⚪',
        colors: ['#FFFFFF', '#A3A3A3', '#E5E5E5']
      }
    ];

    this.currentTheme = this.getStoredTheme() || 'aurora-dark';
    this.initialized = false;
  }

  /**
   * Initialize theme system
   */
  init() {
    if (this.initialized) return;

    // Apply stored theme immediately
    this.applyTheme(this.currentTheme, false);

    // Render theme selector in breadcrumb
    this.renderThemeSelector();

    // Render background effect selector
    this.renderEffectSelector();

    // Setup keyboard shortcut (Cmd/Ctrl + T)
    this.setupKeyboardShortcut();

    this.initialized = true;
    console.log(`[ThemeManager] Initialized with theme: ${this.currentTheme}`);
  }

  /**
   * Get theme from cookie (with migration from old light/dark)
   */
  getStoredTheme() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'theme') {
        // Migrate old themes to new ones
        if (value === 'dark') {
          return 'aurora-dark';
        } else if (value === 'light') {
          return 'crystal-light';
        }
        return value;
      }
    }
    return null;
  }

  /**
   * Save theme to cookie (1 year expiration)
   */
  saveTheme(themeId) {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `theme=${themeId}; expires=${expires.toUTCString()}; path=/`;
  }

  /**
   * Apply theme to document
   */
  applyTheme(themeId, animated = true) {
    const html = document.documentElement;

    // Add transition class for smooth color transitions
    if (animated) {
      html.setAttribute('data-theme-transitioning', '');
    }

    // Set theme attribute
    html.setAttribute('data-theme', themeId);

    // Load theme CSS file
    this.loadThemeCSS(themeId);

    // Save to cookie
    this.saveTheme(themeId);
    this.currentTheme = themeId;

    // Dispatch theme change event for Matrix rain and other effects
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme: themeId }
    }));

    // Remove transition class after animation
    if (animated) {
      setTimeout(() => {
        html.removeAttribute('data-theme-transitioning');
      }, 500);
    }

    // Update selector UI if exists
    this.updateSelectorUI();

    console.log(`[ThemeManager] Applied theme: ${themeId}`);
  }

  /**
   * Load theme CSS file dynamically
   */
  loadThemeCSS(themeId) {
    // Remove existing theme link
    const existingLink = document.getElementById('theme-css');
    if (existingLink) {
      existingLink.remove();
    }

    // Create new theme link
    const link = document.createElement('link');
    link.id = 'theme-css';
    link.rel = 'stylesheet';
    link.href = `/assets/css/themes/${themeId}.css`;
    document.head.appendChild(link);
  }

  /**
   * Render theme selector dropdown
   */
  renderThemeSelector() {
    // Find breadcrumb or create container
    const breadcrumb = document.querySelector('.breadcrumb') ||
                       document.querySelector('nav') ||
                       document.body;

    // Create theme selector container
    const container = document.createElement('div');
    container.className = 'theme-selector-container';
    container.style.cssText = `
      position: relative;
      display: inline-flex;
      margin-left: auto;
    `;

    // Create toggle button
    const button = document.createElement('button');
    button.className = 'theme-selector-toggle btn btn-ghost btn-sm';
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M8 1v2M8 13v2M3.5 3.5l1.4 1.4M11.1 11.1l1.4 1.4M1 8h2M13 8h2M3.5 12.5l1.4-1.4M11.1 4.9l1.4-1.4"/>
      </svg>
      <span>Themes</span>
    `;
    button.style.cssText = `
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    `;

    // Create dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'theme-selector-dropdown';
    dropdown.style.cssText = `
      position: fixed !important;
      min-width: 280px;
      max-height: 400px;
      overflow-y: auto;
      background: var(--color-bg-overlay);
      backdrop-filter: blur(12px);
      border: 1px solid var(--color-border-base);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl), 0 0 0 1px rgba(0,0,0,0.1);
      padding: 0.5rem;
      z-index: 999999 !important;
      display: none;
      animation: slideDown var(--duration-base) var(--ease-smooth);
    `;

    // Render theme options
    this.themes.forEach(theme => {
      const option = document.createElement('div');
      option.className = 'theme-option';
      option.dataset.themeId = theme.id;
      option.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        border-radius: var(--radius-lg);
        cursor: pointer;
        transition: all var(--duration-fast) var(--ease-smooth);
      `;

      // Icon
      const icon = document.createElement('span');
      icon.textContent = theme.icon;
      icon.style.cssText = 'font-size: 1.5rem;';

      // Content
      const content = document.createElement('div');
      content.style.cssText = 'flex: 1;';
      content.innerHTML = `
        <div style="font-weight: 500; color: var(--color-text-primary); margin-bottom: 0.25rem;">
          ${theme.name}
        </div>
        <div style="font-size: 0.75rem; color: var(--color-text-tertiary);">
          ${theme.description}
        </div>
      `;

      // Color preview
      const colors = document.createElement('div');
      colors.style.cssText = 'display: flex; gap: 0.25rem;';
      theme.colors.forEach(color => {
        const dot = document.createElement('div');
        dot.style.cssText = `
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${color};
        `;
        colors.appendChild(dot);
      });

      // Active indicator
      if (theme.id === this.currentTheme) {
        const check = document.createElement('svg');
        check.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M16.7 5.3l-8.5 8.5-4.2-4.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `;
        check.style.cssText = 'color: var(--color-primary); flex-shrink: 0;';
        option.appendChild(check);
        option.style.background = 'var(--color-bg-elevated)';
      }

      option.appendChild(icon);
      option.appendChild(content);
      option.appendChild(colors);

      // Hover effect
      option.addEventListener('mouseenter', () => {
        if (theme.id !== this.currentTheme) {
          option.style.background = 'var(--color-bg-elevated)';
        }
      });
      option.addEventListener('mouseleave', () => {
        if (theme.id !== this.currentTheme) {
          option.style.background = 'transparent';
        }
      });

      // Click handler
      option.addEventListener('click', () => {
        this.applyTheme(theme.id);
        dropdown.style.display = 'none';
      });

      dropdown.appendChild(option);
    });

    // Toggle dropdown
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.style.display === 'block';

      // Close all other dropdowns
      document.querySelectorAll('.theme-selector-dropdown').forEach(dd => {
        if (dd !== dropdown) dd.style.display = 'none';
      });

      if (!isOpen) {
        // Position dropdown below button, aligned to the right edge
        const rect = button.getBoundingClientRect();
        const dropdownWidth = 280; // min-width from CSS

        // Position below button
        dropdown.style.top = `${rect.bottom + 8}px`;

        // Align right edge of dropdown with right edge of button
        const rightPosition = window.innerWidth - rect.right;
        dropdown.style.right = `${rightPosition}px`;
        dropdown.style.left = 'auto';

        dropdown.style.display = 'block';
      } else {
        dropdown.style.display = 'none';
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });

    container.appendChild(button);

    // Insert button into breadcrumb
    if (breadcrumb.classList.contains('breadcrumb')) {
      breadcrumb.appendChild(container);
    } else {
      breadcrumb.insertBefore(container, breadcrumb.firstChild);
    }

    // Add dropdown directly to body for proper stacking
    document.body.appendChild(dropdown);
  }

  /**
   * Update selector UI after theme change
   */
  updateSelectorUI() {
    const options = document.querySelectorAll('.theme-option');
    options.forEach(option => {
      const themeId = option.dataset.themeId;
      const check = option.querySelector('svg');

      if (themeId === this.currentTheme) {
        if (!check) {
          const checkmark = document.createElement('div');
          checkmark.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M16.7 5.3l-8.5 8.5-4.2-4.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          `;
          checkmark.style.cssText = 'color: var(--color-primary); flex-shrink: 0;';
          option.appendChild(checkmark.firstElementChild);
        }
        option.style.background = 'var(--color-bg-elevated)';
      } else {
        if (check) {
          check.remove();
        }
        option.style.background = 'transparent';
      }
    });
  }

  /**
   * Render background effect selector
   */
  renderEffectSelector() {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (!breadcrumb) return;

    // Check if backgroundEffects is loaded
    if (!window.backgroundEffects) {
      console.warn('[ThemeManager] Background effects not loaded yet, retrying...');
      setTimeout(() => this.renderEffectSelector(), 100);
      return;
    }

    // Effect definitions with icons
    const effectDefinitions = [
      { id: 'none', icon: '⭕', name: 'None', description: 'No animation' },
      { id: 'matrix-rain', icon: '💻', name: 'Matrix Rain', description: 'Falling digital characters' },
      { id: 'particles', icon: '✨', name: 'Particles', description: 'Connected floating dots' },
      { id: 'gradient', icon: '🌈', name: 'Animated Gradient', description: 'Shifting color waves' },
      { id: 'waves', icon: '🌊', name: 'Waves', description: 'Flowing wave animation' },
      { id: 'shapes', icon: '🫧', name: 'Floating Shapes', description: 'Drifting bubbles' },
      { id: 'stars', icon: '⭐', name: 'Starfield', description: '3D space stars' }
    ];

    // Create container
    const container = document.createElement('div');
    container.className = 'theme-selector-container';
    container.style.cssText = `
      position: relative;
      display: inline-flex;
      margin-left: var(--space-2);
    `;

    // Create button
    const button = document.createElement('button');
    button.className = 'theme-selector-toggle btn btn-ghost btn-sm';
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"></path>
      </svg>
      <span>Effects</span>
    `;
    button.style.cssText = `
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    `;

    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'theme-selector-dropdown effect-selector-dropdown';
    dropdown.style.cssText = `
      position: fixed !important;
      min-width: 280px;
      max-height: 400px;
      overflow-y: auto;
      background: var(--color-bg-overlay);
      backdrop-filter: blur(12px);
      border: 1px solid var(--color-border-base);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl), 0 0 0 1px rgba(0,0,0,0.1);
      padding: 0.5rem;
      z-index: 999999 !important;
      display: none;
      animation: slideDown var(--duration-base) var(--ease-smooth);
    `;

    const currentTheme = this.currentTheme;
    const currentEffect = window.backgroundEffects.getSavedEffect(currentTheme) || 'none';

    // Render all effect options
    effectDefinitions.forEach(effect => {
      const option = document.createElement('div');
      option.className = 'theme-option effect-option';
      option.dataset.effectId = effect.id;
      option.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        border-radius: var(--radius-lg);
        cursor: pointer;
        transition: all var(--duration-fast) var(--ease-smooth);
      `;

      // Icon
      const icon = document.createElement('span');
      icon.textContent = effect.icon;
      icon.style.cssText = 'font-size: 1.5rem;';

      // Content
      const content = document.createElement('div');
      content.style.cssText = 'flex: 1;';
      content.innerHTML = `
        <div style="font-weight: 500; color: var(--color-text-primary); margin-bottom: 0.25rem;">
          ${effect.name}
        </div>
        <div style="font-size: 0.75rem; color: var(--color-text-tertiary);">
          ${effect.description}
        </div>
      `;

      // Active indicator
      if (effect.id === currentEffect) {
        const check = document.createElement('svg');
        check.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M16.7 5.3l-8.5 8.5-4.2-4.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `;
        check.style.cssText = 'color: var(--color-primary); flex-shrink: 0;';
        option.appendChild(check);
        option.style.background = 'var(--color-bg-elevated)';
      }

      option.appendChild(icon);
      option.appendChild(content);

      // Hover effect
      option.addEventListener('mouseenter', () => {
        if (effect.id !== currentEffect) {
          option.style.background = 'var(--color-bg-elevated)';
        }
      });
      option.addEventListener('mouseleave', () => {
        if (effect.id !== currentEffect) {
          option.style.background = 'transparent';
        }
      });

      // Click handler
      option.addEventListener('click', () => {
        window.backgroundEffects.saveEffect(currentTheme, effect.id);
        window.backgroundEffects.loadEffect(currentTheme, effect.id);
        dropdown.style.display = 'none';

        // Show toast
        if (window.toast) {
          window.toast.success(`Effect: ${effect.name}`);
        }

        // Re-render to update checkmarks
        setTimeout(() => {
          container.remove();
          this.renderEffectSelector();
        }, 100);
      });

      dropdown.appendChild(option);
    });

    // Toggle dropdown
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.style.display === 'block';

      // Close all other dropdowns
      document.querySelectorAll('.theme-selector-dropdown').forEach(dd => {
        if (dd !== dropdown) dd.style.display = 'none';
      });

      if (!isOpen) {
        const rect = button.getBoundingClientRect();
        dropdown.style.top = `${rect.bottom + 8}px`;
        const rightPosition = window.innerWidth - rect.right;
        dropdown.style.right = `${rightPosition}px`;
        dropdown.style.left = 'auto';
        dropdown.style.display = 'block';
      } else {
        dropdown.style.display = 'none';
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });

    container.appendChild(button);
    breadcrumb.appendChild(container);

    // Add dropdown directly to body for proper stacking
    document.body.appendChild(dropdown);
  }

  /**
   * Setup keyboard shortcut (Cmd/Ctrl + Shift + T)
   */
  setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      // Use Cmd+Shift+T (Mac) or Ctrl+Shift+T (Windows) to avoid conflict
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        const toggle = document.querySelector('.theme-selector-toggle');
        if (toggle) {
          toggle.click();
        }
      }

      // Escape to close dropdown
      if (e.key === 'Escape') {
        const dropdown = document.querySelector('.theme-selector-dropdown');
        if (dropdown) {
          dropdown.style.display = 'none';
        }
      }
    });
  }

  /**
   * Get current theme info
   */
  getCurrentTheme() {
    return this.themes.find(t => t.id === this.currentTheme);
  }

  /**
   * Cycle to next theme (for fun!)
   */
  nextTheme() {
    const currentIndex = this.themes.findIndex(t => t.id === this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    this.applyTheme(this.themes[nextIndex].id);
  }
}

// Initialize theme manager on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
    window.themeManager.init();
  });
} else {
  window.themeManager = new ThemeManager();
  window.themeManager.init();
}
