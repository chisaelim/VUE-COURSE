# Setting Up SweetAlert2 Auth Feedback in a Vue 3 Project

This guide walks through adding SweetAlert2-based loading and message modals to your auth flow, then wiring those helpers into the sign-in and sign-up pages for cleaner user feedback and redirects.

---

## Step 1 - Run Command: Install SweetAlert2

Install the modal library used by the new auth helper functions.

**Command:**

```bash
npm i sweetalert2
```

**Key points:**
- `sweetalert2` provides promise-based popup APIs used for loading, success, and error states.
- Installing it first ensures imports from `sweetalert2` resolve when creating helper functions.

---

## Step 2 - Create New: `src/functions/swal.js`

Create a reusable modal utility layer so auth components can call consistent helpers instead of repeating popup configuration.

**Full file (copyable):**

```js
import Swal from 'sweetalert2';

export const LoadingModal = (text = 'Loading...') => {
  return Swal.fire({
    text: text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    preConfirm: () => false,
    width: '200px',
  }).then(Swal.showLoading());
}
export const MessageModal = async (options, callback) => {
  return await Swal.fire({
    ...options,
    showConfirmButton: false,
  }).then(async () => {
    if (typeof callback === "function") {
      return await callback();
    }
  })
}
export const CloseModal = () => {
  return Swal.close();
}
```

**Key points:**
- `LoadingModal(text)` opens a blocking loading popup and starts the spinner.
- `allowOutsideClick: false` and `allowEscapeKey: false` prevent users from dismissing loading state mid-request.
- `MessageModal(options, callback)` accepts flexible SweetAlert options and can run a callback after the modal completes.
- `showConfirmButton: false` keeps message popups auto-managed by your flow instead of waiting for manual confirmation.
- `CloseModal()` closes any currently open SweetAlert instance.

---

## Step 3 - Edit: `src/components/auth/SignIn.vue`

Integrate router + modal helpers into sign-in so users see loading feedback, then redirect to the dashboard after a successful simulated request.

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
import { LoadingModal, MessageModal, CloseModal } from "@/functions/swal";

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

        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

        resetAllState();
        router.replace({ name: "Dashboard" });
        return CloseModal();
    } catch (error) {
        const { response } = error;
        if (!response) {
            return MessageModal({ icon: "error", title: "Error", text: error.message });
        }
        //!!! Handle validation errors from the server
    }
}
</script>
```

**Key points:**
- `useRouter()` enables programmatic redirects after successful authentication.
- `LoadingModal('Signing In...')` gives immediate visual feedback while async work is in progress.
- `resetAllState()` clears form values and validation messages before leaving the page.
- `router.replace({ name: "Dashboard" })` navigates to the dashboard without keeping the auth page in history.
- `CloseModal()` explicitly dismisses the loading popup after success.
- In `catch`, `MessageModal(...)` shows network/runtime errors to the user.

---

## Step 4 - Edit: `src/components/auth/SignUp.vue`

Apply the same helper-driven flow in sign-up, then show a success message and redirect to sign-in.

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
import { LoadingModal, MessageModal } from "@/functions/swal";
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

        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

        resetAllState();
        return MessageModal({
            icon: "success",
            title: "Success",
            text: "Your account has been created successfully."
        },
            () => {
                router.replace({ name: "SignIn" });
            });
    } catch (error) {
        const { response } = error;
        if (!response) {
            return MessageModal({ icon: "error", title: "Error", text: error.message });
        }
        //!!! Handle validation errors from the server
    }
}
</script>
```

**Key points:**
- `LoadingModal('Signing Up...')` signals that registration is being processed.
- After the async simulation, form and error state are reset via `resetAllState()`.
- `MessageModal({ icon: "success", ... }, callback)` displays success, then runs navigation logic.
- The callback uses `router.replace({ name: "SignIn" })` to send users to the sign-in page.
- `MessageModal` in the `catch` block keeps unexpected errors visible to users.

---

## Result

Auth actions now provide immediate modal-based feedback: loading during async work, success messaging after sign-up, explicit error messages on failures, and automatic route transitions after successful flows.
