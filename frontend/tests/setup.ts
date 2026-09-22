import '@testing-library/jest-dom/vitest';

// Ensure VITE_API_URL is configured in test environment
if (!import.meta.env.VITE_API_URL) {
  import.meta.env.VITE_API_URL = 'http://localhost:5000/api';
}
