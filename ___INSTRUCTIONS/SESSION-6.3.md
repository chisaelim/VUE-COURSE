# Setting Up pdfMake with Custom Fonts for Certificate Generation

In this session, we will configure pdfMake to generate PDF certificates with custom fonts. We'll install the pdfMake package, set up virtual file systems containing embedded font data, create a pdfmake initialization module, and integrate it into the StudentTest component for multi-language certificate generation. This setup enables the StudentTest component to generate Khmer-English bilingual certificates with proper font rendering in PDFs.

---

### Step 1 - Run Command: Install pdfMake Package

First, install the pdfMake package as a project dependency.

```bash
npm i pdfmake@0.3.11
```

**Key points:**
- `pdfmake@0.3.11` is installed as a project dependency
- This version is stable and supports virtual file systems for custom fonts
- The package is now added to `package.json` dependencies
- The `node_modules/` folder is updated with pdfMake source code

---

### Step 2 - Create New: Virtual File System for Fonts

Create a module that exports embedded font data as a virtual file system for pdfMake. The font data includes standard fonts (Arial, Times, Roboto) and Khmer language fonts.

**File:** `src/assets/vfs_fonts.js`

**Key points:**
- This file contains an exported object `vfsFonts` with font filenames as keys
- Each key-value pair represents a font file: filename → base64-encoded font data
- Includes standard fonts: Roboto (4 variants), Arial (4 variants), Times New Roman (4 variants)
- Includes Khmer language fonts: KhmerOSMoul, KhmerOSBattambong (normal and bold)
- Embedding fonts as base64 strings eliminates the need for separate font file assets in production
- The complete file contains approximately 2MB of encoded font data

---

### Step 3 - Create New: Virtual File System for Images

Create a module that exports embedded image data as a virtual file system. This is reserved for future PDF features like logos or watermarks.

**File:** `src/assets/vfs_images.js`

**Key points:**
- This module follows the same pattern as `vfs_fonts.js`
- Currently empty, but structured to hold base64-encoded image data
- Allows images to be embedded in PDFs without separate file requests
- Reserved for adding logos, watermarks, or certificate backgrounds in future sessions

---

### Step 4 - Create New: pdfMake Configuration Module

Create a module that initializes pdfMake with virtual file systems and defines font mappings for use throughout the application.

**File:** `src/functions/pdfmake.js`

```javascript
import pdfMake from 'pdfmake';
import { vfsFonts } from '@/assets/vfs_fonts.js';
import { vfsImages } from '@/assets/vfs_images.js';

pdfMake.addVirtualFileSystem(vfsFonts);
pdfMake.addVirtualFileSystem(vfsImages);

pdfMake.fonts = {
    Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Bold.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-BoldItalic.ttf',
    },
    Arial: {
        normal: 'ARIAL.ttf',
        bold: 'ARIALBD.ttf',
        italics: 'ARIALI.ttf',
        bolditalics: 'ARIALBI.ttf',
    },
    Times: {
        normal: 'times.ttf',
        bold: 'timesbd.ttf',
        italics: 'timesi.ttf',
        bolditalics: 'timesbi.ttf',
    },
    KhmerOSMoul: {
        normal: 'KHMER OS MOUL REGULAR.ttf',
    },
    KhmerOSBattambong: {
        normal: 'KHMER OS BATTAMBANG REGULAR.ttf',
        bold: 'KHMER OS BATTAMBANG - BOLD.ttf',
    },
}
window.pdfMake = pdfMake;
```

**Key points:**
- `pdfMake.addVirtualFileSystem(vfsFonts)`: Registers all font files as virtual assets
- `pdfMake.addVirtualFileSystem(vfsImages)`: Registers image files (currently empty)
- `pdfMake.fonts`: Maps user-friendly font names to actual font files with variants
  - Roboto: Provides normal, bold, italics, and bolditalics variants (modern, clean font)
  - Arial: Provides all 4 variants (widely supported, sans-serif)
  - Times: Provides all 4 variants (serif, traditional)
  - KhmerOSMoul: Khmer display font, normal variant only (for headings/titles)
  - KhmerOSBattambong: Khmer body font, normal and bold variants (for main text)
- `window.pdfMake = pdfMake`: Exposes pdfMake globally so Vue components can access it as `window.pdfMake`
- This setup enables multi-language PDF generation with proper rendering for both English and Khmer text

---

### Step 5 - Edit: Import pdfMake in Application Entry Point

Import the pdfmake configuration at application startup. This must happen before any components try to use pdfMake.

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

const pinia = createPinia();

const app = createApp(App);
app.use(router);
app.use(pinia);
app.component('VueDatePicker', VueDatePicker);
app.component('VueMultiSelect', VueMultiSelect);
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
- `import '@/functions/pdfmake.js'` is placed right after third-party library imports
- It appears before the Vue app creation (`createApp(App)`)
- This ensures `window.pdfMake` is initialized and available before any component mounts
- The import order is critical: vendor JS → pdfmake setup → Vue framework initialization
- Subsequent imports load Vue dependencies, create the app instance, and set up routing/state management

---

### Step 6 - Edit: Integrate pdfMake in StudentTest Component

Update the StudentTest component to use pdfMake for certificate generation. This component has a method `generateStudentTestCertificatesPDF()` that creates bilingual Khmer-English certificates.

**File:** `src/components/pages/StudentTest.vue`

Key method that uses pdfMake:

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
  <div class="modal fade" id="STUDENT-TEST-MODAL" data-backdrop="static" data-keyboard="false" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <form @submit.prevent="saveStudentTest()">
          <div class="modal-header">
            <h5 class="modal-title">Student Test Management</h5>
            <button type="button" class="close" @click="hideModal()">
              <span>×</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group col-12">
              <label>Issued Date</label>
              <VueDatePicker v-model="studentTestObj.issued_date" :formats="{ input: 'dd-MM-yyyy' }"
                model-type="dd-MM-yyyy" :time-config="{ enableTimePicker: false }"
                :class="{ 'is-invalid': !!studentTestErrObj.issued_date }" :disabled="true" />
              <div class="invalid-feedback">
                {{ studentTestErrObj.issued_date }}
              </div>
            </div>
            <div class="form-group col-12">
              <label>Student</label>
              <VueMultiSelect v-model="selectedStudent" :options="students" track-by="id" label="name_kh"
                placeholder="---none---" :class="{ 'is-invalid': !!studentTestErrObj.student_id }" />
              <div class="invalid-feedback">
                {{ studentTestErrObj.student_id }}
              </div>
              <div class="card card-primary card-outline mt-1">
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="d-flex justify-content-center align-items-center">
                        <div class="text-center">
                          <img class="profile-user-img img-fluid img-circle m-3"
                            :src="selectedStudent?.photo || emptyImage" alt="User profile picture">
                          <h3 class="profile-username text-center">{{ selectedStudent?.name_kh ?? '-------' }}</h3>
                          <h3 class="profile-username text-center">{{ selectedStudent?.name_en ?? '-------' }}</h3>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <ul class="list-group mb-3">

                        <li class="list-group-item">
                          <b>ភេទ</b>
                          <h6 class="float-right">{{ selectedStudent?.gender?.gd_kh_full }}</h6>
                        </li>
                        <li class="list-group-item">
                          <b>ថ្ងៃខែឆ្នាំកំណើត</b>
                          <h6 class="float-right">{{ selectedStudent?.dob }}</h6>
                        </li>
                        <li class="list-group-item">
                          <b>លេខទូរស័ព្ទ</b>
                          <h6 class="float-right">{{ selectedStudent?.phone }}</h6>
                        </li>
                        <li class="list-group-item d-flex justify-content-center">
                          <button type="button" @click="StudentModalRef.showModal"
                            class="btn btn-success btn-inline-block mx-1">Add
                            New <i class="fas fa-plus"></i></button>
                          <button type="button" :disabled="!selectedStudent"
                            @click="StudentModalRef.viewStudent(selectedStudent?.id)"
                            class="btn btn-primary btn-inline-block mx-1">Update <i class="fas fa-edit"></i></button>
                          <button type="button" :disabled="!selectedStudent"
                            @click="StudentModalRef.removeStudent(selectedStudent?.id)"
                            class="btn btn-danger btn-inline-block mx-1">Delete <i class="fas fa-trash"></i></button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-group col-12">
              <label>Test</label>
              <VueMultiSelect v-model="selectedTest" :options="tests" track-by="id" label="name_kh"
                placeholder="---none---" :class="{ 'is-invalid': !!studentTestErrObj.test_id }" />
              <div class="invalid-feedback">
                {{ studentTestErrObj.test_id }}
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
  <div class="modal fade" id="CERTIFICATE-MODAL" data-backdrop="static" data-keyboard="false" tabindex="-1">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <form @submit.prevent="generateCertificates()">
          <div class="modal-header">
            <h5 class="modal-title">Certificates</h5>
            <button type="button" class="close" @click="closeCertificateModal()">
              <span>×</span>
            </button>
          </div>
          <div class="modal-body">
            <CustomTable :title="'List of Students Who Completed the Course'" :data="passed_student_tests"
              :columns="passed_columns" :maxSize="true" />
          </div>
          <div class="modal-footer justify-content-between">
            <button type="button" class="btn btn-secondary" @click="closeCertificateModal()">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              Generate Certificates
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <StudentModal ref="StudentModalRef" :onCreated="onStudentCreated" :onUpdated="onStudentUpdated"
    :onDeleted="onStudentDeleted" />
  <div class="modal fade" id="PDF-MODAL" tabindex="-1">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-body">
          <iframe style="width: 100%; height: calc(100vh - 100px); min-height: 500px;"></iframe>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import emptyImage from '@/assets/images/emptyImage.png';
import moment from 'moment';
import { h, ref, reactive, onMounted, watch, computed } from 'vue';
import { CloseModal, LoadingModal, MessageModal } from "@/functions/swal";
import CustomTable from '@/components/includes/controls/CustomTable.vue';
import { apiGetPassedStudentTestsForCertificates, apiGetStudentTestsWithDetailsByIssuedDate, apiCreateStudentTest, apiUpdateStudentTest, apiReadStudentTest, apiDeleteStudentTest, apiChangeStudentTestStatus } from '@/functions/api/student-test';
import { apiGetTests } from '@/functions/api/test';
import { apiGetStudents } from '@/functions/api/student';
import Swal from 'sweetalert2';
import $ from 'jquery';
import StudentModal from '@/components/includes/modals/StudentModal.vue';

const StudentModalRef = ref(null);
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
          onClick: () => row.original.status === "PENDING"
            ? null
            : changeStudentTestStatus(row.original.id, "PENDING"),
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
          onClick: () => showModal(),
          class: "btn btn-sm btn-success ml-3",
        },
        "Add New"
      ),
      h(
        "button",
        {
          onClick: () => openCertificateModal(),
          class: "btn btn-sm btn-primary ml-3",
        },
        "Certificates"
      )
    ],
    cell: ({ row }) => [
      // delete btn
      h(
        "button",
        {
          onClick: () => removeStudentTest(row.original.id),
          class: "btn btn-sm btn-outline-danger mx-1",
        },
        h("i", { class: "fa fa-trash" })
      ),
      // view btn
      h(
        "button",
        {
          onClick: () => viewStudentTest(row.original.id),
          class: "btn btn-sm btn-secondary mx-1",
        },
        h("i", { class: "fa fa-eye" })
      ),
      row.original.status !== "PASSED"
        ? h(
          "button",
          {
            onClick: () => changeStudentTestStatus(row.original.id, "PASSED"),
            class: "btn btn-sm btn-success mx-1",
          },
          h("i", { class: "fa fa-check-circle" })
        )
        : null,
      row.original.status !== "FAILED"
        ? h(
          "button",
          {
            onClick: () => changeStudentTestStatus(row.original.id, "FAILED"),
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

const tests = ref([]);
const selectedTest = computed({
  get: () => tests.value.find(({ id }) => id === studentTestObj.test_id),
  set: (value) => (studentTestObj.test_id = value ? value?.id : null),
});

const students = ref([]);
const selectedStudent = computed({
  get: () =>
    students.value.find(({ id }) => id === studentTestObj.student_id),
  set: (value) => (studentTestObj.student_id = value ? value?.id : null),
});

const studentTestObj = reactive({
  id: null,
  test_id: null,
  student_id: null,
  issued_date: null,
});
const studentTestErrObj = reactive({
  test_id: null,
  student_id: null,
  issued_date: null,
});


const defaultStudentTestObj = JSON.parse(JSON.stringify(studentTestObj));
const defaultStudentTestErrObj = JSON.parse(JSON.stringify(studentTestErrObj));

function resetAllState() {
  Object.assign(studentTestObj, defaultStudentTestObj);
  Object.assign(studentTestErrObj, defaultStudentTestErrObj);
}

onMounted(async () => {
  $('#STUDENT-TEST-MODAL').on('hide.bs.modal', function () {
    resetAllState();
  });
  $('#STUDENT-TEST-MODAL').on('show.bs.modal', function () {
    studentTestObj.issued_date = issued_date.value;
  });
  try {
    LoadingModal();
    await Promise.all([
      generateTests(),
      generateStudents(),
      generateStudentTestsByIssuedDate(),
    ]);
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
async function generateTests() {
  const response = await apiGetTests();
  tests.value = response.data.tests;
}
async function generateStudents() {
  const response = await apiGetStudents();
  students.value = response.data.students;
}

async function saveStudentTest() {
  try {
    LoadingModal();
    let response = null;
    if (studentTestObj.id === null) {
      response = await apiCreateStudentTest(studentTestObj);
      onStudentTestCreated(response.data.student_test);
    } else {
      response = await apiUpdateStudentTest(studentTestObj);
      onStudentTestUpdated(response.data.student_test);
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
      Object.keys(studentTestErrObj).forEach((key) => {
        studentTestErrObj[key] = data.errors[key] ? data.errors[key][0] : null;
      });
      return CloseModal();
    }
    return MessageModal({ icon: "error", title: "Error", text: data.message });
  }
}
async function viewStudentTest(id) {
  try {
    LoadingModal();
    const response = await apiReadStudentTest(id);
    const { student, test, ...rest } = response.data.student_test;
    Object.assign(studentTestObj, {
      ...rest,
      student_id: student.id,
      test_id: test.id,
    });
    showModal();
    return CloseModal();
  } catch (error) {
    return MessageModal({ icon: "error", title: "Error", text: error.response?.data?.message || error.message });
  }
}
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
      try {
        LoadingModal();
        const response = await apiDeleteStudentTest(id);
        const { student_test, message } = response.data;
        onStudentTestDeleted(student_test);
        return MessageModal({ icon: 'success', title: 'Success', text: message });
      } catch (error) {
        return MessageModal({ icon: "error", title: "Error", text: error.response?.data?.message || error.message });
      }
    }
  });
}
async function changeStudentTestStatus(id, status) {
  Swal.fire({
    title: "Want to change the student test status?",
    html: "<pre>" + "Please make a confirmation." + "</pre>",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#007bff",
    confirmButtonText: "Yes, Change it.",
  }).then(async (sw) => {
    if (sw.isConfirmed) {
      try {
        LoadingModal();
        const response = await apiChangeStudentTestStatus({ id, status });
        const { student_test, message } = response.data;
        onStudentTestUpdated(student_test);
        return MessageModal({ icon: 'success', title: 'Success', text: message });
      } catch (error) {
        return MessageModal({ icon: "error", title: "Error", text: error.response?.data?.message || error.message });
      }
    }
  })
}




function hideModal() {
  $('#STUDENT-TEST-MODAL').modal('hide');
}
function showModal() {
  $('#STUDENT-TEST-MODAL').modal('show');
}
const onStudentTestCreated = (student_test) => {
  if (student_test.issued_date !== issued_date.value) {
    onStudentTestDeleted(student_test);
    return;
  };
  student_tests.value = [...student_tests.value, student_test];
};
const onStudentTestUpdated = (student_test) => {
  if (student_test.issued_date !== issued_date.value) {
    onStudentTestDeleted(student_test);
    return;
  };
  student_tests.value = student_tests.value.map((obj) =>
    obj.id !== student_test.id ? obj : student_test
  );
};
const onStudentTestDeleted = (student_test) => {
  student_tests.value = student_tests.value.filter(
    (obj) => obj.id !== student_test.id
  );
};

function onStudentCreated(student) {
  students.value = [...students.value, student];
  selectedStudent.value = student;
}
function onStudentUpdated(student) {
  students.value = students.value.map((obj) =>
    obj.id !== student.id ? obj : student
  );
  selectedStudent.value = student;
}
function onStudentDeleted(student) {
  students.value = students.value.filter((obj) => obj.id !== student.id);
  if (selectedStudent.value?.id === student.id) {
    selectedStudent.value = null;
  }
}


////// Certificate Section
const passed_student_tests = computed(
  () => student_tests.value?.filter(({ status }) => status === "PASSED") ?? []
);
const passed_ids = ref([]);
const passed_columns = [
  {
    accessorKey: "id",
    header: () =>
      h(
        "div",
        {
          class: "icheck-primary d-inline",
        },
        [
          h("input", {
            type: "checkbox",
            id: "checkbox-all",
            checked: passed_student_tests.value.every(({ id }) =>
              passed_ids.value.includes(id)
            ),
            onChange: ({ target: { checked } }) => {
              if (checked) {
                passed_ids.value = passed_student_tests.value.map(
                  ({ id }) => id
                );
              } else {
                passed_ids.value = [];
              }
            },
          }),
          h(
            "label",
            {
              for: "checkbox-all",
            },
            "All"
          ),
        ]
      ),
    cell: (cell) =>
      h(
        "div",
        {
          class: "icheck-primary d-inline",
        },
        [
          h("input", {
            type: "checkbox",
            id: "checkbox-" + cell.getValue(),
            checked: passed_ids.value.includes(cell.getValue()),
            onChange: ({ target: { checked } }) => {
              if (checked) {
                passed_ids.value.push(cell.getValue());
              } else {
                passed_ids.value = passed_ids.value.filter(
                  (id) => id !== cell.getValue()
                );
              }
            },
          }),
          h("label", {
            for: "checkbox-" + cell.getValue(),
          }),
        ]
      ),
    enableSorting: false,
    enableGlobalFilter: false,
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
];
function openCertificateModal() {
  $("#CERTIFICATE-MODAL").modal("show");
}
function closeCertificateModal() {
  $("#CERTIFICATE-MODAL").modal("hide");
}

async function generateCertificates() {
  try {
    LoadingModal();
    const response = await apiGetPassedStudentTestsForCertificates(
      passed_ids.value
    );
    await generateStudentTestCertificatesPDF(response.data.student_tests);
    return CloseModal();
  } catch (error) {
    return MessageModal({ icon: "error", title: "Error", text: error.response?.data?.message || error.message });
  }
}

async function generateStudentTestCertificatesPDF(passed_test_details) {
  let dots = [
    "................................",
    "............................................................................",
    ".......................................................",
    "...........................................",
    ".........................................................................................................",
    ".......................................................................................................",
    ".............................................",
    "................................................................................................................",
    "........................................................................................................",
    "......................................................................................................",
    ".........................",
    ".....................",
    ".....................",
    "...................................................................",
    "........................................................................",
    "...............................",
    ".................................................................................................................",
    "........................................................................................................................",
    ".......................................................................",
    "...................................................................................................................",
    "............................",
    ".................................",
    ".................................",
    ".....................",
    ".................................",
    "................................."
  ];
  const enRowObject = (label, value, underline) => ({
    columns: [
      {
        width: 'auto',
        text: label,
      },
      {
        width: '*',
        stack: [
          {
            text: underline,
            margin: [0, 1, 0, 0],
          },
          {
            text: value,
            bold: true,
            margin: [0, -11.5, 0, 0],
          }
        ],
        alignment: 'center'
      }
    ],
    // margin: [0, 0, 0, 7],
    margin: [0, -1.50, 0, 7]
  });
  const khRowObject = (label, value, underline) => ({
    columns: [
      {
        width: 'auto',
        text: label,
      },
      {
        width: '*',
        stack: [
          {
            text: underline,
            margin: [0, 1, 0, 0],
          },
          {
            text: value,
            font: 'KhmerOSMoul',
            fonts: 8,
            margin: [0, -18.5, 0, 0],
          }
        ],
        alignment: 'center'
      }
    ],
    margin: [0, -5, 0, 3.75]
  });
  const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
  const enMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const formatDate = (dateStr) => {
    const [day, month, year] = dateStr.split('-');
    const idx = parseInt(month) - 1;
    return { en: `${day} ${enMonths[idx]} ${year}`, kh: `${day} ${khmerMonths[idx]} ${year}` };
  };
  let page = 0;
  const data = [];
  for (const { id, issued_date, expired_date, student: s, test } of passed_test_details) {
    const issuedDate = formatDate(issued_date);
    const expiredDate = formatDate(expired_date);
    const dobDate = formatDate(s.dob);
    const issued_date_en = issuedDate.en;
    const issued_date_kh = issuedDate.kh;
    const expired_date_en = expiredDate.en;
    const expired_date_kh = expiredDate.kh;
    const student = {
      name_en: s.name_en,
      name_kh: s.name_kh,
      gd_en: s.gender.gd_en,
      gd_kh: s.gender.gd_kh,
      dob_en: dobDate.en,
      dob_kh: dobDate.kh,
      pob_province: s.pob_province,
    };
    page++;
    let index = 0;
    data.push({
      columns: [
        {
          width: '50%',
          stack: [
            enRowObject(
              'Seeing minutes of the Assessment Committee meeting on',
              issued_date_en,
              dots[index++]
            ),
            enRowObject(
              'Of competency assessment at',
              'Institute of Cambodia',
              dots[index++]
            ),
            {
              columns: [
                {
                  width: '60%',
                  stack: [
                    enRowObject(
                      'Certifies that',
                      student.name_en,
                      dots[index++]
                    ),
                  ]
                },
                {
                  width: '*',
                  stack: [
                    enRowObject(
                      'Sex',
                      student.gd_en,
                      dots[index++]
                    ),
                  ]
                }
              ],
            },
            enRowObject(
              'Date of Birth',
              student.dob_en,
              dots[index++]
            ),
            enRowObject(
              'Place of Birth',
              student.pob_province.name_latin,
              dots[index++]
            ),
            enRowObject(
              'Has qualified to deserve the National Qualification',
              'Vocational Certificate',
              dots[index++]
            ),
            enRowObject(
              'Skills of',
              test.name_en,
              dots[index++]
            ),
            enRowObject(
              'This certificate is presented to the bearer for which all the rights and privileges.',
              '',
              ''
            ),
            enRowObject(
              'Date of Issue',
              issued_date_en,
              dots[index++]
            ),
            enRowObject(
              'Date of Expiry',
              expired_date_en,
              dots[index++]
            ),
          ],
          style: 'body_en',
          // margin: [10, 0],
          margin: [5, -2]
        },
        {
          width: '50%',
          stack: [
            {
              columns: [
                {
                  width: '60%',
                  stack: [
                    khRowObject(
                      'បានឃើញកំណត់ហេតុប្រជុំ ចុះថ្ងៃទី',
                      issued_date_kh.split(' ')[0],
                      dots[index++]
                    ),
                  ]
                },
                {
                  width: '*',
                  stack: [
                    khRowObject(
                      'ខែ',
                      issued_date_kh.split(' ')[1],
                      dots[index++]
                    ),
                  ]
                },
                {
                  width: '*',
                  stack: [
                    khRowObject(
                      'ឆ្នាំ',
                      issued_date_kh.split(' ')[2],
                      dots[index++]
                    ),
                  ]
                }
              ],
            },
            khRowObject(
              'របស់គណៈកម្មការវាយតម្លៃសមត្ថភាពនៅ',
              'វិទ្យាស្ថានជាតិ',
              dots[index++]
            ),
            {
              columns: [
                {
                  width: '70%',
                  stack: [
                    khRowObject(
                      'បញ្ជាក់ថា៖',
                      student.name_kh,
                      dots[index++]
                    ),
                  ]
                },
                {
                  width: '*',
                  stack: [
                    khRowObject(
                      'ភេទ',
                      student.gd_kh,
                      dots[index++]
                    ),
                  ]
                }
              ],
            },
            khRowObject(
              'កើតថ្ងៃទី',
              student.dob_kh,
              dots[index++]
            ),
            khRowObject(
              'នៅ',
              student.pob_province.name_kh,
              dots[index++]
            ),
            khRowObject(
              'មានសមត្ថភាពទទួលបានគុណវុឌ្ឍិជាតិ',
              'វិញ្ញាបនបត្រវិជ្ជាជីវៈ',
              dots[index++]
            ),
            khRowObject(
              'ជំនាញ',
              test.name_kh,
              dots[index++]
            ),
            khRowObject(
              'គុណវុឌ្ឍិនេះផ្តល់ជូនសាមីជនដើម្បីប្រើប្រាស់តាមតម្រូវការដែលអាចប្រើបាន។',
              '',
              ''
            ),
            {
              columns: [
                {
                  width: '40%',
                  stack: [
                    khRowObject(
                      'ផ្តល់ជូននៅថ្ងៃទី',
                      issued_date_kh.split(' ')[0],
                      dots[index++]
                    ),
                  ]
                },
                {
                  width: '*',
                  stack: [
                    khRowObject(
                      'ខែ',
                      issued_date_kh.split(' ')[1],
                      dots[index++]
                    ),
                  ]
                },
                {
                  width: '*',
                  stack: [
                    khRowObject(
                      'ឆ្នាំ',
                      issued_date_kh.split(' ')[2],
                      dots[index++]
                    ),
                  ]
                }
              ],
            },
            {
              columns: [
                {
                  width: '40%',
                  stack: [
                    khRowObject(
                      'សុពលភាពដល់ថ្ងៃទី',
                      expired_date_kh.split(' ')[0],
                      dots[index++]
                    ),
                  ]
                },
                {
                  width: '*',
                  stack: [
                    khRowObject(
                      'ខែ',
                      expired_date_kh.split(' ')[1],
                      dots[index++]
                    ),
                  ]
                },
                {
                  width: '*',
                  stack: [
                    khRowObject(
                      'ឆ្នាំ',
                      expired_date_kh.split(' ')[2],
                      dots[index++]
                    ),
                  ]
                }
              ],
            },
          ],
          style: 'body_kh',
          // margin: [10, 0],
          margin: [5, -2],
        },
      ],
      pageBreak: page < passed_test_details.length ? 'after' : ''
    })
  }
  const docDefinition = {
    info: {
      title: 'Certificate of Recognition',
      author: 'Chisae LIM',
      subject: 'Certificate of Recognition',
      keywords: 'Certificate of Recognition',
    },
    header: [
      {
        columns: [
          {
            width: '*',
            text: ''
          },
          {
            width: '45%',
            stack: [
              {
                text: 'ព្រះរាជាណាចក្រកម្ពុជា',
                style: 'header_kh',
              },
              {
                text: 'KINGDOM OF CAMBODIA',
                style: 'header_en',
              },
              {
                text: 'ជាតិ សាសនា ព្រះមហាក្សត្រ',
                style: 'header_kh',
                font: 'KhmerOSBattambong',
                bold: true
              },
              {
                text: 'NATION RELIGION KING',
                style: 'header_en',
                bold: false,
              },
              {
                image: 'element1.png',
                width: 150,
                margin: [0, -25, 0, -25]
              },

            ],
            alignment: 'center',
            margin: [0, 65, 0, 0]
          }
        ],
      },
      {
        columns: [
          {
            width: '50%',
            stack: [
              {
                text: 'ក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ',
                style: 'header_kh',
              },
              {
                text: 'MINISTRY OF LABOUR AND VOCATIONAL TRAINING',
                style: 'header_en',
              },
              {
                image: 'element1.png',
                width: 150,
                margin: [0, -25, 0, -25]
              },
            ],
            alignment: 'center',
            margin: [0, -45, 0, 0]
          }
        ],
      },
      {
        stack: [
          {
            text: 'វិញ្ញាបនបត្រទទួលស្គាល់ការសិក្សា',
            style: 'header_kh',
            fontSize: 13,
          },
          {
            text: 'CERTIFICATE OF RECOGNITION OF PRIOR LEARNING',
            style: 'header_en',
          },
          {
            text: 'វិទ្យាស្ថានជាតិ',
            style: 'header_kh',
          },
          {
            text: 'INSTITUTE OF CAMBODIA',
            style: 'header_en',
          },
        ],
        alignment: 'center',
        margin: [0, -5, 0, 0]
      }
    ],
    footer: [
      {
        columns: [
          {
            width: '*',
            text: ''
          },
          {
            width: '56%',
            stack: [
              {
                text: 'ថ្ងៃ..............................ខែ....................ឆ្នាំ..............................ព.ស. ២៥........',
                style: 'body_kh',
              },
              {
                text: 'រាជធានីភ្នំពេញ, ថ្ងៃទី...............ខែ...............ឆ្នាំ២០........',
                style: 'body_kh',
              },
              {
                text: 'នាយកវិទ្យាស្ថាន',
                style: 'header_kh',
                margin: [0, 0, 0, 0]
              },
              {
                text: 'PRESIDENT',
                style: 'header_en',
                bold: true,
              },

            ],
            margin: [0, -10, 0, 0],
            alignment: 'center',
          }
        ],
      },
      {
        text: 'លេខ:...........................',
        style: 'body_kh',
        alignment: 'center',
        margin: [0, -40, 0, 0]
      },
      {
        canvas:
          [{
            type: 'rect',
            x: 842 / 2 - 30,
            y: 10,
            w: 60,
            h: 90,
            lineWidth: 1,
            lineColor: 'black',
          }],
      },
      {
        text: '4 x 6',
        absolutePosition: {
          x: 0, // center horizontally (adjust as needed)
          y: 90 - 10 // center vertically in the rectangle
        },
        alignment: 'center',
        fontSize: 12 // or any size you want
      },
    ],
    styles: {
      header_kh: {
        font: 'KhmerOSMoul',
        fontSize: 11,
      },
      header_en: {
        font: 'Arial',
        fontSize: 10,
        bold: true
      },
      body_en: {
        font: 'Arial',
        fontSize: 9.5,
      },
      body_kh: {
        font: 'KhmerOSBattambong',
        fontSize: 9.5,
      }
    },
    pageSize: 'A4',
    pageOrientation: 'landscape',
    pageMargins: [80, 215, 80, 210],
    content: data,
    // pageBreakBefore: function (currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) {
    //     overWriteColumnStack(currentNode);
    //     return currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0;
    // }
  };
  // const overWriteColumnStack = (node) => {
  //     if ('columns' in node) {
  //         if (node.columns.length === 2 && 'stack' in node.columns[1] && node.columns[1].stack[0].text === '.') {
  //             console.log(node)
  //             const calWidth = node.columns[1]._calcWidth;
  //             const stack1 = node.columns[1].stack[0]._minWidth;
  //             let temp = '';
  //             for (let i = 1; i < calWidth / stack1; i++) {
  //                 temp += '.';
  //             }
  //             node.columns[1].stack[0].text = temp;
  //             console.log(temp)
  //             dots.push(temp);
  //         }
  //     }
  //     console.log(dots)
  // }

  const pdfDocGenerator = pdfMake.createPdf(docDefinition);
  const dataUrl = await pdfDocGenerator.getDataUrl();
  const iframe = document.querySelector('iframe');
  iframe.src = dataUrl;
  $('#PDF-MODAL').modal('show');
}
</script>
```

**Key points:**
- `pdfMake.createPdf(docDefinition)`: Creates a PDF from the document definition object
- The docDefinition includes header, footer, styles, and multi-page content
- Font names reference the mappings defined in `pdfmake.js` (Arial, KhmerOSMoul, KhmerOSBattambong)
- The method generates bilingual certificates with English on the left and Khmer on the right
- `getDataUrl()` converts the PDF to a data URL for inline viewing in an iframe
- The PDF is displayed in a modal with ID `#PDF-MODAL`
- Each student test creates one certificate page; multiple students create multiple pages

---

### Result

After completing these steps:

1. **pdfMake is properly configured** with embedded fonts for multi-language (English and Khmer) support
2. **Custom fonts are available globally** through `window.pdfMake` for any component to use
3. **Font resources are embedded**, eliminating runtime file loading issues or CORS problems
4. **The StudentTest component can generate multi-page certificates** with bilingual content (Khmer and English) rendered correctly in PDF format
5. **Certificates are dynamically generated** based on selected student test records from the database
6. **The application startup is lightweight** because all fonts are pre-bundled (no network requests)
7. **Font definitions are organized logically**: One mapping per language/purpose (Arial for English headings, KhmerOSMoul for Khmer headings, KhmerOSBattambong for Khmer body text)

The pdfMake setup is now fully integrated into the StudentTest component for generating multi-language, multi-page certificates on demand.
