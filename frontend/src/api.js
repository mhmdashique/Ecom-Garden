import axios from 'axios';
// For devtunnels: set VITE_API_URL=https://qkjlrz41-5000.inc1.devtunnels.ms/api
// Fallback: if frontend is served via devtunnel, use same origin /api; else localhost
function getBaseUrl(){
  const env = import.meta.env.VITE_API_URL;
  if(env) return env;
  // auto-detect devtunnel — if page is on devtunnels.ms, use same host for api
  if(typeof window !== 'undefined' && window.location.hostname.includes('devtunnels.ms')){
    return `${window.location.protocol}//${window.location.host}/api`;
  }
  return 'http://localhost:5000/api';
}
const api = axios.create({ baseURL: getBaseUrl() });
api.interceptors.request.use(cfg=>{
  const t = localStorage.getItem('token');
  if(t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
export default api;
