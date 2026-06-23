# Student Test Management — Explained

This document explains the concepts and patterns behind building a student test management page. We'll explore API service architecture, reactive data management, component lifecycle hooks, dynamic table rendering, and the relationship between date filtering and data refresh.

---

### The Big Picture

The Student Test Management feature answers a key question: "On any given date, what tests have students taken, and what are their results?" This requires:

1. **Data Source Integration**: An API service that fetches student test records with all related information (student details, test details, status).
2. **Date Filtering**: A date picker that acts as a filter parameter.
3. **Reactive Updates**: Whenever the date changes, the page automatically fetches and displays fresh data.
4. **Rich Table Display**: A customizable table that shows complex nested data (student info, test info, status) and provides action buttons.

The flow is simple but powerful:
- User picks a date → Component updates `issued_date` ref → `watch` hook detects change → API call fires → Table data refreshes → UI updates automatically.

This pattern can be reused for any date-filtered, data-driven interface in your application.

---

### Step 1: API Service Architecture (Explained)

#### Why create a separate API service file?

Centralizing all API calls into a service file (like `student-test.js`) offers several benefits:

1. **Single Responsibility**: Each function handles one specific backend operation. If the backend API changes, you only modify one place.
2. **Reusability**: Any component can import and use these functions without duplicating request logic.
3. **Error Handling Consistency**: All axios calls go through the same interceptors (like auth token injection, configured in `main.js`).
4. **Maintainability**: Future developers know exactly where to find API-related code.

#### Anatomy of an API Function

```javascript
export function apiGetStudentTestsWithDetailsByIssuedDate(date) {
  return axios.get(`${APP_API_URL}/student-tests/details/by/issued-date/${date}`);
}
```

- **Template literal with `${date}`**: The date is dynamically inserted into the URL path, e.g., `/student-tests/details/by/issued-date/23-06-2026`.
- **Returns a Promise**: The `axios.get()` call returns a Promise that resolves with the API response or rejects with an error.
- **Dynamic base URL**: `import.meta.env.VITE_APP_API_URL` loads the backend URL from environment variables, so it can differ between development and production.

#### PATCH vs PUT vs POST

The service file includes three types of HTTP methods:

- **POST** (`apiCreateStudentTest`): Creates a new record. Idempotent is not expected; calling it twice creates two records.
- **PUT** (`apiUpdateStudentTest`): Replaces the entire resource. Usually expects the full object.
- **PATCH** (`apiChangeStudentTestStatus`): Partially updates a resource. Only the status field changes; other fields remain untouched. This is more efficient than PUT and clearer in intent.

---

### Step 2: Component Lifecycle and Reactive Data (Explained)

#### Understanding `ref` and `reactive`

```javascript
const issued_date = ref(moment().format('DD-MM-YYYY'));
const student_tests = ref([]);
```

- **`ref()`**: Creates a **reactive** reference to a single value. Wrapping it allows Vue to track changes and trigger re-renders when the value updates.
- **Why not just `let issued_date = '...'`?** Without `ref`, Vue can't detect when the variable changes, so components won't automatically re-render.
- **`moment().format('DD-MM-YYYY')`**: Formats today's date as "23-06-2026" to match the backend's expected date format.

```javascript
const studentTestObj = reactive({
  id: null,
  test_id: null,
  student_id: null,
  issued_date: null,
});
```

- **`reactive()`**: Makes an entire object reactive. Any property change (e.g., `studentTestObj.id = 5`) triggers reactivity.
- **Use case**: When you need to manage multiple related properties together (as in a form), `reactive` is cleaner than multiple `ref` calls.
- **Note**: These objects (`studentTestObj`, `studentTestErrObj`) are prepared for future modal form functionality, even though action handlers are currently empty (`onClick: () => { }`).

#### Component Lifecycle: `onMounted` Hook

```javascript
onMounted(async () => {
  try {
    LoadingModal();
    await generateStudentTestsByIssuedDate();
    return CloseModal();
  } catch (error) {
    return MessageModal({ icon: "error", title: "Error", text: error.response?.data?.message || error.message });
  }
});
```

- **`onMounted()`**: This Vue lifecycle hook runs once when the component first appears on the page.
- **Why use it?** Initial data must be fetched before the user can see anything. Fetching in `onMounted` ensures the component is fully rendered before the request starts.
- **`LoadingModal()`**: Shows a loading spinner while the request is in flight, providing user feedback.
- **`CloseModal()` on success**: Closes the loading spinner once data arrives.
- **Error handling**: If the request fails, a SweetAlert error modal displays the error message.
- **`error.response?.data?.message`**: Uses optional chaining (`?.`) to safely access nested error properties. If the property doesn't exist, it defaults to `error.message`.

#### Watching for Changes: The `watch` Hook

```javascript
watch(issued_date, async () => {
  try {
    LoadingModal();
    await generateStudentTestsByIssuedDate();
    return CloseModal();
  } catch (error) {
    return MessageModal({ icon: "error", title: "Error", text: error.response?.data?.message || error.message });
  }
});
```

- **`watch(issued_date, ...)`**: This hook watches the `issued_date` ref. Whenever its value changes, the callback function runs.
- **How does it trigger?** When the user picks a new date in the `VueDatePicker` component, the `v-model` binding updates `issued_date`, and the watch fires.
- **Reactive behavior**: No manual refresh button needed; the user changes the date, and the table automatically updates.
- **Same error handling**: The watch callback includes the same try-catch structure as `onMounted` for consistency.

---

### Step 3: Dynamic Table Rendering with TanStack Table (Explained)

The `student_test_columns` array defines how each column behaves:

#### Column Structure

```javascript
{
  accessorKey: "student.photo",
  header: "",
  cell: (cell) =>
    h("img", {
      style: "max-width: 50px",
      class: "profile-user-img img-fluid img-circle",
      src: cell.getValue() || emptyImage,
    }),
}
```

- **`accessorKey`**: Tells the table which property to extract from each row. For nested data like `student.photo`, it uses dot notation to navigate the object tree.
- **`header`**: The column title. Empty string means no label.
- **`cell` function**: Custom rendering logic. Instead of displaying raw data, it renders an `<img>` element.
- **`h()` function**: Vue's `createElement` function. It creates a virtual DOM element: `h(tagName, props, children)`.
  - `h("img", { ... })` → `<img style="..." class="..." src="..." />`
- **`cell.getValue() || emptyImage`**: Gets the photo URL, or uses a fallback empty image if no photo exists.

#### Conditional Button Rendering

```javascript
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
    h("button", { onClick: () => { }, class: "btn btn-sm btn-outline-danger mx-1" }, h("i", { class: "fa fa-trash" })),
    // view btn
    h("button", { onClick: () => { }, class: "btn btn-sm btn-secondary mx-1" }, h("i", { class: "fa fa-eye" })),
    row.original.status !== "PASSED"
      ? h("button", { onClick: () => { }, class: "btn btn-sm btn-success mx-1" }, h("i", { class: "fa fa-check-circle" }))
      : null,
    row.original.status !== "FAILED"
      ? h("button", { onClick: () => { }, class: "btn btn-sm btn-danger mx-1" }, h("i", { class: "fa fa-times-circle" }))
      : null,
  ],
  enableSorting: false,
  enableGlobalFilter: false,
}
```

- **Header function**: The header can be a string or a function that returns JSX/render functions. Here it returns an array: the title "Actions" plus an "Add New" button.
- **Row-based rendering**: The `cell` function receives the entire row object via `({ row })`. This allows conditional rendering based on row data.
- **`row.original.status`**: Accesses the original row data. The ternary operator checks the status:
  - If status is not "PASSED", show the "Mark as Passed" button.
  - If status is not "FAILED", show the "Mark as Failed" button.
  - This prevents showing redundant buttons (e.g., don't show "Mark as Passed" if already passed).
- **`enableSorting: false` and `enableGlobalFilter: false`**: Disables sorting and filtering for the actions column since it contains buttons, not sortable data.

#### Status Badge with Dynamic Colors

```javascript
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
}
```

- **Dynamic class binding**: Uses template literals and ternary operators to build the class string dynamically.
  - `"PENDING"` → `"badge badge-warning"` (yellow)
  - `"PASSED"` → `"badge badge-success"` (green)
  - `"FAILED"` → `"badge badge-danger"` (red)
- **Visual feedback**: Users instantly recognize test results through color coding.

---

### Step 4: Router Configuration with Named Outlets (Explained)

#### Why Named Router Outlets?

```javascript
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
}
```

- **`components` (plural)**: Unlike the standard `component` property, this maps multiple named outlets.
- **Named outlets**: In `App.vue`, the template probably has:
  - `<router-view name="navbar"></router-view>`
  - `<router-view name="sidebar"></router-view>`
  - `<router-view name="footer"></router-view>`
  - `<router-view></router-view>` (the default unnamed outlet)
- **Consistency**: All content pages (Tests, Students, StudentTests) use the same layout, so they all define the same four components. This creates a persistent header, sidebar, and footer while only the main content area changes.

#### Route Guards and Meta

```javascript
meta: { guarded: true },
```

- **`guarded: true`**: In `main.js`, the router guard checks this meta field. If true and the user is not authenticated, it redirects to the SignIn page.
- **`guarded: false`**: Used for auth pages (SignIn, SignUp) that anyone can access.
- **Purpose**: Prevents unauthenticated users from accessing protected pages.

---

### Step 5: Sidebar Navigation Integration (Explained)

#### Router Links and Active States

```vue
<router-link :to="{ name: 'StudentTests' }" active-class="active" class="nav-link">
  <i class="nav-icon fas fa-user-graduate"></i>
  <p>Student Tests</p>
</router-link>
```

- **`:to="{ name: 'StudentTests' }"`**: Uses the route name defined in `router.js`. Vue resolves this to the actual path `/student-tests`.
- **`active-class="active"`**: When the current route matches this link, Vue automatically adds the `active` class. This highlights the link visually.
- **Icon usage**: `fas fa-user-graduate` is a Font Awesome class. The graduation cap icon represents student/certificate concepts.
- **Navigation header**: `<li class="nav-header">Certificate Management</li>` groups related links and improves UX by organizing the menu logically.

---

### Summary Flow

Here's the end-to-end sequence when a user interacts with the page:

1. **Page Load**:
   - `onMounted()` runs → Shows loading modal → Fetches tests for today → Closes loading modal → Table displays data.

2. **User Changes Date**:
   - User selects a new date in `VueDatePicker` → `issued_date` ref updates → `watch()` fires → Shows loading modal → Fetches tests for new date → Closes loading modal → Table re-renders with fresh data.

3. **User Clicks Action Button** (future):
   - Button handler would update row data or API state → Table re-renders or shows a modal → User confirms or cancels → API call or modal closes.

4. **Error Handling**:
   - At any step, if an API error occurs → Modal shows error message → User can dismiss → Page remains functional for retry.

This architecture ensures a responsive, user-friendly experience with clear feedback at every step.
