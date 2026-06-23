# Adding Student Profile Display and CRUD Modal Integration

In this session, we enhance the Student Test Management page by adding a student profile card that displays detailed student information. We'll also integrate the StudentModal component to enable full CRUD operations (Create, Read, Update, Delete) for student management directly from the StudentTest page. This provides administrators with a complete interface to manage both student tests and student records in one place.

---

### Step 1 - Edit: Add Student Profile Card UI to StudentTest Component

First, we add a visually appealing student profile card to the StudentTest component. This card displays the selected student's photo, names (in Khmer and English), gender, date of birth, and phone number. It also includes action buttons for adding, updating, and deleting students.

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
  <StudentModal ref="StudentModalRef" :onCreated="onStudentCreated" :onUpdated="onStudentUpdated"
    :onDeleted="onStudentDeleted" />
</template>
<script setup>
import emptyImage from '@/assets/images/emptyImage.png';
import moment from 'moment';
import { h, ref, reactive, onMounted, watch, computed } from 'vue';
import { CloseModal, LoadingModal, MessageModal } from "@/functions/swal";
import CustomTable from '@/components/includes/controls/CustomTable.vue';
import { apiGetStudentTestsWithDetailsByIssuedDate, apiCreateStudentTest, apiUpdateStudentTest, apiReadStudentTest, apiDeleteStudentTest, apiChangeStudentTestStatus } from '@/functions/api/student-test';
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

</script>
```

**Key points:**
- **Student Profile Card**: Uses Bootstrap grid layout (col-md-6) to display a profile photo on the left and student details on the right
- **Profile Image**: `:src="selectedStudent?.photo || emptyImage"` displays the student photo or a default empty image with the `img-circle` class for a circular avatar
- **Student Names**: Shows both Khmer (`name_kh`) and English (`name_en`) names with nullish coalescing (`??`) to display dashes if data is missing
- **Student Details List**: Uses Bootstrap `list-group` to display gender (ភេទ), date of birth (ថ្ងៃខែឆ្នាំកំណើត), and phone number (លេខទូរស័ព្ទ)
- **CRUD Buttons**: Three buttons trigger StudentModal actions:
  - "Add New" (`showModal`): Always enabled, opens the StudentModal for creating a new student
  - "Update" (`viewStudent`): Disabled when no student is selected (`:disabled="!selectedStudent"`), opens StudentModal for editing
  - "Delete" (`removeStudent`): Disabled when no student is selected, triggers delete confirmation in StudentModal
- **StudentModal Component**: Imported at the top with `import StudentModal from '@/components/includes/modals/StudentModal.vue'`
- **StudentModalRef**: Uses Vue's `ref()` to create a template reference that allows calling methods on the StudentModal component
- **Callback Functions**: Three functions handle updates when StudentModal performs CRUD operations:
  - `onStudentCreated()`: Adds the new student to the students list and selects it
  - `onStudentUpdated()`: Updates the student in the list and keeps it selected
  - `onStudentDeleted()`: Removes the student from the list and clears selection if the deleted student was selected

---

### Result

The StudentTest page now displays a comprehensive student profile card that shows all relevant student information when a student is selected from the dropdown. Administrators can click the CRUD action buttons to create new students, update existing student information, or delete students without leaving the StudentTest page. The student list automatically updates when operations complete, providing a seamless management experience.

