# Setting Up Axios-Based Auth API Calls in a Vue 3 Project

This guide shows how the auth flow was upgraded from simulated requests to real Axios-powered API calls. It also covers the environment variable used for the backend base URL and the shared helper file that keeps request logic in one place.

---

## Step 1 - Run Command: Install Axios

Install the HTTP client used by the new auth API helpers.

**Command:**

```bash
npm i axios
```

**Key points:**
- `axios` sends the login, registration, verify, and sign-out requests to the backend.
- Installing it first makes the imports in `src/functions/api/auth.js` resolve correctly.

---

## Step 2 - Create New: `.env`

Create the environment variable that stores the API base URL used by the auth helpers.

**Full file (copyable):**

```env
VITE_APP_API_URL=https://testcertificate-api.ultralink.cloud/api
```

**Key points:**
- `VITE_APP_API_URL` keeps the backend URL out of component code.
- Vite exposes this value at runtime through `import.meta.env`.
- All auth requests can reuse the same base URL instead of hardcoding it in every function.

---

## Step 3 - Create New: `src/functions/api/auth.js`

Create a small API layer that wraps the auth endpoints so the Vue components can call simple functions instead of repeating Axios setup.

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
export async function apiVerify(token) {
    return await axios.get(APP_API_URL + '/verify', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}
```

**Key points:**
- `APP_API_URL` reads the backend base URL from the `.env` file.
- `apiSignUp(user)` and `apiSignIn(user)` send the form payloads to their matching endpoints.
- `apiSignOut(token)` sends an authenticated `POST` request with a bearer token.
- `apiVerify(token)` checks the current token with an authenticated `GET` request.
- Returning the Axios promise directly keeps the component code focused on UI flow and response handling.

---

## Step 4 - Edit: `src/components/auth/SignIn.vue`

Update the sign-in page so it calls the API helper, handles validation and server errors, and redirects to the dashboard on success.

**Full file (copyable):**

```vue
<template>
    <div class="login-page">
        <div class="login-box">
            <div class="card card-outline card-primary">
                <div class="card-header text-center">
                    <RouterLink to="/" class="h1"><b>Admin</b>LTE</RouterLink>
                </div>
                <div class="card-body">
                    <p class="login-box-msg">Sign in to start your session</p>
                    <form @submit.prevent="signIn">
                        <div class="input-group mb-3">
                            <input type="email" v-model="user.email" class="form-control" placeholder="Email"
                                :class="{ 'is-invalid': !!userError.email }" />
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <span class="fas fa-envelope"></span>
                                </div>
                            </div>
                            <div class="invalid-feedback">
                                {{ userError.email }}
                            </div>
                        </div>
                        <div class="input-group mb-3">
                            <input type="password" v-model="user.password" class="form-control" placeholder="Password"
                                autocomplete :class="{ 'is-invalid': !!userError.password }" />
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <span class="fas fa-lock"></span>
                                </div>
                            </div>
                            <div class="invalid-feedback">
                                {{ userError.password }}
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-8"></div>
                            <div class="col-4">
                                <button type="submit" class="btn btn-primary btn-block">Sign In</button>
                            </div>
                        </div>
                    </form>
                    <p class="mb-0">
                        <RouterLink :to="{ name: 'SignUp' }" class="text-center">Register a new
                            membership</RouterLink>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { reactive } from "vue";
import { apiSignIn } from "@/functions/api/auth";
import { LoadingModal, MessageModal, CloseModal } from "@/functions/swal";

// Uncomment the following lines if you have a user store set up
// import { useUserStore } from "@/stores/user";
// const userStore = useUserStore();

const router = useRouter();

const user = reactive({
    email: "",
    password: "",
});

const userError = reactive({
    email: "",
    password: "",
});

const defaultUser = JSON.parse(JSON.stringify(user));
const defaultUserError = JSON.parse(JSON.stringify(userError));

function resetAllState() {
    Object.assign(user, defaultUser);
    Object.assign(userError, defaultUserError);
}

async function signIn() {
    try {
        LoadingModal('Signing In...');
        const response = await apiSignIn(user);
        const { data } = response;

        // Uncomment the following lines if you have a user store set up
        // userStore.setState(data.user);
        // userStore.setSanctumToken(data.token);

        resetAllState();
        router.replace({ name: "Dashboard" });
        return CloseModal();
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
- `apiSignIn(user)` sends the email and password to the backend instead of simulating a request.
- `LoadingModal('Signing In...')` gives immediate feedback while the request is in flight.
- `resetAllState()` clears the form and validation state after a successful login.
- `router.replace({ name: "Dashboard" })` moves the user into the app after authentication.
- `status === 422` handles backend validation errors by mapping each field message into `userError`.
- `CloseModal()` dismisses the loading state after validation failures or success.
- `MessageModal(...)` shows unexpected network or server errors in a user-visible way.

---

## Step 5 - Edit: `src/components/auth/SignUp.vue`

Update the sign-up page so it posts to the API, handles validation errors, and shows a success message before redirecting to sign-in.

**Full file (copyable):**

```vue
<template>
    <div class="login-page">
        <div class="login-box">
            <div class="card card-outline card-primary">
                <div class="card-header text-center">
                    <RouterLink to="/" class="h1"><b>Admin</b>LTE</RouterLink>
                </div>
                <div class="card-body">
                    <p class="login-box-msg">Sign up for a new membership</p>
                    <form @submit.prevent="signUp">
                        <div class="input-group mb-3">
                            <input type="text" v-model="user.name" class="form-control" placeholder="Name"
                                :class="{ 'is-invalid': !!userError.name }" />
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <span class="fas fa-user"></span>
                                </div>
                            </div>
                            <div class="invalid-feedback">
                                {{ userError.name }}
                            </div>
                        </div>
                        <div class="input-group mb-3">
                            <input type="email" v-model="user.email" class="form-control" placeholder="Email"
                                :class="{ 'is-invalid': !!userError.email }" />
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <span class="fas fa-envelope"></span>
                                </div>
                            </div>
                            <div class="invalid-feedback">
                                {{ userError.email }}
                            </div>
                        </div>
                        <div class="input-group mb-3">
                            <input type="password" v-model="user.password" class="form-control" placeholder="Password"
                                autocomplete :class="{ 'is-invalid': !!userError.password }" />
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <span class="fas fa-lock"></span>
                                </div>
                            </div>
                            <div class="invalid-feedback">
                                {{ userError.password }}
                            </div>
                        </div>
                        <div class="input-group mb-3">
                            <input type="password" v-model="user.password_confirmation" class="form-control"
                                placeholder="Confirm Password" autocomplete />
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <span class="fas fa-lock"></span>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-8"></div>
                            <div class="col-4">
                                <button type="submit" class="btn btn-primary btn-block">Sign up</button>
                            </div>
                        </div>
                    </form>
                    <p class="mb-1">
                        <RouterLink :to="{ name: 'SignIn' }" class="text-center">I already have an
                            account</RouterLink>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { reactive } from "vue";
import { apiSignUp } from "@/functions/api/auth";
import { LoadingModal, MessageModal, CloseModal } from "@/functions/swal";
const router = useRouter();

const user = reactive({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
});

const userError = reactive({
    name: "",
    email: "",
    password: "",
});

const defaultUser = JSON.parse(JSON.stringify(user));
const defaultUserError = JSON.parse(JSON.stringify(userError));

function resetAllState() {
    Object.assign(user, defaultUser);
    Object.assign(userError, defaultUserError);
}

async function signUp() {
    try {
        LoadingModal('Signing Up...');
        const response = await apiSignUp(user);
        const { data } = response;

        resetAllState();
        return MessageModal({
            icon: "success",
            title: "Success",
            text: data.message,
        },
            () => {
                router.replace({ name: "SignIn" });
            });
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
- `apiSignUp(user)` sends the registration form to the backend.
- `LoadingModal('Signing Up...')` keeps the user aware that the request is processing.
- `resetAllState()` clears the form before the success message and redirect.
- `MessageModal({ icon: "success", ... }, callback)` shows the success message and then runs the redirect callback.
- `router.replace({ name: "SignIn" })` sends the user back to the login page after registration.
- `status === 422` maps validation messages into `userError` so each field can show its own feedback.
- `CloseModal()` closes the loading popup after validation failures.

---

## Result

The auth flow now uses a shared Axios helper layer, a project-level API base URL, and real request handling in both sign-in and sign-up. Users get loading feedback, field-level validation errors, and the correct redirect after each successful action.
