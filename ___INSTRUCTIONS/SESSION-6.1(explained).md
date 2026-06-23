# Student Test CRUD and Modal Management — Explained

This document explains the concepts and patterns behind implementing full CRUD operations and modal form management for student tests, as demonstrated in Session 6.1. We'll explore modal lifecycle hooks, computed property binding patterns, form validation, confirmation dialogs, and optimistic UI updates.

---

### The Big Picture

Session 6.1 transforms the read-only student test table into a complete management interface. The core idea is:

1. **Modal as form container**: Instead of inline editing, a Bootstrap modal provides a dedicated space for creating and editing records.
2. **Computed bridges**: Computed properties translate between the modal's dropdown selections and the reactive form state.
3. **Confirmation gates**: Before dangerous operations (delete, status change), SweetAlert dialogs ask for user confirmation.
4. **Optimistic updates**: After successful API calls, the table immediately reflects changes without waiting for a full data refresh.
5. **Error handling**: Form validation errors display inline, while general errors show in alert modals.

The result is a smooth, responsive interface that feels instant to the user while maintaining data integrity and safety.

---

### Step 1: Modal Template and Event Handling (Explained)

#### Why use a modal form?

A modal form provides several UX benefits over inline editing:

- **Isolation**: The form is visually separated from the table, reducing confusion about what's being edited.
- **Validation display**: Validation errors have dedicated space next to each field.
- **State management**: The form state (error messages, field values) exists only while the modal is open, naturally supporting form reset on close.
- **Mobile-friendly**: On smaller screens, a modal can take full width, improving usability.

#### Bootstrap Modal Events

```javascript
$('#STUDENT-TEST-MODAL').on('hide.bs.modal', function () {
  resetAllState();
});
$('#STUDENT-TEST-MODAL').on('show.bs.modal', function () {
  studentTestObj.issued_date = issued_date.value;
});
```

Bootstrap emits two key events:

- **`show.bs.modal`**: Fires when the modal becomes visible. We use this to auto-populate the `issued_date` from the page's current date filter. This ensures new tests are always created for the currently selected date.
- **`hide.bs.modal`**: Fires when the modal closes (either by Cancel button or successful save). We use this to reset all form state, clearing fields and error messages.

At runtime:
1. User clicks "Add New" → `showModal()` fires → `show.bs.modal` event → Sets `issued_date` → Modal appears with fresh form.
2. User fills form and clicks Save → Form validation passes → API call succeeds → Modal closes → `hide.bs.modal` fires → `resetAllState()` clears everything.

If the user had clicked Cancel instead:
- Modal closes → `hide.bs.modal` fires → Form state clears anyway, so next time they open the modal, it's fresh.

This is cleaner than manually clearing the form before/after each operation.

#### Why use jQuery for modals?

Bootstrap 5 modals can be triggered with plain JavaScript, but Bootstrap 4 (and earlier) uses jQuery. The code uses `$('#STUDENT-TEST-MODAL').modal('show')` and `.modal('hide')` which are Bootstrap 4 jQuery methods. If your project uses Bootstrap 5, you'd use `new bootstrap.Modal(document.getElementById('STUDENT-TEST-MODAL')).show()` instead.

---

### Step 2: Computed Properties as Data Bridges (Explained)

#### The Two-Way Binding Problem

`VueMultiSelect` expects to bind to an entire object:

```javascript
const test = { id: 1, name_kh: 'គណិតវិទ្យា', name_en: 'Mathematics' };
v-model="test" // Binds the entire object
```

But `studentTestObj` stores only the ID:

```javascript
const studentTestObj = reactive({
  test_id: 1, // Just the ID, not the full object
});
```

If we directly bound `v-model="studentTestObj.test_id"`, `VueMultiSelect` would try to treat the number `1` as an object, and selection wouldn't work.

**Computed properties solve this mismatch:**

```javascript
const selectedTest = computed({
  get: () => tests.value.find(({ id }) => id === studentTestObj.test_id),
  set: (value) => (studentTestObj.test_id = value ? value?.id : null),
});
```

Now we bind `v-model="selectedTest"`, and the computed property handles translation:

```vue
<VueMultiSelect v-model="selectedTest" :options="tests" track-by="id" label="name_kh" />
```

#### At Runtime: The Flow

1. **Initial render**:
   - `selectedTest.get()` is called.
   - It finds the test object where `id === studentTestObj.test_id` (initially null).
   - Result: `null` (no selection yet) → VueMultiSelect renders with no option selected.

2. **User selects a test**:
   - VueMultiSelect calls `selectedTest.set(selectedTestObject)`.
   - The setter extracts `selectedTestObject.id` and stores it in `studentTestObj.test_id`.
   - Vue detects the reactive change.
   - The component re-renders, calling `selectedTest.get()` again.
   - The getter now finds the test object (because the ID matches) and returns it.
   - VueMultiSelect sees the full object and displays it as selected.

3. **Form submission**:
   - `studentTestObj` has `test_id: 1` (just the ID).
   - API call uses `studentTestObj`, sending `{ test_id: 1, student_id: 2, ... }`.
   - Backend receives exactly the data it expects.

#### Optional Chaining (`?.`)

```javascript
set: (value) => (studentTestObj.test_id = value ? value?.id : null),
```

- `value ? ... : null`: If value is `null` or `undefined`, set the ID to `null`.
- `value?.id`: Optional chaining. If `value` exists, access `id`. If `value` is `null`, safely returns `undefined` without throwing an error.

This prevents runtime errors if the user clears the selection.

---

### Step 3: Form Validation and Error Display (Explained)

#### Validation at Two Layers

**Frontend validation** (not shown in this code, would be in form UI):
- Check that fields are filled.
- Prevent submission if required fields are empty.

**Backend validation** (happens on the server):
- Check business logic rules.
- Ensure test/student combo is unique for a date.
- Etc.

The code focuses on backend validation:

```javascript
if (status === 422) {
  Object.keys(studentTestErrObj).forEach((key) => {
    studentTestErrObj[key] = data.errors[key] ? data.errors[key][0] : null;
  });
  return CloseModal();
}
```

HTTP 422 is "Unprocessable Entity"—the request is well-formed, but the data doesn't pass validation.

#### Error Object Structure

The backend returns errors in this shape:

```javascript
{
  "errors": {
    "test_id": ["The test_id field is required."],
    "student_id": ["A test for this student on this date already exists."],
  }
}
```

The code extracts the first error message for each field:

```javascript
studentTestErrObj[key] = data.errors[key] ? data.errors[key][0] : null;
```

- `data.errors[key]`: Gets the array of messages for that field (e.g., `["The test_id field is required."]`).
- `[0]`: Gets the first message.
- `? ... : null`: If the field has no errors, set the error to `null`.

#### Error Display in Template

```vue
<VueMultiSelect v-model="selectedTest" ... :class="{ 'is-invalid': !!studentTestErrObj.test_id }" />
<div class="invalid-feedback">
  {{ studentTestErrObj.test_id }}
</div>
```

- `:class="{ 'is-invalid': !!studentTestErrObj.test_id }"`: Adds Bootstrap's `is-invalid` class if the error is not null (double negation `!!` converts to boolean).
- `is-invalid` class turns the field red.
- The error message displays below the field.

At runtime:
1. User submits form with missing `test_id`.
2. Backend returns 422 with `{ errors: { test_id: ["field is required"] } }`.
3. Error handler populates `studentTestErrObj.test_id = "field is required"`.
4. Vue re-renders: field turns red, error message displays.
5. User fills the field and resubmits.
6. Success: modal closes, table updates.

---

### Step 4: Confirmation Dialogs (Explained)

#### Why Confirmation Dialogs?

Delete and status change operations are destructive. Once confirmed, they can't be undone in real-time. Confirmation dialogs are a safety gate:

```javascript
async function removeStudentTest(id) {
  Swal.fire({
    title: "Want to delete the student test?",
    html: "<pre>" + "Please make a confirmation." + "</pre>",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    confirmButtonText: "Yes, Delete it.",
  }).then(async (sw) => {
    if (sw.isConfirmed) {
      // API call only happens if user clicked "Yes, Delete it."
      try {
        LoadingModal();
        const response = await apiDeleteStudentTest(id);
        // ...
      } catch (error) {
        // ...
      }
    }
  });
}
```

#### SweetAlert Promise Chain

SweetAlert's `.fire()` returns a Promise. The `.then()` callback receives an object `sw` with properties:

- `sw.isConfirmed`: `true` if the user clicked the confirm button, `false` if they clicked cancel or dismissed.
- `sw.isDismissed`: `true` if the user dismissed without confirming.

The code only executes the API call if `sw.isConfirmed` is true.

#### UX Benefits

- **Visual clarity**: The icon (`question`), colors (`#dc3545` for delete is red), and text make the consequence clear.
- **Accidental prevention**: A stray click won't delete the record.
- **Async-aware**: The Promise chain works seamlessly with async/await for the API call.

---

### Step 5: CRUD Operations and Data Flow (Explained)

#### Create vs Update Decision

```javascript
if (studentTestObj.id === null) {
  response = await apiCreateStudentTest(studentTestObj);
  onStudentTestCreated(response.data.student_test);
} else {
  response = await apiUpdateStudentTest(studentTestObj);
  onStudentTestUpdated(response.data.student_test);
}
```

The `id` field determines the operation:

- **Create**: `id === null`. First time this test record is being created.
- **Update**: `id` has a value. User clicked "View" on an existing record, which loaded the record and set the `id`.

#### Read (View) Operation

```javascript
async function viewStudentTest(id) {
  const response = await apiReadStudentTest(id);
  const { student, test, ...rest } = response.data.student_test;
  Object.assign(studentTestObj, {
    ...rest,
    student_id: student.id,
    test_id: test.id,
  });
  showModal();
}
```

The backend returns the full record with nested objects:

```javascript
{
  id: 1,
  issued_date: '23-06-2026',
  student: { id: 5, name_kh: 'សិស្ស ១', ... },
  test: { id: 2, name_kh: 'រង្វាន់ទី ១', ... },
}
```

Destructuring extracts nested objects, then spreads the rest and overrides with just the IDs:

```javascript
const { student, test, ...rest } = { id: 1, issued_date: '...', student: {...}, test: {...} };
// rest = { id: 1, issued_date: '...' }
// student = { id: 5, ... }
// test = { id: 2, ... }

Object.assign(studentTestObj, {
  ...rest,                  // Includes id, issued_date
  student_id: student.id,   // Override with just the ID
  test_id: test.id,         // Override with just the ID
});
// studentTestObj = { id: 1, issued_date: '...', student_id: 5, test_id: 2 }
```

Now `studentTestObj` has the flat structure the API expects, and the computed properties can find the right objects for display.

#### Delete with Confirmation

```javascript
removeStudentTest(id) {
  Swal.fire({...}).then(async (sw) => {
    if (sw.isConfirmed) {
      const response = await apiDeleteStudentTest(id);
      const { student_test, message } = response.data;
      onStudentTestDeleted(student_test);
      MessageModal({...});
    }
  });
}
```

After deletion, `onStudentTestDeleted(student_test)` removes the record from the local `student_tests` array, updating the table instantly.

#### Status Change with Confirmation

```javascript
changeStudentTestStatus(id, status) {
  Swal.fire({...}).then(async (sw) => {
    if (sw.isConfirmed) {
      const response = await apiChangeStudentTestStatus({ id, status });
      const { student_test, message } = response.data;
      onStudentTestUpdated(student_test);
      MessageModal({...});
    }
  });
}
```

Uses PATCH to update only the status field. The backend returns the updated record, which is reflected in the table via `onStudentTestUpdated()`.

---

### Step 6: Optimistic UI Updates (Explained)

#### Why Optimistic Updates?

Optimistic updates make the UI feel instant. Instead of waiting for the server response:

1. User saves → Table immediately shows the new/edited record.
2. User deletes → Table immediately removes the record.
3. User changes status → Badge color immediately changes.

If the server call fails, the error handler displays a message and ideally reverts the UI (though this code doesn't implement full rollback).

#### Create Handler

```javascript
const onStudentTestCreated = (student_test) => {
  if (student_test.issued_date !== issued_date.value) {
    onStudentTestDeleted(student_test);
    return;
  };
  student_tests.value = [...student_tests.value, student_test];
};
```

Date-aware logic:
- If the created record's date differs from the current filter, remove it (don't show it in the current view).
- Otherwise, append it to the table using the spread operator.

```javascript
student_tests.value = [...student_tests.value, student_test];
// Creates a new array reference, triggering Vue reactivity.
```

#### Update Handler

```javascript
const onStudentTestUpdated = (student_test) => {
  if (student_test.issued_date !== issued_date.value) {
    onStudentTestDeleted(student_test);
    return;
  };
  student_tests.value = student_tests.value.map((obj) =>
    obj.id !== student_test.id ? obj : student_test
  );
};
```

- If the updated record's date changed and no longer matches the filter, remove it.
- Otherwise, replace the old record with the new one using `.map()`.

```javascript
.map((obj) => obj.id !== student_test.id ? obj : student_test)
// If the ID doesn't match, keep the old obj.
// If the ID matches, replace with student_test.
```

#### Delete Handler

```javascript
const onStudentTestDeleted = (student_test) => {
  student_tests.value = student_tests.value.filter(
    (obj) => obj.id !== student_test.id
  );
};
```

Simple: remove the record by ID using `.filter()`.

```javascript
.filter((obj) => obj.id !== student_test.id)
// Keep all records where ID doesn't match the deleted one.
```

#### Vue Reactivity Recap

Vue detects changes to:
- Direct property updates: `ref.value = newArray` (reassignment).
- Array mutations: `array.push()`, `array.pop()`, but **not** direct index assignment like `array[0] = newItem`.

This code uses immutable patterns (spread operator, `.map()`, `.filter()`), which creates new array references, ensuring Vue detects and re-renders.

---

### Summary Flow

Here's the complete sequence for a typical user session:

1. **Page Load**:
   - `onMounted()` fires → `Promise.all()` loads tests, students, and table data → Modal lifecycle hooks attach.

2. **User Clicks "Add New"**:
   - `showModal()` → `show.bs.modal` event → Sets `issued_date` → Modal appears with empty form.

3. **User Fills Form and Saves**:
   - Form submits → `saveStudentTest()` → API POST → Success → `onStudentTestCreated()` appends to table → Modal closes → `hide.bs.modal` → `resetAllState()`.

4. **User Clicks "View" on a Record**:
   - `viewStudentTest(id)` → API GET → Populates form → `showModal()` → Modal appears with pre-filled data.

5. **User Edits and Saves**:
   - Form submits → `saveStudentTest()` → API PUT → Success → `onStudentTestUpdated()` replaces in table → Modal closes.

6. **User Clicks Delete**:
   - `removeStudentTest(id)` → SweetAlert confirmation → User confirms → API DELETE → `onStudentTestDeleted()` removes from table → Success message.

7. **User Clicks Status Badge or Status Button**:
   - `changeStudentTestStatus(id, "PASSED")` → SweetAlert confirmation → User confirms → API PATCH → `onStudentTestUpdated()` updates table record → Badge color changes → Success message.

8. **Modal Closes** (any scenario):
   - `hide.bs.modal` → `resetAllState()` → Form fields cleared, error messages cleared.

At every step, user receives feedback via loading modals, success/error messages, and instant table updates. The experience feels responsive and under control.
