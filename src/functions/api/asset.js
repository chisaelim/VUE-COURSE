import axios from 'axios';

const APP_API_URL = import.meta.env.VITE_APP_API_URL;

export function apiGetAllGenders() {
  return axios.get(`${APP_API_URL}/assets/all/genders`);
}
export function apiGetAllEthnicities() {
  return axios.get(`${APP_API_URL}/assets/all/ethnicities`);
}
export function apiGetAllNationalities() {
  return axios.get(`${APP_API_URL}/assets/all/nationalities`);
}
export function apiGetAllReligions() {
  return axios.get(`${APP_API_URL}/assets/all/religions`);
}
