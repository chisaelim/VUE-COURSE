# Setting Up a Tests Management Page in a Vue 3 Project

This session adds a complete Tests listing page to the application. You'll create an API module with CRUD functions, build a Tests page component with a data table, integrate it into the router with proper guards, and add a navigation link to the sidebar. The page fetches and displays test records from the backend with columns for metadata and action buttons.

---

## Step 1 - Create New: src/functions/api/test.js

Create a new API helper module that provides six functions for Test CRUD operations.

**Full file (copyable):**

```js
import axios from 'axios';

const APP_API_URL = import.meta.env.VITE_APP_API_URL;

export function apiGetTests() {
  return axios.get(`${APP_API_URL}/tests`);
}
export function apiGetTestsWithDetails() {
  return axios.get(`${APP_API_URL}/tests/details`);
}
export function apiCreateTest(data) {
  return axios.post(`${APP_API_URL}/tests/create`, data);
}
export function apiReadTest(id) {
  return axios.get(`${APP_API_URL}/tests/read/${id}`);
}
export function apiUpdateTest(data) {
  return axios.put(`${APP_API_URL}/tests/update`, data);
}
export function apiDeleteTest(id) {
  return axios.delete(`${APP_API_URL}/tests/delete/${id}`);
}
```

**Key points:**
- `apiGetTestsWithDetails()` is the main function used in the page — it returns test records with related user details (creator/updater).
- `apiGetTests()` is a simpler variant if you only need basic test data.
- Each function follows RESTful conventions: `GET` for read, `POST` for create, `PUT` for update, `DELETE` for delete.
- The Bearer token (set up in Session 3.1) is automatically added by the Axios interceptor.

---

## Step 2 - Create New: src/components/pages/Test.vue

Create the Tests page component with a data table, lifecycle hooks, and error handling.

**Full file (copyable):**

```vue
<template>
  <div class="content-wrapper">
    <div class="content-header">
      <div class="container-fluid">
        <div class="row mb-2">
          <div class="col-sm-6">
            <h1 class="m-0">Tests</h1>
          </div>
          <div class="col-sm-6">
            <ol class="breadcrumb float-sm-right">
              <li class="breadcrumb-item"><router-link :to="{ name: 'Dashboard' }">Dashboard</router-link>
              </li>
              <li class="breadcrumb-item active">Tests</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="container-fluid">
        <div class="row">
          <div class="col-12">
            <table class="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Name (Khmer)</th>
                  <th>Name (English)</th>
                  <th>Short Name</th>
                  <th>Created By</th>
                  <th>Updated By</th>
                  <th>Actions <button class="btn btn-sm btn-primary">Add</button></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="test in tests" :key="test.id">
                  <td>{{ test.name_kh }}</td>
                  <td>{{ test.name_en }}</td>
                  <td>{{ test.short_name }}</td>
                  <td>{{ test.creator.name }}<br>{{ test.created_at }}</td>
                  <td>{{ test.updater.name }}<br>{{ test.updated_at }}</td>
                  <td>
                    <button class="mx-1 btn btn-sm btn-info">View</button>
                    <button class="mx-1 btn btn-sm btn-danger">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { apiGetTestsWithDetails } from '@/functions/api/test';
import { CloseModal, LoadingModal, MessageModal } from "@/functions/swal";

const tests = ref([]);

onMounted(async () => {
  try {
    LoadingModal();
    await generateTests();
    return CloseModal();
  } catch (error) {
    return MessageModal({ icon: "error", title: "Error", text: error.response?.data?.message || error.message });
  }
});

async function generateTests() {
  const response = await apiGetTestsWithDetails();
  tests.value = response.data.tests;
}
</script>
```

**Key points:**
- `<script setup>` is the Composition API shorthand syntax introduced in Vue 3.3.
- `onMounted()` lifecycle hook runs when the component mounts — this is where data is fetched from the API.
- `LoadingModal()` shows a loading spinner; `CloseModal()` dismisses it; `MessageModal()` displays errors.
- `v-for="test in tests"` iterates over the reactive `tests` array and renders one table row per test record.
- `{{ test.creator.name }}` accesses nested data from the related user record.
- The **Add**, **View**, and **Delete** buttons are placeholders — their actions are not yet implemented.

---

## Step 3 - Edit: src/router.js

Add the Tests page route with proper layout components and authentication guard.

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

import Test from '@/components/pages/Test.vue';

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
    {
        path: '/tests',
        name: 'Tests',
        components: {
            navbar: Navbar,
            sidebar: Sidebar,
            footer: Footer,
            default: Test,
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
- `import Test from '@/components/pages/Test.vue'` — add this import near the top with other page components.
- The route object uses `components` (plural), not `component` — this allows multiple named slots to be filled at once.
- `navbar`, `sidebar`, `footer`, and `default` are named router-view slots defined in the App.vue layout.
- `meta: { guarded: true }` marks this route as requiring authentication — the router guard (set up in Session 3.0) will redirect unauthenticated users to SignIn.
- The route name is `'Tests'` — this is used in the sidebar link `router-link :to="{ name: 'Tests' }"`.

---

## Step 4 - Edit: src/components/includes/Sidebar.vue

Add a Tests navigation link to the sidebar menu under a new "Academic Management" section.

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

                    <li class="nav-header">
                        Academic Management
                    </li>
                    <li class="nav-item">
                        <router-link :to="{ name: 'Tests' }" active-class="active" class="nav-link">
                            <i class="nav-icon fas fa-vial"></i>
                            <p>Tests</p>
                        </router-link>
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
- `<li class="nav-header">` creates a section header in the menu.
- `router-link :to="{ name: 'Tests' }"` navigates to the Tests route by name — Vue Router matches it to the route path `/tests`.
- `active-class="active"` automatically adds the CSS class `active` when the current route is `Tests`.
- `<i class="nav-icon fas fa-vial"></i>` displays a Font Awesome test tube icon.

---

## Result

After completing these four steps, you will have:

1. ✓ An API module (`test.js`) ready to call all test endpoints.
2. ✓ A Tests page component that displays test records in a data table on page load.
3. ✓ A new route at `/tests` with authentication guard and layout components.
4. ✓ A "Tests" link in the sidebar that navigates to the page and highlights when active.

The Tests page will fetch and display all tests with their creator and updater information. Error handling is in place — if the API call fails, a SweetAlert error modal will display the backend error message.
