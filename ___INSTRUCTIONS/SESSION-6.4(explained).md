# ApexCharts — Explained

In this session, we explore how ApexCharts enables interactive, responsive data visualizations in a Vue 3 dashboard. We'll examine the library's component-based architecture, reactive chart configuration patterns, data transformation with computed properties, and how different chart types (area, donut, pie, bar) serve different data visualization needs. We'll also look at how the dashboard integrates API data fetching with lifecycle hooks to populate charts dynamically.

---

## The Big Picture

ApexCharts is a charting library that creates interactive, animated visualizations from data. In Vue 3, we use the vue3-apexcharts wrapper, which exposes the `VueApexChart` component. This component accepts three main props:
- **`type`**: The chart type (area, bar, donut, pie, etc.)
- **`series`**: The data to visualize (typically an array of data values)
- **`options`**: Configuration settings (colors, labels, axes, formatting, etc.)

The dashboard pattern is: **Fetch data → Transform into series/options → Pass to VueApexChart → User sees interactive charts**.

---

## Step 1 — Install vue3-apexcharts Package

**Why it's needed:**
- The vue3-apexcharts package provides the Vue 3 integration for ApexCharts
- Without this wrapper, ApexCharts would require manual DOM manipulation, which is not idiomatic Vue
- The package includes ApexCharts as a peer dependency, so both are installed together

**How it works:**
- `npm install` reads the `package.json` file and downloads the package and its dependencies from the npm registry
- The package is added to `node_modules/` and becomes available for import
- The `package.json` is updated to record the dependency, so future installs will include it
- This is a prerequisite for all subsequent steps

**Runtime effect:**
- No runtime effect at install time; the library is only loaded when the application imports it
- Once imported and registered in `main.js`, the library becomes available throughout the application

---

## Step 2 — Create Dashboard API Function

**Why it's needed:**
- The backend stores all dashboard statistics (student counts, test results, demographics)
- The frontend needs a reusable function to fetch this data from the API endpoint
- Separating API logic into its own module follows the single-responsibility principle
- This function is imported by the Dashboard component at runtime

**How it works:**
- **`import axios from 'axios'`**: Loads the HTTP client library (already installed as a project dependency)
- **`const APP_API_URL = import.meta.env.VITE_APP_API_URL`**: Reads the backend API base URL from environment variables
  - `import.meta.env` is a Vite feature that accesses environment variables
  - `VITE_APP_API_URL` is defined in `.env` or `.env.local` (e.g., `http://localhost:8000/api`)
- **`export function apiGetDashboardStats()`**: Defines a function that other modules can import
- **`axios.get(...)`**: Makes an HTTP GET request to `/dashboard/stats` endpoint
- **Return value**: A Promise that resolves to the API response object
  - The caller can use `.then(response => ...)` or `await` to handle the response
  - Response has a `.data` property containing the actual dashboard statistics

**Data structure it expects from backend:**
```javascript
{
  totals: { students, tests, student_tests, student_tests_today, new_students_this_month },
  registrations_by_month: [ { label, count }, ... ],
  status_overall: { PASSED, PENDING, FAILED },
  by_gender: [ { label, count }, ... ],
  by_religion: [ { label, count }, ... ],
  by_nationality: [ { label, count }, ... ],
  by_ethnicity: [ { label, count }, ... ],
  by_test: [ { label, passed, pending, failed }, ... ]
}
```

---

## Step 3 — Register VueApexChart Component Globally

**Why it's needed:**
- The Dashboard component (and potentially other components) needs to use `<VueApexChart />` in templates
- If registered globally in `main.js`, the component is available everywhere without individual imports
- This follows the same pattern as other global components like `VueDatePicker` and `VueMultiSelect`

**How it works:**
- **`import VueApexChart from 'vue3-apexcharts'`**: Imports the component from the package
- **`app.component('VueApexChart', VueApexChart)`**: Registers it globally with the name `VueApexChart`
- **`app.mount('#app')`**: The mount happens after all components are registered
- **Runtime effect**: Every template in the application can now use `<VueApexChart />` without importing it

**Component signature:**
```vue
<VueApexChart 
  :type="chartType"           <!-- 'area', 'bar', 'donut', 'pie', etc. -->
  :series="seriesData"        <!-- Array of data values -->
  :options="chartOptions"     <!-- Configuration object -->
  :height="heightValue"       <!-- Chart height in pixels -->
/>
```

---

## Step 4 — Design Dashboard with ApexCharts

**Overall structure:**
The Dashboard is now organized in three tiers:
1. **Stat cards** (top): Four colored boxes with key metrics
2. **Charts** (middle/bottom): Multiple chart types visualizing different data dimensions

**Key reactive patterns:**

### Reactive State with ref()
```javascript
const stats = ref({
    totals: { students: 0, tests: 0, ... },
    registrations_by_month: [],
    ...
});
```
- **`ref()`** creates a reactive object that updates the DOM when changed
- Initial values are provided; they're replaced with API response data in `onMounted`
- All charts depend on this single source of truth

### Computed Properties for Reactivity
```javascript
const totals = computed(() => stats.value.totals);
const registrationsSeries = computed(() => [
    { name: "New Students", data: stats.value.registrations_by_month.map((b) => b.count) }
]);
```
- **`computed()`** creates a derived value that automatically updates when its dependencies change
- Each chart has two computed properties: `*Series` (data) and `*Options` (configuration)
- When `stats` updates, all computed properties and charts re-render automatically
- This is more efficient than creating new objects on every render

---

## Chart Types and Use Cases

### 1. **Area Chart** (Registrations over time)
**Data shape:**
```javascript
series: [{ name: "New Students", data: [5, 10, 15, ...] }]
options: { xaxis: { categories: ["Jan", "Feb", "Mar", ...] } }
```

**Purpose:** Show trends over time
- X-axis is time (months)
- Y-axis is count (students)
- Area fill visualizes the magnitude
- Smooth curve shows progression

**Options used:**
- `chart: { toolbar: { show: false } }`: Hide the toolbar (download, zoom tools)
- `stroke: { curve: "smooth" }`: Create smooth curves instead of sharp angles
- `fill: { type: "gradient" }`: Add visual depth with gradient background
- `tooltip: { y: { formatter: (v) => ... } }`: Custom label when hovering

### 2. **Donut/Pie Charts** (Status, Religion)
**Data shape:**
```javascript
series: [30, 40, 30]  // Just percentages/counts
options: { labels: ["Passed", "Pending", "Failed"] }
```

**Purpose:** Show parts of a whole
- Each slice represents a category
- Donut has a center hole (better for labels)
- Pie is a traditional full circle
- Colors are explicitly mapped to categories

**Example - Status Donut:**
```javascript
labels: ["Passed", "Pending", "Failed"],
colors: ["#28a745", "#ffc107", "#dc3545"],  // Green, Yellow, Red
plotOptions: {
    pie: {
        donut: {
            labels: {
                total: { show: true, label: "Total", formatter: () => String(totals.value.student_tests) }
            }
        }
    }
}
```
- The `formatter` in donut labels can access Vue reactivity (`totals.value`)
- This allows dynamic center text that updates with data

### 3. **Stacked Bar Chart** (Test Popularity by Subject)
**Data shape:**
```javascript
series: [
    { name: "Passed", data: [10, 15, 8, ...] },
    { name: "Pending", data: [5, 3, 10, ...] },
    { name: "Failed", data: [2, 1, 3, ...] }
]
options: { 
    chart: { stacked: true },
    xaxis: { categories: ["Math", "Science", "English", ...] }
}
```

**Purpose:** Compare multiple values across categories with stacking
- Each bar represents a test subject
- Each bar is divided into segments (Passed, Pending, Failed)
- Stacking shows the composition and total
- Ideal for showing status distribution per category

**Configuration:**
- `stacked: true`: Segments stack on top of each other (not side-by-side)
- `plotOptions: { bar: { columnWidth: "55%" } }`: Width of each bar relative to available space
- `legend: { position: "top" }`: Legend shows series names (Passed, Pending, Failed)

### 4. **Pie Chart** (Gender Distribution)
Similar to donut but without center hole:
```javascript
series: [30, 50, 20]  // Counts for Male, Female, Other
options: { labels: ["Male", "Female", "Other"] }
```

### 5. **Horizontal Bar Chart** (Nationality - Top 10)
**Data shape:**
```javascript
series: [{ name: "Number of Students", data: [150, 120, 110, ...] }]
options: { 
    xaxis: { categories: ["Cambodia", "Vietnam", "Thailand", ...] },
    plotOptions: { bar: { horizontal: true } }
}
```

**Purpose:** Compare values for items with long names
- Bars extend horizontally instead of vertically
- More space for axis labels (country names)
- Read left-to-right naturally
- Better for top-10 lists

### 6. **Vertical Bar Chart** (Ethnicity - Top 10)
Same as horizontal but with `horizontal: false`:
- Traditional column chart
- Compact when category names are short
- Good for showing counts or comparisons

---

## API Integration with Lifecycle Hooks

**The onMounted lifecycle pattern:**
```javascript
onMounted(async () => {
    try {
        LoadingModal();                              // Show loading spinner
        const response = await apiGetDashboardStats();  // Fetch data
        stats.value = response.data;                 // Update reactive state
        CloseModal();                                // Hide loading spinner
    } catch (error) {
        MessageModal({                              // Show error message
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || error.message,
        });
    }
});
```

**How it works:**
1. **`onMounted()`**: Vue lifecycle hook that runs after the component's DOM is mounted
2. **`LoadingModal()`**: User feedback — shows a loading animation while waiting
3. **`await apiGetDashboardStats()`**: Waits for the API request to complete
   - Async/await syntax makes promise-based code read like synchronous code
   - The function returns a Promise; `await` pauses execution until resolved
4. **`stats.value = response.data`**: Updates the reactive state with API data
   - All charts automatically re-render because they depend on `stats.value`
5. **`CloseModal()`**: Removes the loading animation
6. **`catch (error)`**: If the API request fails, catch the error and show a message
   - `error.response?.data?.message`: Try to get the backend error message
   - `error.message`: Fall back to the general error message

**Why this approach:**
- Users see visual feedback (loading modal) instead of frozen UI
- Charts populate with real data from the backend
- Errors are handled gracefully with user-friendly messages
- The component initializes with empty data, then populates on mount

---

## Data Transformation with .map()

ApexCharts expects data in specific formats. We transform raw API data using `.map()`:

**Example 1: Simple extraction**
```javascript
registrations_by_month: [
    { label: "Jan 2025", count: 15 },
    { label: "Feb 2025", count: 22 },
]

data: stats.value.registrations_by_month.map((b) => b.count)
// Result: [15, 22]
```

**Example 2: Multiple values per item**
```javascript
by_test: [
    { label: "Math", passed: 50, pending: 10, failed: 5 },
    { label: "Science", passed: 45, pending: 8, failed: 7 },
]

testsSeries = [
    { name: "Passed", data: stats.value.by_test.map((t) => t.passed) },
    // Result: [50, 45]
    { name: "Pending", data: stats.value.by_test.map((t) => t.pending) },
    // Result: [10, 8]
    { name: "Failed", data: stats.value.by_test.map((t) => t.failed) },
    // Result: [5, 7]
]
```

This pattern ensures charts always have the exact data structure ApexCharts expects.

---

## Responsive Grid Layout

The Dashboard uses Bootstrap grid classes for responsive design:
- **`col-lg-3 col-6`**: On large screens, 4 columns (25% width); on mobile, 2 columns (50% width)
- **`col-lg-8`** and **`col-lg-4`**: On large screens, 8 and 4 columns; on mobile, stack to full width
- **`col-lg-6`**: On large screens, 2 columns per row; on mobile, 1 column per row
- **`col-lg-12`**: Full-width row (no responsive change)

This makes the dashboard mobile-friendly without custom logic.

---

## Summary Flow

```
┌──────────────────────────────────────────┐
│ 1. Install vue3-apexcharts               │
│    (npm i vue3-apexcharts)               │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│ 2. Create API function                   │
│    (apiGetDashboardStats)                │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│ 3. Register VueApexChart globally        │
│    (app.component in main.js)            │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│ 4. Build Dashboard with charts           │
│    ├─ Stat cards (4 metrics)             │
│    ├─ Area chart (registrations)         │
│    ├─ Donut chart (status)               │
│    ├─ Stacked bar (tests)                │
│    ├─ Pie chart (gender)                 │
│    ├─ Donut chart (religion)             │
│    ├─ Horizontal bar (nationality)       │
│    └─ Vertical bar (ethnicity)           │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│ 5. Component mounts                      │
│    ├─ Show loading modal                 │
│    ├─ Fetch data from API                │
│    ├─ Update reactive stats              │
│    ├─ All charts re-render               │
│    └─ Close loading modal                │
└──────────────────────────────────────────┘
```

The dashboard is now a dynamic, interactive visualization system that displays real data in professional-looking charts.
