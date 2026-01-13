import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['src/**/*.integration.test.ts'],
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'test-jwt-secret-key-with-at-least-32-characters-long',
      JWT_REFRESH_SECRET: 'test-jwt-refresh-secret-key-with-at-least-32-characters-long',
      JWT_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
      DATABASE_URL: 'mysql://root:password@localhost:3306/photo_album_test',
      S3_ENDPOINT: 'http://localhost:9000',
      S3_ACCESS_KEY: 'minioadmin',
      S3_SECRET_KEY: 'minioadmin',
      S3_BUCKET: 'photo-albums-test',
      S3_REGION: 'us-east-1',
      S3_USE_PATH_STYLE: 'true',
      SMTP_HOST: 'smtp.mailtrap.io',
      SMTP_PORT: '587',
      SMTP_USER: 'test-user',
      SMTP_PASS: 'test-password',
      SMTP_FROM: 'test@photoalbum.com',
      FRONTEND_URL: 'http://localhost:5173',
      GOOGLE_CLIENT_ID: 'test-google-client-id',
      GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
      GOOGLE_CALLBACK_URL: 'http://localhost:3001/api/auth/google/callback',
      GITHUB_CLIENT_ID: 'test-github-client-id',
      GITHUB_CLIENT_SECRET: 'test-github-client-secret',
      GITHUB_CALLBACK_URL: 'http://localhost:3001/api/auth/github/callback'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'dist', '**/*.test.ts', '**/*.d.ts']
    }
  }
})
