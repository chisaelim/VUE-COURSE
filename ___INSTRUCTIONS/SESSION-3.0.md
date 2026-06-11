# Setting Up a User Profile Page in a Vue 3 Project

This guide walks through creating a dedicated Profile page that displays the authenticated user's name and email, includes a password change form with inline validation feedback, wires the page to the router as a guarded named-view route, and updates the sidebar so the logged-in user's name links directly to the profile.

---

## Step 1 - Edit: `src/components/includes/Sidebar.vue`

Replace the hardcoded username placeholder with a dynamic `router-link` that shows the authenticated user's name from the Pinia store and navigates to the Profile page on click.

**Full file (copyable):**

```vue
<template>
    <aside class="main-sidebar sidebar-dark-primary elevation-4">
        <!-- Brand Logo -->
        <RouterLink to="/" class="brand-link">
            <img :src="logoImage" alt="Chat System Logo" class="brand-image img-circle elevation-3" style="opacity: .8">
            <span class="brand-text font-weight-light">Chat System</span>
        </RouterLink>

        <!-- Sidebar -->
        <div class="sidebar">
            <!-- Sidebar user panel (optional) -->
            <div class="user-panel mt-3 pb-3 mb-3 d-flex">
                <div class="image">
                    <img :src="emptyImage" class="img-circle elevation-2" alt="User Image">
                </div>
                <div class="info">
                    <router-link :to="{ name: 'Profile' }" class="d-block">{{ userStore.name }}</router-link>
                </div>
            </div>

            <!-- Sidebar Menu -->
            <nav class="mt-2">
                <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu"
                    data-accordion="false">
                    <li class="nav-item">
                        <RouterLink :to="{ name: 'Dashboard' }" active-class="active" class="nav-link">
                            <i class="nav-icon fas fa-tachometer-alt"></i>
                            <p>
                                Dashboard
                            </p>
                        </RouterLink>
                    </li>
                </ul>
            </nav>
            <!-- /.sidebar-menu -->
        </div>
        <!-- /.sidebar -->
    </aside>
</template>

<script setup>
import logoImage from '@/assets/images/logoImago.webp';
import emptyImage from '@/assets/images/emptyImage.png';
import { useUserStore } from '@/stores/user';
const userStore = useUserStore();
</script>
```

**Key points:**
- `useUserStore()` is called at the top level of `<script setup>` so it is reactive — the displayed name updates automatically when the store state changes.
- `:to="{ name: 'Profile' }"` uses the named route instead of a raw path string, so it stays correct if the path ever changes.
- `{{ userStore.name }}` replaces the previous hardcoded `"Alexander Pierce"` string — the sidebar now always reflects the currently authenticated user.

---

## Step 2 - Edit: `src/router.js`

Register the `/profile` path as a named, guarded route using the same named-view layout pattern already used by Dashboard.

**Full file (copyable):**

```js
import SignIn from '@/components/auth/SignIn.vue';
import SignUp from '@/components/auth/SignUp.vue';
import SignOut from '@/components/auth/SignOut.vue';
import Profile from '@/components/auth/Profile.vue';
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
        path: '/profile',
        name: 'Profile',
        components: {
            navbar: Navbar,
            sidebar: Sidebar,
            footer: Footer,
            default: Profile,
        },
        meta: { guarded: true },
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
- `import Profile from '@/components/auth/Profile.vue'` makes the component available to the route definition.
- The route uses `components` (plural) — not `component` — because multiple named `<router-view>` outlets (`navbar`, `sidebar`, `footer`, `default`) need to be filled simultaneously.
- `meta: { guarded: true }` tells the navigation guard (registered in `main.js`) to verify the Sanctum token before allowing access; unauthenticated users will be redirected to `SignIn`.
- The `path: '/:pathMatch(.*)*'` catch-all at the bottom is unaffected and continues to redirect unknown URLs to `SignIn`.

---

## Step 3 - Create New: `src/components/auth/Profile.vue`

Create the Profile page component. It reads the current user's name and email from the Pinia store, displays a password change form, and uses `reactive` objects for both form data and field-level error messages.

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
const userStore = useUserStore();

const user = reactive({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
});

const userError = reactive({
    current_password: "",
    new_password: "",
});

async function savePassword() {

}
</script>
```

**Key points:**
- `useUserStore()` provides `name` and `email` directly from Pinia — no local props needed.
- `reactive({...})` is used for both `user` (form input) and `userError` (validation messages) so each field is independently reactive.
- `:class="{ 'is-invalid': !!userError.current_password }"` applies Bootstrap's error style when the matching error string is non-empty; `!!` coerces the string to a boolean.
- `@submit.prevent="savePassword"` stops default form submission and delegates to the async handler.
- `savePassword` is defined as `async` and left empty — it will be filled in a later session when the API call is wired up.
- `type="reset"` on the Cancel button resets all form inputs to their initial values natively, without extra script.
- `emptyImage` is imported as a module asset so Vite resolves and fingerprints the file correctly.

---

## Result

Visiting `/profile` renders the full AdminLTE layout with the Profile page in the default outlet. The sidebar user panel shows the logged-in user's real name as a clickable link. The password form is visible and ready — the API call will be connected in a future session.
