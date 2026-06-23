import axios from 'axios';

const APP_API_URL = import.meta.env.VITE_APP_API_URL;

export function apiGetStudentTestsByIssuedDate(date) {
  return axios.get(`${APP_API_URL}/student-tests/by/issued-date/${date}`);
}
export function apiGetStudentTestsWithDetailsByIssuedDate(date) {
  return axios.get(`${APP_API_URL}/student-tests/details/by/issued-date/${date}`);
}
export function apiCreateStudentTest(data) {
  return axios.post(`${APP_API_URL}/student-tests/create`, data);
}
export function apiReadStudentTest(id) {
  return axios.get(`${APP_API_URL}/student-tests/read/${id}`);
}
export function apiUpdateStudentTest(data) {
  return axios.put(`${APP_API_URL}/student-tests/update`, data);
}
export function apiDeleteStudentTest(id) {
  return axios.delete(`${APP_API_URL}/student-tests/delete/${id}`);
}
export function apiGetPassedStudentTestsForCertificates(passed_ids) {
  return axios.get(`${APP_API_URL}/student-tests/passed-for-certificates`, {
    params: {
      passed_ids: passed_ids
    }
  });
}

export function apiChangeStudentTestStatus(data) {
  return axios.patch(`${APP_API_URL}/student-tests/change/status`, data);
}
