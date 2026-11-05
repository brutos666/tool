// proxy.conf.js
const target = `http://localhost:8080`;

export default {
  '/api': {
    target,
    secure: false,
    changeOrigin: true,
  },
};