# Adding a Form Modal for Test CRUD Operations in Vue 3

This session enhances the Tests page with a reusable form modal for creating and editing test records. You'll install jQuery for modal control, add reactive form state management, build a Bootstrap modal dialog with input validation feedback, and wire up click handlers for the Add, View, and Delete action buttons. The modal opens and closes with state reset.

---

## Step 1 - Run Command: Install jQuery

jQuery is needed to control Bootstrap modals programmatically.

```bash
npm i jquery@3.7.1
```

**Key points:**
- jQuery is already used by the AdminLTE template (loaded via the HTML template).
- This npm install adds jQuery to `node_modules` so you can `import` it in Vue components.
- Bootstrap modals use jQuery methods like `.modal('show')` and `.modal('hide')`.

---

## Step 2 - Edit: src/components/pages/Test.vue

Add jQuery, SweetAlert2, and Composition API imports. Add reactive form state, modal HTML, and event handler functions.

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
import { apiGetTestsWithDetails } from '@/functions/api/test';
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
  hideModal();
}
async function viewTest(id) {
  showModal();
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

    }
  });
}

function hideModal() {
  $('#TEST-MODAL').modal('hide');
}
function showModal() {
  $('#TEST-MODAL').modal('show');
}
</script>
```

**Key points:**
- `import $ from 'jquery'` — import jQuery for modal control.
- `import Swal from 'sweetalert2'` — import for delete confirmation dialog.
- `reactive()` — creates reactive objects for form data and validation errors (unlike `ref`, properties are auto-unwrapped).
- `testObj` — holds the form input values (id, name_en, name_kh, short_name).
- `testErrObj` — holds validation error messages for each field (empty string = no error).
- `v-model="testObj.name_kh"` — two-way binding between input and reactive object.
- `:class="{ 'is-invalid': !!testErrObj.name_kh }"` — dynamically add CSS class when error exists.
- `{{ testErrObj.name_kh }}` — display error message below the input.
- `@submit.prevent="saveTest()"` — form submit handler with `.prevent` to stop page reload.
- `@click="showModal()"` on Add button — opens the modal.
- `@click="viewTest(test.id)"` on View button — opens modal and loads test data (not yet implemented).
- `@click="removeTest(test.id)"` on Delete button — shows delete confirmation.
- `$('#TEST-MODAL').on('hide.bs.modal', ...)` — jQuery event listener to reset form when modal closes.
- `defaultTestObj` and `defaultTestErrObj` — snapshots of initial state for clean resets.
- `Object.assign(testObj, defaultTestObj)` — copies default values back into the reactive object to clear the form.
- `$('#TEST-MODAL').modal('show')` and `.modal('hide')` — jQuery methods to open/close the modal.
- `Swal.fire({...})` — SweetAlert2 creates a confirmation dialog for delete.

---

## Result

After completing this step, you will have:

1. ✓ jQuery installed and available for importing in components.
2. ✓ A Bootstrap modal dialog that opens when you click "Add" on the table header or "View" on each row.
3. ✓ Three form input fields with two-way data binding and inline validation error display.
4. ✓ Form state that resets to empty every time the modal closes.
5. ✓ A delete confirmation dialog that fires when clicking the "Delete" button.
6. ✓ Modal control functions (`showModal`, `hideModal`) ready for use by all buttons.

The form is now interactive. Clicking buttons opens/closes the modal. Typing in inputs updates the reactive state. Errors will display once backend validation is wired up (next steps).
