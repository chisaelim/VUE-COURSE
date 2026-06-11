# Setting Up Pinia Auth State and Route Guards in a Vue 3 Project

This guide walks through adding a Pinia-based user store, plugging it into app startup, protecting routes with navigation guards, and wiring a complete sign-out flow from the navbar to backend logout.

---

## Step 1 - Run Command: Install Pinia

Install Pinia so the app can keep authenticated user state and token utilities in a centralized store.

**Command:**

```bash
npm i pinia
```

**Key points:**
- `pinia` is required before creating and using `defineStore(...)`.
- The route guard and auth pages rely on store getters/actions introduced in the next steps.

---

## Step 2 - Create New: `src/stores/user.js`

Create a dedicated user store to manage profile state, auth helpers, and Sanctum token persistence.

**Full file (copyable):**

```js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user',
  {
    state: () => ({
      id: null,
      name: null,
      email: null,
      profile_image: null,
      profile_thumbnail: null,
      password_null: true,
      level: null,
    }),
    getters: {
      isAuthenticated: (state) => !!state.id,
      isAdministrator: (state) => state.level === '_ADMINISTRATOR_',
      isDocumentController: (state) => state.level === '_DOCUMENT_CONTROLLER_',
    },
    actions: {
      // User state management
      setState(user) {
        this.id = user.id;
        this.name = user.name;
        this.email = user.email;
        this.profile_image = user.profile_image;
        this.profile_thumbnail = user.profile_thumbnail;
        this.password_null = user.password_null;
        this.level = user.level;
      },
      resetState() {
        this.id = null;
        this.name = null;
        this.email = null;
        this.profile_image = null;
        this.profile_thumbnail = null;
        this.password_null = true;
        this.level = null;
      },

      // User Sanctum Token management
      setSanctumToken(token) {
        localStorage.setItem('SANCTUM-TOKEN', token);
      },
      getSanctumToken() {
        return localStorage.getItem('SANCTUM-TOKEN');
      },
      removeSanctumToken() {
        localStorage.removeItem('SANCTUM-TOKEN');
      },

      // Reset user state and remove Sanctum token (e.g., on sign out)
      reset() {
        this.resetState();
        this.removeSanctumToken();
      },
    },
  }
);
```

**Key points:**
- `isAuthenticated` is derived from `id`, so route checks stay simple.
- `setState(...)` and `resetState()` control user profile fields consistently.
- Token helpers wrap `localStorage` so auth components do not manipulate storage directly.
- `reset()` clears both user data and token in one call.

---

## Step 3 - Edit: `src/main.js`

Register Pinia on app startup, then add a global route guard that verifies tokens and redirects based on route auth metadata.

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

const pinia = createPinia();

createApp(App).use(router).use(pinia).mount('#app');

const userStore = useUserStore();
router.beforeEach(async (to, from) => {
    const { guarded } = to.meta;
    if (guarded === undefined) { // if the route is not guarded, we don't need to verify the token
        return;
    }

    try {
        const token = userStore.getSanctumToken();
        const response = await apiVerify(token);
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
- `createPinia()` must be attached with `.use(pinia)` before store usage.
- `router.beforeEach(...)` reads `to.meta.guarded` to decide whether auth checks are needed.
- `apiVerify(token)` refreshes authenticated user state on guarded/non-guarded auth routes.
- Failed verification triggers `userStore.reset()` to clear stale sessions.
- Guard redirects prevent guests from entering protected pages and prevent authenticated users from returning to auth pages.

---

## Step 4 - Edit: `src/components/auth/SignIn.vue`

Connect successful sign-in responses to the user store so auth state and token are persisted immediately after login.

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

import { useUserStore } from "@/stores/user";
const userStore = useUserStore();

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

        userStore.setState(data.user);
        userStore.setSanctumToken(data.token);

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
- `useUserStore()` enables SignIn to write global auth state.
- `userStore.setState(data.user)` stores profile data returned by the backend.
- `userStore.setSanctumToken(data.token)` persists the auth token for later verification.
- Existing modal/error logic stays intact while adding persistent auth behavior.

---

## Step 5 - Create New: `src/components/auth/SignOut.vue`

Create a dedicated sign-out route component that calls the API, clears local auth state, and redirects to SignIn.

**Full file (copyable):**

```vue
<template></template>
<script setup>
import { apiSignOut } from "@/functions/api/auth";
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
const router = useRouter();
const userStore = useUserStore();

onMounted(async () => {
  const token = userStore.getSanctumToken();
  apiSignOut(token); // no need to await since we will remove the token regardless of the response
  userStore.reset();
  router.replace({ name: "SignIn" });
});
</script>
```

**Key points:**
- `onMounted(...)` makes sign-out run immediately when the route is entered.
- `apiSignOut(token)` notifies the backend about session logout.
- `userStore.reset()` guarantees local user state and token are removed.
- `router.replace({ name: "SignIn" })` returns the user to the login page.

---

## Step 6 - Edit: `src/components/includes/Navbar.vue`

Add a sign-out icon in the navbar and confirmation dialog before routing users to the sign-out route.

**Full file (copyable):**

```vue
<template>
    <nav class="main-header navbar navbar-expand navbar-white navbar-light">
        <!-- Left navbar links -->
        <ul class="navbar-nav">
            <li class="nav-item">
                <a class="nav-link" data-widget="pushmenu" href="#" role="button"><i class="fas fa-bars"></i></a>
            </li>
        </ul>

        <!-- Right navbar links -->
        <ul class="navbar-nav ml-auto">
            <li class="nav-item">
                <a class="nav-link" data-widget="fullscreen" href="#" role="button">
                    <i class="fas fa-expand-arrows-alt"></i>
                </a>
            </li>

            <li class="nav-item">
                <a @click="signOut" class="nav-link" role="button">
                    <i class="fas fa-sign-out-alt text-danger"></i>
                </a>
            </li>
        </ul>
    </nav>
</template>

<script setup>
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
const router = useRouter();

async function signOut() {
    await Swal.fire({
        title: 'Are you sure?',
        text: "You will be signed out from the system!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, sign me out!'
    }).then((result) => {
        if (result.isConfirmed) {
            return router.push({ name: 'SignOut' });
        }
    });
}
</script>
```

**Key points:**
- The new sign-out icon triggers `signOut()` from the UI.
- SweetAlert confirmation reduces accidental sign-outs.
- On confirmation, routing to `SignOut` centralizes logout behavior in one component.

---

## Step 7 - Edit: `src/router.js`

Register the sign-out route and add auth guard metadata to sign-in, sign-up, and dashboard routes.

**Full file (copyable):**

```js
import SignIn from '@/components/auth/SignIn.vue';
import SignUp from '@/components/auth/SignUp.vue';
import SignOut from '@/components/auth/SignOut.vue';
import Dashboard from '@/components/pages/Dashboard.vue';

import Navbar from '@/components/includes/Navbar.vue';
import Sidebar from '@/components/includes/Sidebar.vue';
import Footer from '@/components/includes/Footer.vue';


import { createRouter, createWebHistory } from 'vue-router';
const routes = [
    {
        path: '/',
        name: 'SignIn',
        component: SignIn,
        meta: { guarded: false },
    },
    {
        path: '/signup',
        name: 'SignUp',
        component: SignUp,
        meta: { guarded: false },
    },
    {
        path: '/signout',
        name: 'SignOut',
        component: SignOut,
        // This route has no guarded meta because it use for both authenticated and unauthenticated users.
        // The authentication state will be handled in the SignOut component.
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        components: {
            navbar: Navbar,
            sidebar: Sidebar,
            footer: Footer,
            default: Dashboard,
        },
        meta: { guarded: true },
    },
    { path: '/:pathMatch(.*)*', redirect: { name: 'SignIn' } },
];

const router = createRouter({
    history: createWebHistory(),
    routes: routes,
});

export default router;
```

**Key points:**
- `SignOut` route acts as an action route that executes logout logic on entry.
- `meta.guarded: false` marks guest-facing auth pages.
- `meta.guarded: true` marks protected routes like dashboard.
- Global guards in `main.js` can now enforce access consistently using route metadata.

---

## Result

The app now has centralized auth state in Pinia, token verification on navigation, route-level access control, and a full logout pipeline from navbar confirmation to backend sign-out and local state reset.
