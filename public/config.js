// Central API configuration for frontend fetches
// Uses window.location.hostname when running locally or behind a proxy.
// Adjust API_BASE for deployment environments as needed.
const API_BASE = (function() {
  // Highest priority: explicit runtime override
  if (window.BACKEND_URL && typeof window.BACKEND_URL === 'string') {
    return window.BACKEND_URL.replace(/\/$/, '');
  }

  // Optional: meta tag <meta name="backend-url" content="https://your-backend.example.com">
  const meta = document.querySelector('meta[name="backend-url"]');
  if (meta && meta.content) {
    return meta.content.replace(/\/$/, '');
  }

  // Optional: query parameter ?backend=https://your-backend.example.com
  try {
    const url = new URL(window.location.href);
    const qp = url.searchParams.get('backend');
    if (qp) return qp.replace(/\/$/, '');
  } catch (_) {}

  // Local development defaults
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:3001';
  }

  // Fallback: same-origin (works only if backend is reverse-proxied)
  return `${window.location.protocol}//${host}`;
})();

window.__CONFIG__ = { API_BASE };


