import axios from 'axios';

const APP_API_URL = import.meta.env.VITE_APP_API_URL;

export function apiGetDashboardStats() {
  return axios.get(`${APP_API_URL}/dashboard/stats`);
}
