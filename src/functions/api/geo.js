import axios from 'axios';

const APP_API_URL = import.meta.env.VITE_APP_API_URL;

export function apiGetProvinces() {
  return axios.get(`${APP_API_URL}/provinces`);
}
export function apiGetDistrictsByProvince(id) {
  return axios.get(`${APP_API_URL}/districts/by/province/${id}`);
}
export function apiGetCommunesByDistrict(id) {
  return axios.get(`${APP_API_URL}/communes/by/district/${id}`);
}
export function apiGetVillagesByCommune(id) {
  return axios.get(`${APP_API_URL}/villages/by/commune/${id}`);
}
