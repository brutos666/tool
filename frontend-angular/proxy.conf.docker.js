// proxy.conf.js
const target = process.env.BACKEND_URL;

export default {
  '/api': {
    target,
    secure: false,
    changeOrigin: true,
  },
};