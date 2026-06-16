import axios from 'axios';

const APP_API_URL = import.meta.env.VITE_APP_API_URL;

export function apiGetTests() {
  return axios.get(`${APP_API_URL}/tests`);
}
export function apiGetTestsWithDetails() {
  return axios.get(`${APP_API_URL}/tests/details`);
}
export function apiCreateTest(data) {
  return axios.post(`${APP_API_URL}/tests/create`, data);
}
export function apiReadTest(id) {
  return axios.get(`${APP_API_URL}/tests/read/${id}`);
}
export function apiUpdateTest(data) {
  return axios.put(`${APP_API_URL}/tests/update`, data);
}
export function apiDeleteTest(id) {
  return axios.delete(`${APP_API_URL}/tests/delete/${id}`);
}
