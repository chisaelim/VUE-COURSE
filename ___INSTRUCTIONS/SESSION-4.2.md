# Implementing Full CRUD API Operations in Vue 3

This session completes the Test management functionality with full Create, Read, Update, and Delete (CRUD) operations. You'll implement the action handlers to call API functions, add error handling including backend validation errors, and create helper functions that keep the data table in sync with the server. The form now saves data, loads data for editing, deletes records, and updates the page reactively.

---

## Step 1 - Edit: src/components/pages/Test.vue
The following code snippets replace the existing code in the Test.vue component. You will be adding API calls, error handling, and data synchronization logic to make the CRUD operations fully functional.

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
                  <th>Actions <button class="btn btn-sm btn-primary" @click="showModal()">Add</button></th>
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
                    <button class="mx-1 btn btn-sm btn-info" @click="viewTest(test.id)">View</button>
                    <button class="mx-1 btn btn-sm btn-danger" @click="removeTest(test.id)">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal fade" id="TEST-MODAL" data-backdrop="static" data-keyboard="false" tabindex="-1">
    <div class="modal-dialog modal-md">
      <div class="modal-content">
        <form @submit.prevent="saveTest()">
          <div class="modal-header">
            <h5 class="modal-title">Test Management</h5>
            <button type="button" class="close" @click="hideModal()">
              <span>×</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Name (Khmer)</label>
              <input v-model="testObj.name_kh" type="text" class="form-control"
                :class="{ 'is-invalid': !!testErrObj.name_kh }">
              <div class="invalid-feedback">
                {{ testErrObj.name_kh }}
              </div>
            </div>
            <div class="form-group">
              <label>Name (English)</label>
              <input v-model="testObj.name_en" type="text" class="form-control"
                :class="{ 'is-invalid': !!testErrObj.name_en }">
              <div class="invalid-feedback">
                {{ testErrObj.name_en }}
              </div>
            </div>
            <div class="form-group">
              <label>Short Name (English)</label>
              <input v-model="testObj.short_name" type="text" class="form-control"
                :class="{ 'is-invalid': !!testErrObj.short_name }">
              <div class="invalid-feedback">
                {{ testErrObj.short_name }}
              </div>
            </div>
          </div>
          <div class="modal-footer justify-content-between">
            <button type="button" class="btn btn-secondary" @click="hideModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script setup>
import $ from 'jquery';
import Swal from 'sweetalert2';
import { ref, reactive, onMounted } from 'vue';
import { apiGetTestsWithDetails, apiCreateTest, apiReadTest, apiUpdateTest, apiDeleteTest } from '@/functions/api/test';
import { CloseModal, LoadingModal, MessageModal } from "@/functions/swal";

const tests = ref([]);

const testObj = reactive({
  id: null,
  name_en: "",
  name_kh: "",
  short_name: "",
});
const testErrObj = reactive({
  name_en: "",
  name_kh: "",
  short_name: "",
});

const defaultTestObj = JSON.parse(JSON.stringify(testObj));
const defaultTestErrObj = JSON.parse(JSON.stringify(testErrObj));

function resetAllState() {
  Object.assign(testObj, defaultTestObj);
  Object.assign(testErrObj, defaultTestErrObj);
}

onMounted(async () => {
  $('#TEST-MODAL').on('hide.bs.modal', function () {
    resetAllState();
  });
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
async function saveTest() {
  try {
    LoadingModal();
    let response = null;
    if (testObj.id === null) {
      response = await apiCreateTest(testObj);
      onTestCreated(response.data.test);
    } else {
      response = await apiUpdateTest(testObj);
      onTestUpdated(response.data.test);
    }
    hideModal();
    return MessageModal({ icon: 'success', title: 'Success', text: response.data.message });
  } catch (error) {
    const { response } = error;
    if (!response) {
      return MessageModal({ icon: "error", title: "Error", text: error.message });
    }
    const { status, data } = response;
    if (status === 422) {
      Object.keys(testErrObj).forEach((key) => {
        testErrObj[key] = data.errors[key]
          ? data.errors[key][0]
          : "";
      });
      return CloseModal();
    }
    return MessageModal({ icon: "error", title: "Error", text: data.message });
  }
}
async function viewTest(id) {
  try {
    LoadingModal();
    const response = await apiReadTest(id);
    Object.assign(testObj, response.data.test);
    showModal();
    return CloseModal();
  } catch (error) {
    return MessageModal({ icon: "error", title: "Error", text: error.response?.data?.message || error.message });
  }
}
async function removeTest(id) {
  Swal.fire({
    title: 'Want to delete the test ?',
    text: "Please make a confirmation.",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    confirmButtonText: 'Yes, Delete it.'
  }).then(async (sw) => {
    if (sw.isConfirmed) {
      try {
        LoadingModal();
        const response = await apiDeleteTest(id);
        onTestDeleted(response.data.test);
        return MessageModal({ icon: 'success', title: 'Success', text: response.data.message });
      } catch (error) {
        return MessageModal({ icon: "error", title: "Error", text: error.response?.data?.message || error.message });
      }
    }
  });
}

function hideModal() {
  $('#TEST-MODAL').modal('hide');
}
function showModal() {
  $('#TEST-MODAL').modal('show');
}

const onTestCreated = (test) => {
  tests.value = [...tests.value, test];
};
const onTestUpdated = (test) => {
  tests.value = tests.value.map(obj => obj.id !== test.id ? obj : test);
};
const onTestDeleted = (test) => {
  tests.value = tests.value.filter(obj => obj.id !== test.id);
};
</script>
```


**Key points:**
* Import Additional API Functions
  - Import all five API functions together at the top of the script.
  - `apiGetTestsWithDetails` — already used to fetch initial table data.
  - `apiCreateTest` — POST a new test object to the backend.
  - `apiReadTest` — GET a single test by ID for editing.
  - `apiUpdateTest` — PUT changes to an existing test.
  - `apiDeleteTest` — DELETE a test by ID.

* Implement saveTest() for Create and Update
  - `LoadingModal()` shows spinner before API call.
  - `if (testObj.id === null)` — check if creating (no id) or updating (has id).
  - `apiCreateTest(testObj)` — POST form data; backend returns new test object.
  - `apiUpdateTest(testObj)` — PUT form data with id; backend returns updated test object.
  - `onTestCreated()` and `onTestUpdated()` — add/modify item in reactive `tests` array (see Step 5).
  - `hideModal()` — close form after success.
  - `MessageModal({ icon: 'success', ... })` — show success notification.
  - `catch (error)` — handle all error cases.
  - `if (!response)` — network error (no response from server).
  - `if (status === 422)` — validation error (invalid form data).
    - `data.errors[key][0]` — backend Laravel returns errors as arrays; take first message.
    - `Object.keys(testErrObj).forEach(...)` — loop through all form fields and populate errors.
    - `CloseModal()` — keep modal open so user can fix validation errors.
  - `data.message` — generic server error message.

* Implement viewTest() to Load Test Data
  - `LoadingModal()` shows spinner while fetching.
  - `apiReadTest(id)` — GET `/api/tests/read/{id}`.
  - `Object.assign(testObj, response.data.test)` — copy server data into reactive form object. Triggers v-model re-bind.
  - `showModal()` — open form with data pre-filled.
  - `CloseModal()` — dismiss spinner.
  - Form is now in **edit mode** (testObj.id is not null).

* Implement removeTest() with Delete API Call
  - `.then(async (sw) => { if (sw.isConfirmed) { } })` — execute only if user clicks "Yes, Delete it."
  - `LoadingModal()` — show spinner while deleting.
  - `apiDeleteTest(id)` — DELETE `/api/tests/delete/{id}`.
  - `onTestDeleted()` — remove item from reactive `tests` array (see Step 5).
  - `MessageModal({ icon: 'success', ... })` — confirm deletion to user.
  - Error handling with fallback message.

* Add Helper Functions to Sync Table Data
  - `onTestCreated(test)` — append new test to the array using spread operator `[...tests.value, test]`.
  - `onTestUpdated(test)` — replace the matching test in array using `.map()`.
    - `obj.id !== test.id ? obj : test` — keep old items, replace only the one matching the id.
  - `onTestDeleted(test)` — remove the test from array using `.filter()`.
    - `obj.id !== test.id` — keep only items that don't match the deleted id.
  - All three create **new array references** (not mutations) — triggers Vue reactivity and re-renders the table.

---

## Result

After completing these five steps, you will have:

1. ✓ Full Create operation — "Add" button opens modal, form submission calls `apiCreateTest()`, new row appears in table.
2. ✓ Full Read operation — "View" button calls `apiReadTest()`, loads data into form, opens modal for editing.
3. ✓ Full Update operation — editing existing test and clicking Save calls `apiUpdateTest()`, table row updates with new data.
4. ✓ Full Delete operation — "Delete" button shows confirmation, calls `apiDeleteTest()` if confirmed, row disappears from table.
5. ✓ Error handling — validation errors display inline in form (422 status), network/server errors show modal alerts.
6. ✓ Table always in sync — reactive helper functions keep `tests` array up-to-date with server state.

The Test management page is now fully functional. All buttons work. The form validates. The table updates in real-time.
