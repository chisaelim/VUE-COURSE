# Setting Up ApexCharts for Dashboard Visualizations

In this session, we will add ApexCharts to display comprehensive dashboard statistics with multiple chart types. We'll install the vue3-apexcharts package, register it as a global component, create an API function to fetch dashboard data, and redesign the Dashboard component with area charts, donut/pie charts, stacked bar charts, and more. This setup enables the dashboard to visualize student registrations over time, test status distribution, test popularity by subject, and student demographics (gender, religion, nationality, ethnicity).

---

### Step 1 - Run Command: Install vue3-apexcharts Package

First, install the vue3-apexcharts package as a project dependency.

```bash
npm i vue3-apexcharts
```

**Key points:**
- `vue3-apexcharts` is the Vue 3 wrapper for the ApexCharts library
- ApexCharts is installed automatically as a peer dependency
- The package is now added to `package.json` dependencies
- Both `vue3-apexcharts` and `apexcharts` are available in `node_modules/`
- This package provides interactive, responsive charts for Vue 3 applications

---

### Step 2 - Create New: Dashboard API Function

Create a module that provides an API function to fetch dashboard statistics from the backend. This function will be called when the dashboard component mounts.

**File:** `src/functions/api/dashboard.js`

```javascript
import axios from 'axios';

const APP_API_URL = import.meta.env.VITE_APP_API_URL;

export function apiGetDashboardStats() {
  return axios.get(`${APP_API_URL}/dashboard/stats`);
}
```

**Key points:**
- `import axios from 'axios'`: Imports the HTTP client for making API requests
- `const APP_API_URL = import.meta.env.VITE_APP_API_URL`: Gets the base API URL from environment variables
- `export function apiGetDashboardStats()`: Exports a named function that components can import and call
- `axios.get(...)`: Makes a GET request to the `/dashboard/stats` endpoint on the backend
- Returns a Promise that resolves to the API response containing dashboard statistics
- The function is reusable across components that need dashboard data

---

### Step 3 - Edit: Register VueApexChart Component Globally

Register the VueApexChart component as a global component in the application entry point so it can be used in any template without importing it.

**File:** `src/main.js`

```javascript
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'admin-lte/dist/js/adminlte.min.js';
import '@/functions/pdfmake.js'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { useUserStore } from '@/stores/user';
import { apiVerify } from '@/functions/api/auth';
import { createPinia } from 'pinia'
import axios from 'axios';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import VueMultiSelect from 'vue-multiselect';
import VueApexChart from 'vue3-apexcharts';

const pinia = createPinia();

const app = createApp(App);
app.use(router);
app.use(pinia);
app.component('VueDatePicker', VueDatePicker);
app.component('VueMultiSelect', VueMultiSelect);
app.component('VueApexChart', VueApexChart);
app.mount('#app');

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
- `import VueApexChart from 'vue3-apexcharts'`: Imports the VueApexChart component
- `app.component('VueApexChart', VueApexChart)`: Registers it as a global component with the name `VueApexChart`
- Global registration makes the component available in all templates without individual imports
- The component is now usable as `<VueApexChart ... />` in any Vue template
- This follows the same pattern as `VueDatePicker` and `VueMultiSelect` registration

---

### Step 4 - Edit: Redesign Dashboard with ApexCharts

Redesign the Dashboard component to display comprehensive statistics through multiple chart visualizations. The new dashboard includes stat cards at the top and six different chart types below them.

**File:** `src/components/pages/Dashboard.vue`

```vue
<template>
    <div class="content-wrapper" style="min-height: 1175px;">
        <div class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1 class="m-0">Dashboard</h1>
                    </div>
                </div>
            </div>
        </div>

        <div class="content">
            <div class="container-fluid">

                <!-- Stat cards -->
                <div class="row">
                    <div class="col-lg-3 col-6">
                        <div class="small-box bg-info">
                            <div class="inner">
                                <h3>{{ totals.students }}</h3>
                                <p>Total Students</p>
                            </div>
                            <div class="icon"><i class="fa fa-users"></i></div>
                            <router-link :to="{ name: 'Students' }" class="small-box-footer">
                                View Details <i class="fa fa-arrow-circle-right"></i>
                            </router-link>
                        </div>
                    </div>

                    <div class="col-lg-3 col-6">
                        <div class="small-box bg-success">
                            <div class="inner">
                                <h3>{{ totals.tests }}</h3>
                                <p>Total Tests</p>
                            </div>
                            <div class="icon"><i class="fa fa-graduation-cap"></i></div>
                            <router-link :to="{ name: 'Tests' }" class="small-box-footer">
                                View Details <i class="fa fa-arrow-circle-right"></i>
                            </router-link>
                        </div>
                    </div>

                    <div class="col-lg-3 col-6">
                        <div class="small-box bg-warning">
                            <div class="inner">
                                <h3>{{ totals.student_tests }}</h3>
                                <p>Total Student Tests</p>
                            </div>
                            <div class="icon"><i class="fa fa-clipboard-check"></i></div>
                            <router-link :to="{ name: 'StudentTests' }" class="small-box-footer">
                                View Details <i class="fa fa-arrow-circle-right"></i>
                            </router-link>
                        </div>
                    </div>

                    <div class="col-lg-3 col-6">
                        <div class="small-box bg-danger">
                            <div class="inner">
                                <h3>{{ totals.new_students_this_month }}</h3>
                                <p>New Students This Month</p>
                            </div>
                            <div class="icon"><i class="fa fa-user-plus"></i></div>
                            <router-link :to="{ name: 'Students' }" class="small-box-footer">
                                View Details <i class="fa fa-arrow-circle-right"></i>
                            </router-link>
                        </div>
                    </div>
                </div>

                <!-- Row: registrations over time + status overall -->
                <div class="row">
                    <div class="col-lg-8">
                        <div class="card card-outline card-primary">
                            <div class="card-header">
                                <h3 class="card-title">Student Registrations in the Last 12 Months</h3>
                            </div>
                            <div class="card-body">
                                <VueApexChart type="area" height="320" :options="registrationsOptions"
                                    :series="registrationsSeries" />
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-4">
                        <div class="card card-outline card-warning">
                            <div class="card-header">
                                <h3 class="card-title">Overall Test Status</h3>
                            </div>
                            <div class="card-body">
                                <VueApexChart type="donut" height="320" :options="statusOptions"
                                    :series="statusSeries" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Row: tests popularity (pass/fail/pending stacked) -->
                <div class="row">
                    <div class="col-lg-12">
                        <div class="card card-outline card-primary">
                            <div class="card-header">
                                <h3 class="card-title">Test Popularity by Subject</h3>
                            </div>
                            <div class="card-body">
                                <VueApexChart type="bar" height="340" :options="testsOptions" :series="testsSeries" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Row: gender + religion -->
                <div class="row">
                    <div class="col-lg-6">
                        <div class="card card-outline card-info">
                            <div class="card-header">
                                <h3 class="card-title">Students by Gender</h3>
                            </div>
                            <div class="card-body">
                                <VueApexChart type="pie" height="320" :options="genderOptions" :series="genderSeries" />
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-6">
                        <div class="card card-outline card-success">
                            <div class="card-header">
                                <h3 class="card-title">Students by Religion</h3>
                            </div>
                            <div class="card-body">
                                <VueApexChart type="donut" height="320" :options="religionOptions"
                                    :series="religionSeries" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Row: nationality + ethnicity -->
                <div class="row">
                    <div class="col-lg-6">
                        <div class="card card-outline card-secondary">
                            <div class="card-header">
                                <h3 class="card-title">Students by Nationality (Top 10)</h3>
                            </div>
                            <div class="card-body">
                                <VueApexChart type="bar" height="320" :options="nationalityOptions"
                                    :series="nationalitySeries" />
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-6">
                        <div class="card card-outline card-danger">
                            <div class="card-header">
                                <h3 class="card-title">Students by Ethnicity (Top 10)</h3>
                            </div>
                            <div class="card-body">
                                <VueApexChart type="bar" height="320" :options="ethnicityOptions"
                                    :series="ethnicitySeries" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { apiGetDashboardStats } from "@/functions/api/dashboard";
import { LoadingModal, CloseModal, MessageModal } from "@/functions/swal";
import { ref, computed, onMounted } from "vue";

const stats = ref({
    totals: { students: 0, tests: 0, student_tests: 0, student_tests_today: 0, new_students_this_month: 0 },
    registrations_by_month: [],
    status_today: { PASSED: 0, PENDING: 0, FAILED: 0 },
    status_overall: { PASSED: 0, PENDING: 0, FAILED: 0 },
    by_gender: [],
    by_religion: [],
    by_nationality: [],
    by_ethnicity: [],
    by_test: [],
});

const totals = computed(() => stats.value.totals);

// Registrations
const registrationsSeries = computed(() => [
    { name: "New Students", data: stats.value.registrations_by_month.map((b) => b.count) },
]);
const registrationsOptions = computed(() => ({
    chart: { toolbar: { show: false }, fontFamily: "inherit" },
    xaxis: { categories: stats.value.registrations_by_month.map((b) => b.label) },
    yaxis: { labels: { formatter: (v) => Math.round(v) } },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    colors: ["#007bff"],
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } },
    grid: { borderColor: "#eee" },
    tooltip: { y: { formatter: (v) => `${v} Students` } },
}));

// Status (overall)
const statusSeries = computed(() => {
    const s = stats.value.status_overall;
    return [s.PASSED, s.PENDING, s.FAILED];
});
const statusOptions = computed(() => ({
    chart: { fontFamily: "inherit" },
    labels: ["Passed", "Pending", "Failed"],
    colors: ["#28a745", "#ffc107", "#dc3545"],
    legend: { position: "bottom" },
    dataLabels: { enabled: true, formatter: (v) => `${Math.round(v)}%` },
    plotOptions: {
        pie: {
            donut: {
                labels: {
                    show: true,
                    total: { show: true, label: "Total", formatter: () => String(totals.value.student_tests) },
                },
            },
        },
    },
    noData: { text: "No data available" },
}));

// Tests popularity (stacked PASSED/PENDING/FAILED per test)
const testsSeries = computed(() => [
    { name: "Passed", data: stats.value.by_test.map((t) => t.passed) },
    { name: "Pending", data: stats.value.by_test.map((t) => t.pending) },
    { name: "Failed", data: stats.value.by_test.map((t) => t.failed) },
]);
const testsOptions = computed(() => ({
    chart: { type: "bar", stacked: true, toolbar: { show: false }, fontFamily: "inherit" },
    plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: "55%" } },
    xaxis: { categories: stats.value.by_test.map((t) => t.label) },
    dataLabels: { enabled: false },
    colors: ["#28a745", "#ffc107", "#dc3545"],
    legend: { position: "top" },
    grid: { borderColor: "#eee" },
    noData: { text: "No data available" },
}));

// Gender (pie)
const genderSeries = computed(() => stats.value.by_gender.map((r) => r.count));
const genderOptions = computed(() => ({
    chart: { fontFamily: "inherit" },
    labels: stats.value.by_gender.map((r) => r.label),
    colors: ["#17a2b8", "#e83e8c", "#6f42c1", "#fd7e14"],
    legend: { position: "bottom" },
    noData: { text: "No data available" },
}));

// Religion (donut)
const religionSeries = computed(() => stats.value.by_religion.map((r) => r.count));
const religionOptions = computed(() => ({
    chart: { fontFamily: "inherit" },
    labels: stats.value.by_religion.map((r) => r.label),
    colors: ["#28a745", "#20c997", "#17a2b8", "#6610f2", "#fd7e14", "#6c757d"],
    legend: { position: "bottom" },
    noData: { text: "No data available" },
}));

// Nationality (horizontal bar, top 10)
const nationalitySeries = computed(() => [
    { name: "Number of Students", data: stats.value.by_nationality.map((r) => r.count) },
]);
const nationalityOptions = computed(() => ({
    chart: { toolbar: { show: false }, fontFamily: "inherit" },
    xaxis: { categories: stats.value.by_nationality.map((r) => r.label) },
    plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
    dataLabels: { enabled: true },
    colors: ["#6c757d"],
    grid: { borderColor: "#eee" },
    noData: { text: "No data available" },
}));

// Ethnicity (vertical bar, top 10)
const ethnicitySeries = computed(() => [
    { name: "Number of Students", data: stats.value.by_ethnicity.map((r) => r.count) },
]);
const ethnicityOptions = computed(() => ({
    chart: { toolbar: { show: false }, fontFamily: "inherit" },
    xaxis: { categories: stats.value.by_ethnicity.map((r) => r.label) },
    plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: "55%" } },
    dataLabels: { enabled: false },
    colors: ["#dc3545"],
    grid: { borderColor: "#eee" },
    noData: { text: "No data available" },
}));

onMounted(async () => {
    try {
        LoadingModal();
        const response = await apiGetDashboardStats();
        stats.value = response.data;
        CloseModal();
    } catch (error) {
        MessageModal({
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || error.message,
        });
    }
});
</script>
```

**Key points:**
- **Stat cards (top row)**: Four colored boxes showing key metrics (Total Students, Total Tests, Total Student Tests, New Students This Month)
  - Each card is a `col-lg-3 col-6` grid column making them responsive
  - Use router-links to navigate to related detail pages
- **Registrations chart (left, 8 columns)**: Area chart showing student registration trends over the last 12 months
  - `type="area"` creates a smooth area visualization
  - Uses a blue gradient fill for visual appeal
  - X-axis shows month labels, Y-axis shows student counts
- **Status chart (right, 4 columns)**: Donut chart showing overall test status distribution (Passed/Pending/Failed)
  - `type="donut"` creates a donut/pie visualization with a center label
  - Shows total student tests in the center
  - Color-coded: Green (Passed), Yellow (Pending), Red (Failed)
- **Test Popularity (full width)**: Stacked bar chart showing pass/fail/pending for each test subject
  - `type="bar"` with `stacked: true` creates stacked columns
  - Multiple data series (Passed, Pending, Failed) stack on top of each other
  - Useful for comparing test results across subjects
- **Gender chart (left, 6 columns)**: Pie chart showing gender distribution
- **Religion chart (right, 6 columns)**: Donut chart showing religious affiliation distribution
- **Nationality chart (left, 6 columns)**: Horizontal bar chart showing top 10 nationalities
  - `horizontal: true` creates horizontal bars for better readability with long labels
- **Ethnicity chart (right, 6 columns)**: Vertical bar chart showing top 10 ethnicities
- **Reactive data binding**: All charts use `computed()` properties that reactively update when `stats.value` changes
  - `.map()` transforms raw data arrays into chart-friendly formats
- **onMounted() lifecycle**: Fetches dashboard stats from the API when component mounts
  - Shows loading modal during the request
  - Updates `stats.value` with the API response
  - Handles errors with an error message modal

---

### Result

After completing these four steps, the Dashboard component now displays a comprehensive set of visualizations:
- Four stat cards showing key metrics
- Six different chart types (area, donut, stacked bar, pie, horizontal bar, vertical bar)
- All charts are responsive and adapt to different screen sizes
- Charts are populated with real data fetched from the backend API
- Error handling with user-friendly messages
- Professional appearance using AdminLTE styling with ApexCharts visualization library
