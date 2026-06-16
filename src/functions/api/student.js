import axios from 'axios';

const APP_API_URL = import.meta.env.VITE_APP_API_URL;

export function apiGetStudents() {
  return axios.get(`${APP_API_URL}/students`);
}
export function apiGetStudentsWithDetails() {
  return axios.get(`${APP_API_URL}/students/details`);
}
export function apiCreateStudent(data) {
  return axios.post(`${APP_API_URL}/students/create`, data);
}
export function apiReadStudent(id) {
  return axios.get(`${APP_API_URL}/students/read/${id}`);
}
export function apiUpdateStudent(data) {
  return axios.put(`${APP_API_URL}/students/update`, data);
}
export function apiDeleteStudent(id) {
  return axios.delete(`${APP_API_URL}/students/delete/${id}`);
}
