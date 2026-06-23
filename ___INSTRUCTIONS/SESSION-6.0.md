# Building a Student Test Management Page with Date Filtering

In this session, we will create a dedicated page for managing student tests with date-based filtering. This page allows administrators to view all tests assigned to students on a specific date and perform actions like viewing, deleting, and updating test statuses. We'll integrate date picking functionality with a custom table component to display comprehensive student test information.

---

### Step 1 - Create New: API Service for Student Tests

First, we create a new API service file to handle all student test-related backend requests. This module will provide functions to fetch, create, update, delete, and manage student test statuses.

**File:** `src/functions/api/student-test.js`
```javascript
import axios from 'axios';

const APP_API_URL = import.meta.env.VITE_APP_API_URL;

export function apiGetStudentTestsByIssuedDate(date) {
  return axios.get(`${APP_API_URL}/student-tests/by/issued-date/${date}`);
}
export function apiGetStudentTestsWithDetailsByIssuedDate(date) {
  return axios.get(`${APP_API_URL}/student-tests/details/by/issued-date/${date}`);
}
export function apiCreateStudentTest(data) {
  return axios.post(`${APP_API_URL}/student-tests/create`, data);
}
export function apiReadStudentTest(id) {
  return axios.get(`${APP_API_URL}/student-tests/read/${id}`);
}
export function apiUpdateStudentTest(data) {
  return axios.put(`${APP_API_URL}/student-tests/update`, data);
}
export function apiDeleteStudentTest(id) {
  return axios.delete(`${APP_API_URL}/student-tests/delete/${id}`);
}
export function apiGetPassedStudentTestsForCertificates(passed_ids) {
  return axios.get(`${APP_API_URL}/student-tests/passed-for-certificates`, {
    params: {
      passed_ids: passed_ids
    }
  });
}

export function apiChangeStudentTestStatus(data) {
  return axios.patch(`${APP_API_URL}/student-tests/change/status`, data);
}
```

**Key points:**
- `apiGetStudentTestsWithDetailsByIssuedDate()`: The main function we'll use to fetch student tests with student and test details filtered by date.
- `apiChangeStudentTestStatus()`: Uses PATCH method to update only the status without modifying other test data.
- `apiGetPassedStudentTestsForCertificates()`: Filters tests by IDs to prepare data for certificate generation.
- All functions use `${APP_API_URL}` which is loaded from environment variables, allowing different backend URLs for development and production.

---

### Step 2 - Create New: StudentTest Component Page

Next, we create the main StudentTest page component. This component combines a date picker for filtering with a custom table that displays all student tests for the selected date.

**File:** `src/components/pages/StudentTest.vue`
```vue
<template>
  <div class="content-wrapper">
    <div class="content-header">
      <div class="container-fluid">
        <div class="row mb-2">
          <div class="col-lg-6">
            <h1 class="m-0">Student Tests</h1>
          </div>
          <div class="col-lg-6">
            <ol class="breadcrumb float-sm-right">
              <li class="breadcrumb-item">
                <router-link :to="{ name: 'Dashboard' }">Dashboard</router-link>
              </li>
              <li class="breadcrumb-item active">Student Tests</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="container-fluid">
        <div class="card text-center">
          <div class="row mx-3 mt-3">
            <div class="col-md-12">
              <div class="form-group">
                <label>Test Date</label>
                <VueDatePicker v-model="issued_date" :formats="{ input: 'dd-MM-yyyy' }" model-type="dd-MM-yyyy"
                  :time-config="{ enableTimePicker: false }" />
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <CustomTable :title="'Student Tests Table'" :data="student_tests" :columns="student_test_columns" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import emptyImage from '@/assets/images/emptyImage.png';
import moment from 'moment';
import { h, ref, reactive, onMounted, watch } from 'vue';
import { CloseModal, LoadingModal, MessageModal } from "@/functions/swal";
import CustomTable from '@/components/includes/controls/CustomTable.vue';
import { apiGetStudentTestsWithDetailsByIssuedDate } from '@/functions/api/student-test';

const issued_date = ref(moment().format('DD-MM-YYYY'));
const student_tests = ref([]);
const student_test_columns = [
  {
    accessorKey: "student.photo",
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
    accessorKey: "student.name_kh",
    header: "Name (Khmer)",
  },
  {
    accessorKey: "student.name_en",
    header: "Name (Latin)",
  },
  {
    accessorKey: "student.gender.gd_kh_full",
    header: "Gender",
  },
  {
    accessorKey: "test.name_kh",
    header: "Test Name (Khmer)",
  },
  {
    accessorKey: "test.name_en",
    header: "Test Name (English)",
  },
  {
    accessorKey: "status",
    header: "Result",
    cell: ({ row }) =>
      h(
        "a",
        {
          role: "button",
          onClick: () => { },
          class: [
            "badge " +
            ((row.original.status === "PENDING" ? "badge-warning" : "") +
              (row.original.status === "PASSED" ? "badge-success" : "") +
              (row.original.status === "FAILED" ? "badge-danger" : "")),
          ],
        },
        row.original.status
      ),
  },
  {
    accessorKey: "action",
    header: () => [
      "Actions",
      h(
        "button",
        {
          onClick: () => { },
          class: "btn btn-sm btn-success ml-3",
        },
        "Add New"
      ),
    ],
    cell: ({ row }) => [
      // delete btn
      h(
        "button",
        {
          onClick: () => { },
          class: "btn btn-sm btn-outline-danger mx-1",
        },
        h("i", { class: "fa fa-trash" })
      ),
      // view btn
      h(
        "button",
        {
          onClick: () => { },
          class: "btn btn-sm btn-secondary mx-1",
        },
        h("i", { class: "fa fa-eye" })
      ),
      row.original.status !== "PASSED"
        ? h(
          "button",
          {
            onClick: () => { },
            class: "btn btn-sm btn-success mx-1",
          },
          h("i", { class: "fa fa-check-circle" })
        )
        : null,
      row.original.status !== "FAILED"
        ? h(
          "button",
          {
            onClick: () => { },
            class: "btn btn-sm btn-danger mx-1",
          },
          h("i", { class: "fa fa-times-circle" })
        )
        : null,
    ],
    enableSorting: false,
    enableGlobalFilter: false,
  },
];

const studentTestObj = reactive({
  id: null,
  test_id: null,
  student_id: null,
  issued_date: null,
});
const studentTestErrObj = reactive({
  issued_date: null,
});

const defaultStudentTestObj = JSON.parse(JSON.stringify(studentTestObj));
const defaultStudentTestErrObj = JSON.parse(JSON.stringify(studentTestErrObj));

function resetAllState() {
  Object.assign(studentTestObj, defaultStudentTestObj);
  Object.assign(studentTestErrObj, defaultStudentTestErrObj);
}

onMounted(async () => {
  try {
    LoadingModal();
    await generateStudentTestsByIssuedDate();
    return CloseModal();
  } catch (error) {
    return MessageModal({ icon: "error", title: "Error", text: error.response?.data?.message || error.message });
  }
});
watch(issued_date, async () => {
  try {
    LoadingModal();
    await generateStudentTestsByIssuedDate();
    return CloseModal();
  } catch (error) {
    return MessageModal({ icon: "error", title: "Error", text: error.response?.data?.message || error.message });
  }
});
async function generateStudentTestsByIssuedDate() {
  const response = await apiGetStudentTestsWithDetailsByIssuedDate(issued_date.value);
  student_tests.value = response.data.student_tests;
}
</script>
```

**Key points:**
- `issued_date = ref(moment().format('DD-MM-YYYY'))`: Initializes the date picker to today's date in DD-MM-YYYY format.
- `VueDatePicker` component with `model-type="dd-MM-yyyy"` ensures the date format matches what the backend expects.
- `student_test_columns`: Defines the table structure using the TanStack Table (formerly React Table) style. Each column can have custom rendering logic.
- Status badge color: Uses Bootstrap badge classes (`badge-warning`, `badge-success`, `badge-danger`) to visually indicate test result status.
- Action buttons are conditionally rendered: Pass/Fail buttons appear only if the test status isn't already in that state.
- `watch(issued_date, ...)`: Automatically refreshes the table data whenever the user changes the date filter.
- `onMounted()`: Loads initial data when the component first appears.

---

### Step 3 - Edit: Add Route for StudentTest Page

Now we add the route configuration to make the StudentTest page accessible in the application.

**File:** `src/router.js`
```javascript
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
import StudentTest from '@/components/pages/StudentTest.vue';

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
    {
        path: '/student-tests',
        name: 'StudentTests',
        components: {
            navbar: Navbar,
            sidebar: Sidebar,
            footer: Footer,
            default: StudentTest,
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
- `import StudentTest from '@/components/pages/StudentTest.vue';`: Imports the StudentTest component at the top level (not lazy-loaded) for consistency with Test and Student pages.
- The route path is `/student-tests` following the kebab-case naming convention.
- The route name is `StudentTests` (PascalCase), which is used by `router-link` throughout the app.
- `meta: { guarded: true }`: This route requires authentication. The router guard in `main.js` will redirect unauthenticated users to the SignIn page.
- The `components` object uses named router outlets: `navbar`, `sidebar`, `footer`, and the default `StudentTest` component fills the main content area.

---

### Step 4 - Edit: Add Navigation Link in Sidebar

Finally, we add a navigation link to the StudentTest page in the sidebar menu. We also add a new "Certificate Management" section to organize test-related features.

**File:** `src/components/includes/Sidebar.vue`
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
                        Certificate Management
                    </li>
                    <li class="nav-item">
                        <router-link :to="{ name: 'StudentTests' }" active-class="active" class="nav-link">
                            <i class="nav-icon fas fa-user-graduate"></i>
                            <p>Student Tests</p>
                        </router-link>
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
- New nav section: `<li class="nav-header">Certificate Management</li>` creates a visual grouping in the sidebar menu.
- `:to="{ name: 'StudentTests' }"`: Uses the route name defined in `router.js` to navigate to the StudentTest page.
- `active-class="active"`: The `active` class is automatically applied when the current route matches this link, highlighting it in the sidebar.
- Icon: `fas fa-user-graduate` represents the student/certificate concept with a graduation cap icon.

---

### Result

After completing these steps, you now have a fully functional Student Test Management page with the following features:

1. **Date-based filtering**: Users can select any date to view tests issued on that date.
2. **Comprehensive student test data**: The table displays student photos, names (Khmer and Latin), gender, test details, and result status.
3. **Status-based visual feedback**: Test results are color-coded (yellow for pending, green for passed, red for failed).
4. **Action buttons**: Ready for implementing delete, view, and status update functionality.
5. **Integrated sidebar navigation**: A new menu link makes the page easily accessible to administrators.
6. **Modular API service**: All backend communications go through a centralized API service file, making future changes easier.

The page automatically loads tests for today's date on mount, and any date change automatically triggers a fresh data load with loading/error feedback to the user.
