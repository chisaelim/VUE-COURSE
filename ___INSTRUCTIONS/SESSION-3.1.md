# Setting Up Password Change in a Vue 3 Project

This session connects the Profile page password form to the backend API, centralizes Sanctum token injection with an Axios interceptor, and updates the auth API helper so protected requests can be made consistently across the app.

---

## Step 1 - Edit: src/main.js

Move token handling into a global Axios request interceptor, then simplify route-token verification to call `apiVerify()` without manually passing a token.

**Full file (copyable):**

```js
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'admin-lte/dist/js/adminlte.min.js';


import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { useUserStore } from '@/stores/user';
import { apiVerify } from '@/functions/api/auth';
import { createPinia } from 'pinia'
import axios from 'axios';

const pinia = createPinia();

createApp(App).use(router).use(pinia).mount('#app');

const userStore = useUserStore();

axios.interceptors.request.use((config) => {
    const token = userStore.getSanctumToken();
    if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

router.beforeEach(async (to, from) => {
    const { guarded } = to.meta;
    if (guarded === undefined) { // if the route is not guarded, we don't need to verify the token
        return;
    }

    try {
        const response = await apiVerify();
        const { data } = response;
        userStore.setState(data.user);
    } catch (error) {
        userStore.reset();
    }

    if (guarded && !userStore.isAuthenticated) { // if the route is guarded and the user is not authenticated, redirect to signin page
        return { name: 'SignIn' };
    }
    if (!guarded && userStore.isAuthenticated) { // if the route is not guarded and the user is authenticated, redirect to dashboard page
        return { name: 'Dashboard' };
    }
});
```

**Key points:**
- `axios.interceptors.request.use(...)` runs before every request and is the single place where the Sanctum token is attached.
- `userStore.getSanctumToken()` provides the current token from Pinia without repeating retrieval logic in each API function.
- `if (token && !config.headers.Authorization)` prevents overriding an explicitly provided Authorization header.
- `apiVerify()` is now called without parameters because authentication is handled automatically by the interceptor.

---

## Step 2 - Edit: src/functions/api/auth.js

Refactor `apiVerify` to rely on interceptor-based authentication and add a dedicated API function for password change.

**Full file (copyable):**

```js
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
```

**Key points:**
- `apiVerify()` no longer accepts `token` because Authorization is now globally injected.
- `apiChangePassword(...)` wraps the backend endpoint `PUT /change/password` into a reusable function.
- Passing `{ current_password, new_password, new_password_confirmation }` as an object maps directly to expected Laravel-style validation field names.

---

## Step 3 - Edit: src/components/auth/Profile.vue

Implement submit logic for the password form: show loading state, call the API, clear form/errors on success, redirect to SignIn, and display validation/server errors with modal feedback.

**Full file (copyable):**

```vue
<template>
    <div class="content-wrapper" style="min-height: 1416px">
        <!-- Content Header (Page header) -->
        <section class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1>Profile</h1>
                    </div>
                    <div class="col-sm-6">
                        <ol class="breadcrumb float-sm-right">
                            <li class="breadcrumb-item">
                                <router-link :to="{ name: 'Dashboard' }">Home</router-link>
                            </li>
                            <li class="breadcrumb-item active">Profile</li>
                        </ol>
                    </div>
                </div>
            </div>
            <!-- /.container-fluid -->
        </section>

        <!-- Main content -->
        <section class="content">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-md-4">
                        <!-- Profile Image -->
                        <div class="card card-primary card-outline">
                            <div class="card-body box-profile">
                                <div class="text-center">
                                    <img class="profile-user-img img-fluid img-circle" :src="emptyImage"
                                        alt="User profile picture" />
                                </div>

                                <h3 class="profile-username text-center">{{ userStore.name }}</h3>

                                <p class="text-muted text-center">{{ userStore.email }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-header p-2">
                                <ul class="nav nav-pills">
                                    <li class="nav-item">
                                        <a class="nav-link active" href="#password_settings" data-toggle="tab">Password
                                            Settings</a>
                                    </li>
                                </ul>
                            </div>
                            <div class="card-body">
                                <div class="tab-content">
                                    <div class="active tab-pane" id="password_settings">
                                        <form @submit.prevent="savePassword" class="form-horizontal">
                                            <div class="form-group row">
                                                <label class="col-sm-3 col-form-label">Current Password</label>
                                                <div class="col-sm-9">
                                                    <input v-model="user.current_password" type="password"
                                                        class="form-control" placeholder="Current Password"
                                                        :class="{ 'is-invalid': !!userError.current_password }" />
                                                    <div class="invalid-feedback">
                                                        {{ userError.current_password }}
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="form-group row">
                                                <label class="col-sm-3 col-form-label">New Password</label>
                                                <div class="col-sm-9">
                                                    <input v-model="user.new_password" type="password"
                                                        class="form-control" placeholder="New Password"
                                                        :class="{ 'is-invalid': !!userError.new_password }" />
                                                    <div class="invalid-feedback">
                                                        {{ userError.new_password }}
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="form-group row">
                                                <label class="col-sm-3 col-form-label">Confirm Password</label>
                                                <div class="col-sm-9">
                                                    <input v-model="user.new_password_confirmation" type="password"
                                                        class="form-control" placeholder="Confirm Password" />
                                                </div>
                                            </div>

                                            <div class="form-group row">
                                                <div class="offset-sm-2 col-sm-10">
                                                    <button type="reset" class="mx-3 btn btn-danger">Cancel</button>
                                                    <button type="submit" class="mx-3 btn btn-outline-primary">
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                    <!-- /.tab-pane -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>


<script setup>
import emptyImage from "@/assets/images/emptyImage.png";
import { reactive } from "vue";
import { useUserStore } from '@/stores/user';
import { CloseModal, LoadingModal, MessageModal } from "@/functions/swal";
import { useRouter } from "vue-router";
import {
    apiChangePassword,
} from "@/functions/api/auth";

const userStore = useUserStore();
const router = useRouter();

const user = reactive({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
});

const userError = reactive({
    current_password: "",
    new_password: "",
});


const defaultUser = JSON.parse(JSON.stringify(user));
const defaultUserError = JSON.parse(JSON.stringify(userError));

function resetAllState() {
    Object.assign(user, defaultUser);
    Object.assign(userError, defaultUserError);
}

async function savePassword() {
    try {
        LoadingModal('Saving password...');
        const response = await apiChangePassword(
            user.current_password,
            user.new_password,
            user.new_password_confirmation
        );
        resetAllState();
        await MessageModal({ icon: "success", title: "Success", text: response.data.message, }, () => router.push({ name: "SignIn" }));
    } catch (error) {
        const { response } = error;
        if (!response) {
            return MessageModal({ icon: "error", title: "Error", text: error.message });
        }
        const { status, data } = response;
        if (status === 422) {
            Object.keys(userError).forEach((key) => {
                userError[key] = data.errors[key]
                    ? data.errors[key][0]
                    : "";
            });
            return CloseModal();
        }
        return MessageModal({ icon: "error", title: "Error", text: data.message });
    }
}

</script>
```

**Key points:**
- `LoadingModal('Saving password...')` provides immediate submit feedback while the request is in progress.
- `apiChangePassword(...)` sends the three form fields to the backend in one request.
- `resetAllState()` clears both form values and previous validation messages after success.
- `MessageModal(..., () => router.push({ name: 'SignIn' }))` confirms success, then redirects to SignIn so the user can authenticate with the new password.
- `status === 422` maps backend field validation errors to `userError` for inline display on matching inputs.
- `CloseModal()` closes loading feedback when the issue is a field-level validation error and the user should stay on the form.

---

## Result

After this setup:
- All protected API requests can automatically receive the Sanctum Bearer token via Axios interceptor.
- Route verification stays cleaner because `apiVerify()` no longer needs manual token passing.
- The Profile page password form now performs a complete real submit flow with loading/success/error UX and inline validation feedback.
