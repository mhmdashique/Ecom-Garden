import axios from 'axios';
// For devtunnels: set VITE_API_URL=https://qkjlrz41-5000.inc1.devtunnels.ms/api
// Fallback: if frontend is served via devtunnel, use same origin /api; else localhost
function getBaseUrl(){
  const env = (import.meta.env.VITE_API_URL || '').trim();
  if(env) return env;
  if(typeof window !== 'undefined' && window.location.hostname.includes('devtunnels.ms')){
    return `${window.location.protocol}//${window.location.host}/api`;
  }
  // In production on Vercel, use the configured backend URL
  // In dev, Vite proxies /api -> http://localhost:5000
  return '/api';
}
const api = axios.create({ baseURL: getBaseUrl(), timeout: 12000 });
api.defaults.headers.common['Cache-Control'] = 'no-cache';
api.defaults.headers.common['Pragma'] = 'no-cache';
api.interceptors.request.use(cfg=>{
  const t = localStorage.getItem('token');
  if(t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
export default api;
