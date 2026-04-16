/**
 * UI Components - Toast, Modal, Loading, Counter Animations
 * Modern component managers for DynamoDB Admin
 */

/* ========================================
   TOAST MANAGER
   ======================================== */

class ToastManager {
  constructor() {
    this.container = null;
    this.toasts = [];
    this.init();
  }

  init() {
    // Create toast container
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  }

  /**
   * Show toast notification
   * @param {string} message - Toast message
   * @param {string} type - 'success', 'danger', 'warning', 'info'
   * @param {number} duration - Auto-dismiss duration in ms (0 = no auto-dismiss)
   */
  show(message, type = 'info', duration = 3000) {
    const toast = this.createToast(message, type);
    this.container.appendChild(toast);
    this.toasts.push(toast);

    // Animate in
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    }, 10);

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(toast);
      }, duration);
    }

    return toast;
  }

  createToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';

    // Icon based on type
    const icons = {
      success: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M16.7 5.3l-8.5 8.5-4.2-4.2" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
      danger: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
      warning: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6v5M10 14h.01" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
      info: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" fill="none"/><path d="M10 10v4M10 6h.01" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`
    };

    const titles = {
      success: 'Success',
      danger: 'Error',
      warning: 'Warning',
      info: 'Info'
    };

    toast.innerHTML = `
      <div class="toast-icon">${icons[type]}</div>
      <div class="toast-content">
        <div class="toast-title">${titles[type]}</div>
        <div class="toast-message">${message}</div>
      </div>
      <div class="toast-close">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
    `;

    // Close button handler
    toast.querySelector('.toast-close').addEventListener('click', () => {
      this.dismiss(toast);
    });

    return toast;
  }

  dismiss(toast) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      this.toasts = this.toasts.filter(t => t !== toast);
    }, 300);
  }

  // Shortcuts
  success(message, duration = 3000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 4000) {
    return this.show(message, 'danger', duration);
  }

  warning(message, duration = 3500) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 3000) {
    return this.show(message, 'info', duration);
  }
}

/* ========================================
   MODAL MANAGER
   ======================================== */

class ModalManager {
  constructor() {
    this.activeModal = null;
  }

  /**
   * Show confirmation modal
   * @param {Object} options - Modal configuration
   */
  confirm(options = {}) {
    const {
      title = 'Confirm Action',
      message = 'Are you sure?',
      type = 'info', // 'danger', 'success', 'info'
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      onConfirm = () => {},
      onCancel = () => {}
    } = options;

    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';

      const modal = document.createElement('div');
      modal.className = 'modal';

      const iconColors = {
        danger: 'modal-icon-danger',
        success: 'modal-icon-success',
        info: 'modal-icon-info'
      };

      const icons = {
        danger: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
        success: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
        info: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 12v4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
      };

      modal.innerHTML = `
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <div class="modal-close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        </div>
        <div class="modal-body">
          <div class="modal-icon ${iconColors[type]}">
            ${icons[type]}
          </div>
          <p style="text-align: center; margin: 0;">${message}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost modal-cancel">${cancelText}</button>
          <button class="btn btn-${type} modal-confirm">${confirmText}</button>
        </div>
      `;

      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      this.activeModal = overlay;

      // Handlers
      const closeModal = (confirmed) => {
        overlay.style.opacity = '0';
        modal.style.transform = 'scale(0.95)';

        setTimeout(() => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
          this.activeModal = null;
        }, 200);

        if (confirmed) {
          onConfirm();
          resolve(true);
        } else {
          onCancel();
          resolve(false);
        }
      };

      modal.querySelector('.modal-close').addEventListener('click', () => closeModal(false));
      modal.querySelector('.modal-cancel').addEventListener('click', () => closeModal(false));
      modal.querySelector('.modal-confirm').addEventListener('click', () => closeModal(true));

      // Close on overlay click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeModal(false);
        }
      });

      // Close on Escape
      const escapeHandler = (e) => {
        if (e.key === 'Escape') {
          closeModal(false);
          document.removeEventListener('keydown', escapeHandler);
        }
      };
      document.addEventListener('keydown', escapeHandler);

      // Focus confirm button
      setTimeout(() => {
        modal.querySelector('.modal-confirm').focus();
      }, 100);
    });
  }

  /**
   * Show alert modal (single button)
   */
  alert(options = {}) {
    const {
      title = 'Notice',
      message = '',
      type = 'info',
      buttonText = 'OK'
    } = options;

    return this.confirm({
      title,
      message,
      type,
      confirmText: buttonText,
      cancelText: '', // Hide cancel button
      onConfirm: options.onConfirm || (() => {})
    });
  }

  /**
   * Close active modal
   */
  close() {
    if (this.activeModal && this.activeModal.parentNode) {
      this.activeModal.parentNode.removeChild(this.activeModal);
      this.activeModal = null;
    }
  }
}

/* ========================================
   LOADING OVERLAY
   ======================================== */

class LoadingOverlay {
  constructor() {
    this.overlay = null;
  }

  show(text = 'Loading...') {
    if (this.overlay) {
      this.hide();
    }

    this.overlay = document.createElement('div');
    this.overlay.className = 'loading-overlay';
    this.overlay.innerHTML = `
      <div class="spinner"></div>
      <div class="loading-overlay-text">${text}</div>
    `;

    document.body.appendChild(this.overlay);
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      this.overlay.style.opacity = '1';
    }, 10);
  }

  hide() {
    if (!this.overlay) return;

    this.overlay.style.opacity = '0';

    setTimeout(() => {
      if (this.overlay && this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay);
      }
      this.overlay = null;
      document.body.style.overflow = '';
    }, 200);
  }

  updateText(text) {
    if (this.overlay) {
      const textEl = this.overlay.querySelector('.loading-overlay-text');
      if (textEl) {
        textEl.textContent = text;
      }
    }
  }
}

/* ========================================
   COUNTER ANIMATION
   ======================================== */

/**
 * Animate a number counting up
 * @param {HTMLElement} element - Element containing the number
 * @param {number} end - Target number
 * @param {number} duration - Animation duration in ms
 */
function animateCounter(element, end, duration = 1000) {
  const start = parseInt(element.textContent) || 0;
  const range = end - start;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function (ease-out)
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + range * eased);

    element.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = end.toLocaleString();
    }
  }

  requestAnimationFrame(update);
}

/* ========================================
   UTILITIES
   ======================================== */

/**
 * Create skeleton loading placeholders
 */
function createSkeleton(count = 3, type = 'card') {
  const container = document.createElement('div');

  if (type === 'card') {
    container.className = 'grid gap-6';
    container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';

    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'card';
      skeleton.innerHTML = `
        <div class="skeleton" style="height: 20px; width: 60%; margin-bottom: 1rem;"></div>
        <div class="skeleton" style="height: 16px; width: 40%; margin-bottom: 0.5rem;"></div>
        <div class="skeleton" style="height: 16px; width: 80%;"></div>
      `;
      container.appendChild(skeleton);
    }
  } else if (type === 'table') {
    container.className = 'table-container';
    const table = document.createElement('table');
    table.className = 'table';

    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th><div class="skeleton" style="height: 16px; width: 100px;"></div></th>
        <th><div class="skeleton" style="height: 16px; width: 120px;"></div></th>
        <th><div class="skeleton" style="height: 16px; width: 80px;"></div></th>
      </tr>
    `;

    const tbody = document.createElement('tbody');
    for (let i = 0; i < count; i++) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><div class="skeleton" style="height: 14px; width: 90%;"></div></td>
        <td><div class="skeleton" style="height: 14px; width: 70%;"></div></td>
        <td><div class="skeleton" style="height: 14px; width: 60%;"></div></td>
      `;
      tbody.appendChild(row);
    }

    table.appendChild(thead);
    table.appendChild(tbody);
    container.appendChild(table);
  }

  return container;
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/* ========================================
   GLOBAL INSTANCES
   ======================================== */

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initComponents);
} else {
  initComponents();
}

function initComponents() {
  window.toast = new ToastManager();
  window.modal = new ModalManager();
  window.loading = new LoadingOverlay();
  window.animateCounter = animateCounter;
  window.createSkeleton = createSkeleton;
  window.debounce = debounce;
  window.throttle = throttle;

  console.log('[Components] Initialized: Toast, Modal, Loading, Utilities');
}
