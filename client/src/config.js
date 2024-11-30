const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://cs5610-web-app.vercel.app/api'
  : 'http://localhost:3001';

export { API_URL };