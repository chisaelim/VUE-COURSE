# Creating a Students Listing Page in Vue 3

This session creates a new Students management page following the same patterns as the Tests page. You'll create an API module for student CRUD operations, build a Students page component with photo display, set up column configuration with image rendering, add the route to the router, and add a navigation link to the sidebar. The Students page showcases how to extend existing patterns to new features.

---

## Step 1 - Create New: src/functions/api/student.js

Create the API helper module with six CRUD functions for student operations.

**Full file (copyable):**

```js
import axios from 'axios';

const APP_API_URL = import.meta.env.VITE_APP_API_URL;

export function apiGetStudents() {
  return axios.get(`${APP_API_URL}/students`);
}
export function apiGetStudentsWithDetails() {
  return axios.get(`${APP_API_URL}/students/details`);
}
export function apiCreateStudent(data) {
  return axios.post(`${APP_API_URL}/students/create`, data);
}
export function apiReadStudent(id) {
  return axios.get(`${APP_API_URL}/students/read/${id}`);
}
export function apiUpdateStudent(data) {
  return axios.put(`${APP_API_URL}/students/update`, data);
}
export function apiDeleteStudent(id) {
  return axios.delete(`${APP_API_URL}/students/delete/${id}`);
}
```

**Key points:**
- Same six-function pattern as `test.js` — familiar API structure for consistency.
- `apiGetStudentsWithDetails()` — returns student records with related data (gender, creator/updater).
- Each function follows RESTful conventions (GET, POST, PUT, DELETE).
- Axios interceptor automatically adds Bearer token (set up in Session 3.1).

---

## Step 2 - Create New: src/components/pages/Student.vue

Create the Students page component with column configuration, CustomTable integration, and data fetching.

**Full file (copyable):**

```vue
<template>
  <div class="content-wrapper">
    <div class="content-header">
      <div class="container-fluid">
        <div class="row mb-2">
          <div class="col-sm-6">
            <h1 class="m-0">Students</h1>
          </div>
          <div class="col-sm-6">
            <ol class="breadcrumb float-sm-right">
              <li class="breadcrumb-item">
                <router-link :to="{ name: 'Dashboard' }">Dashboard</router-link>
              </li>
              <li class="breadcrumb-item active">Students</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="container-fluid">
        <div class="row">
          <div class="col-12">
            <CustomTable :title="'Student List'" :data="students" :columns="columns" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { h, ref, onMounted } from 'vue';
import { apiGetStudentsWithDetails } from '@/functions/api/student';
import { CloseModal, LoadingModal, MessageModal } from "@/functions/swal";
import CustomTable from '@/components/includes/controls/CustomTable.vue';
import emptyImage from '@/assets/images/emptyImage.png';

const students = ref([]);
const columns = [
  {
    accessorKey: "photo",
    header: "",
    cell: (cell) =>
      h("img", {
        style: "max-width: 50px",
        class: "profile-user-img img-fluid img-circle",
        src:
          cell.getValue() || emptyImage,
      }),
  },
  {
    accessorKey: 'name_kh',
    header: 'Name (Khmer)',
  },
  {
    accessorKey: 'name_en',
    header: 'Name (Latin)',
  },
  {
    accessorKey: 'gender.gd_kh_full',
    header: 'Gender',
  },
  {
    accessorKey: 'phone',
    header: 'Phone Number',
  },
  {
    accessorFn: ({ creator, created_at }) => creator.name + created_at,
    header: 'Created By',
    cell: ({ row }) => [
      h('div', row.original.created_at),
      h('div', row.original.creator.name)
    ],
  },
  {
    accessorFn: ({ updater, updated_at }) => updater.name + updated_at,
    header: 'Updated By',
    cell: ({ row }) => [
      h('div', row.original.updated_at),
      h('div', row.original.updater.name)
    ],
  },
  {
    accessorKey: 'action',
    header: () => [
      'Actions',
      h('button',
        {
          onClick: () => { },
          class: 'btn btn-sm btn-success ml-3'
        },
        'Register New'
      )
    ],
    cell: ({
      row
    }) => [
        // delete btn
        h('button',
          {
            onClick: () => { },
            class: 'btn btn-sm btn-outline-danger mx-1'
          },
          h('i', { class: 'fa fa-trash' })
        ),
        // view btn
        h('button',
          {
            onClick: () => { },
            class: 'btn btn-sm btn-secondary mx-1'
          },
          h('i', { class: 'fa fa-eye' })
        ),
      ],
    enableSorting: false,
    enableGlobalFilter: false,
  }
];


onMounted(async () => {
  try {
    LoadingModal();
    await generateStudents();
    return CloseModal();
  } catch (error) {
    return MessageModal({ icon: "error", title: "Error", text: error.response?.data?.message || error.message });
  }
});

async function generateStudents() {
  const response = await apiGetStudentsWithDetails();
  students.value = response.data.students;
}
</script>
```

**Key points:**
- `import CustomTable` — reusable table component from Session 4.3.
- `import emptyImage` — fallback image when student has no photo.
- `students` ref — reactive array for student data.
- **Photo column**: `accessorKey: "photo"` → renders image with `h('img')`.
  - `cell.getValue()` — gets the photo URL from the row.
  - `|| emptyImage` — if photo is null/empty, use default image.
  - `img-circle` class — Bootstrap class for circular avatar.
- **Nested accessor**: `accessorKey: 'gender.gd_kh_full'` — dot notation accesses nested data.
  - Student has `{ gender: { gd_kh_full: "ស្រី" } }` and TanStack reads the nested value.
- **Column structure** — mirrors Test.vue but with student-specific fields (Name Latin, Gender, Phone).
- **Empty action handlers** — `onClick: () => { }` — placeholders for future CRUD implementation.
- `onMounted()` — fetch students on page load with loading modal and error handling.
- `generateStudents()` — API call to fetch students with all related data.

---

## Step 3 - Edit: Add Student Route to src/router.js

Add the Student page import and route configuration with guards and layout components.

**Full router.js (copyable):**

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
import Student from '@/components/pages/Student.vue';

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
    {
        path: '/students',
        name: 'Students',
        components: {
            navbar: Navbar,
            sidebar: Sidebar,
            footer: Footer,
            default: Student,
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
- `import Student from '@/components/pages/Student.vue'` — import the new page component.
- Route path is `/students` (public URL).
- Route name is `'Students'` (used by router-link).
- Uses named layout slots (navbar, sidebar, footer, default) — same pattern as Tests.
- `meta: { guarded: true }` — authentication required (checked by router guard from Session 3.0).

---

## Step 4 - Edit: Add Students Navigation Link to Sidebar

Add a navigation link for Students in the sidebar under "Academic Management" section, before Tests.

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
                        <router-link :to="{ name: 'Students' }" active-class="active" class="nav-link">
                            <i class="nav-icon fas fa-users"></i>
                            <p>Students</p>
                        </router-link>
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
- `router-link :to="{ name: 'Students' }"` — navigate by route name (resolves to `/students`).
- `active-class="active"` — Bootstrap class automatically applied when route is active.
- `fas fa-user-graduate` — Font Awesome icon for students (graduation cap).
- Placed before Tests link in the menu hierarchy.

---

## Result

After completing these four steps, you will have:

1. ✓ An API module (`student.js`) with six CRUD functions for student endpoints.
2. ✓ A Students page component (`Student.vue`) with:
   - Column configuration showcasing image rendering (photo column).
   - Nested data accessor for gender information.
   - CustomTable integration for sorting, filtering, and pagination.
   - Data fetching on mount with loading and error handling.
3. ✓ A new route at `/students` with authentication guard and layout components.
4. ✓ A "Students" navigation link in the sidebar under "Academic Management".
5. ✓ Consistent page structure matching the Tests page pattern.

The Students page is now fully integrated and functional. It demonstrates how to reuse patterns across multiple features: same component structure, same API conventions, same table integration, and same navigation pattern. This consistency makes the codebase easier to maintain and extend.
