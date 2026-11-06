// proxy.conf.js
const target = `http://localhost:8090`;

export default {
  '/api': {
    target,
    secure: false,
    changeOrigin: true,
  },
};