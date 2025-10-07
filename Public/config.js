// Central API configuration for frontend fetches
// Uses window.location.hostname when running locally or behind a proxy.
// Adjust API_BASE for deployment environments as needed.
const API_BASE = (function() {
  const host = window.location.hostname;
  // If served by docker-compose nginx on port 8080, backend is at localhost:3001
  // In production, consider same-origin proxy or environment injection
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  return `${window.location.protocol}//${host}`;
})();

window.__CONFIG__ = { API_BASE };


