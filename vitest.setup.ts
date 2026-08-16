// This file can contain global setup for Vitest
// For example, importing @testing-library/jest-dom for React testing
// import '@testing-library/jest-dom'

// Provide dummy values for T3 Env validation
process.env.DATABASE_URL = "postgresql://user:password@localhost/repodeck";
process.env.AUTH_SECRET = "test-auth-secret-that-is-at-least-32-characters";
process.env.GITHUB_APP_CLIENT_ID = "test-client-id";
process.env.GITHUB_APP_CLIENT_SECRET = "test-client-secret";
process.env.GITHUB_APP_SLUG = "repodeck-test";
process.env.GITHUB_APP_CALLBACK_URL =
  "http://localhost:3000/api/auth/github/callback";
process.env.GITHUB_APP_INSTALL_CALLBACK_URL =
  "http://localhost:3000/api/github/install/callback";
process.env.GITHUB_TOKEN_ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
