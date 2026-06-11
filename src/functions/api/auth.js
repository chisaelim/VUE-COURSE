import axios from 'axios';

const APP_API_URL = import.meta.env.VITE_APP_API_URL;

export async function apiSignUp(user) {
    return await axios.post(APP_API_URL + '/signup', user);
}
export async function apiSignIn(user) {
    return await axios.post(APP_API_URL + '/signin', user);
}
export async function apiSignOut(token) {
    return await axios.post(APP_API_URL + '/signout', null, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}
export async function apiVerify() {
    return await axios.get(APP_API_URL + '/verify');
}
export async function apiChangePassword(current_password, new_password, new_password_confirmation) {
    return await axios.put(APP_API_URL + '/change/password', { current_password, new_password, new_password_confirmation });
}
export async function apiUpdateProfileImage(image) {
    const formData = new FormData();
    formData.append('profile_image', image);
    formData.append('_method', 'PUT');
    return await axios.post(APP_API_URL + '/update/profile-image', formData);
}
export async function apiDeleteProfileImage() {
    return await axios.delete(APP_API_URL + '/delete/profile-image');
}
