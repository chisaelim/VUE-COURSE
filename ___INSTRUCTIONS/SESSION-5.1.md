# Integrating a Student Registration Modal in Vue 3

This session focuses on adding a "Register New Student" feature. You'll install a date picker component, create a reusable student modal with a registration form, and integrate it into the Students page. This modal will allow users to input student details, including their date of birth, through a clean and interactive UI.

---

## Step 1 - Run Command: Install Date Picker Library

Install `@vuepic/vue-datepicker`, a lightweight and feature-rich date picker component for Vue 3.

```bash
npm install @vuepic/vue-datepicker
```

**Key points:**
- This command adds the date picker library to the project's dependencies.
- We will use this component to create a user-friendly date-of-birth selector in the student registration form.

---

## Step 2 - Create New: src/components/includes/modals/StudentModal.vue

Create a new modal component that contains the form for adding or editing student information.

**Full file (copyable):**

```vue
<template>
  <div class="modal fade" id="STUDENT-MODAL" data-backdrop="static" data-keyboard="false" tabindex="-1">
    <div class="modal-dialog modal-xl">
      <form>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Student Management</h5>
            <button type="button" class="close" @click="hideModal">
              <span>×</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-12">
                <div class="row">
                  <div class="col-lg-3">

                  </div>
                  <div class="col-lg-9">
                    <div class="row">
                      <div class="form-group col-lg-6">
                        <label>Name (Khmer)</label>
                        <input v-model="studentObj.name_kh" type="text" class="form-control"
                          :class="{ 'is-invalid': !!studentErrObj.name_kh }">
                        <div class="invalid-feedback">
                          {{ studentErrObj.name_kh }}
                        </div>
                      </div>
                      <div class="form-group col-lg-6">
                        <label>Name (Latin)</label>
                        <input v-model="studentObj.name_en" type="text" class="form-control"
                          :class="{ 'is-invalid': !!studentErrObj.name_en }">
                        <div class="invalid-feedback">
                          {{ studentErrObj.name_en }}
                        </div>
                      </div>

                    </div>
                    <div class="row">

                      <div class="form-group col-lg-6">
                        <label>Date of Birth</label>
                        <VueDatePicker v-model="studentObj.dob" :formats="{ input: 'dd-MM-yyyy' }"
                          model-type="dd-MM-yyyy" :time-config="{ enableTimePicker: false }"
                          :class="{ 'is-invalid': !!studentErrObj.dob }" />
                        <div class="invalid-feedback">
                          {{ studentErrObj.dob }}
                        </div>
                      </div>
                      <div class="form-group col-lg-6">
                        <label>Phone Number</label>
                        <div class="input-group">
                          <input v-model="studentObj.phone" type="text" class="form-control"
                            :class="{ 'is-invalid': !!studentErrObj.phone }">
                          <div class="input-group-append">
                            <div class="input-group-text">
                              <span class="fas fa-phone"></span>
                            </div>
                          </div>
                          <div class="invalid-feedback">
                            {{ studentErrObj.phone }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer justify-content-between">
            <button type="button" class="btn btn-secondary" @click="hideModal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import $ from 'jquery';
import { reactive, onMounted } from 'vue';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const studentObj = reactive({
  id: null,
  name_en: "",
  name_kh: "",
  dob: "",
  home_no: "",
  street_no: "",
  phone: "",
  photo: "",
  gender_id: 1,
  nationality_id: 1,
  ethnicity_id: 1,
  religion_id: 1,
  pob_province_id: null,
  pob_district_id: null,
  pob_commune_id: null,
  pob_village_id: null,
  por_province_id: null,
  por_district_id: null,
  por_commune_id: null,
  por_village_id: null,
});
const studentErrObj = reactive({
  name_en: "",
  name_kh: "",
  dob: "",
  home_no: "",
  street_no: "",
  phone: "",
  photo: "",
  gender_id: "",
  nationality_id: "",
  ethnicity_id: "",
  religion_id: "",
  pob_province_id: "",
  pob_district_id: "",
  pob_commune_id: "",
  pob_village_id: "",
  por_province_id: "",
  por_district_id: "",
  por_commune_id: "",
  por_village_id: "",
});

const defaultStudentObj = JSON.parse(JSON.stringify(studentObj));
const defaultStudentErrObj = JSON.parse(JSON.stringify(studentErrObj));

function resetAllState() {
  Object.assign(studentObj, defaultStudentObj);
  Object.assign(studentErrObj, defaultStudentErrObj);
}

onMounted(async () => {
  $('#STUDENT-MODAL').on('hide.bs.modal', function () {
    resetAllState();
  });
});

const showModal = () => $('#STUDENT-MODAL').modal('show');
const hideModal = () => $('#STUDENT-MODAL').modal('hide');

defineExpose({
  showModal,
  hideModal
});
</script>
```

**Key points:**
- **Bootstrap Modal Structure**: The component uses standard Bootstrap 4 modal markup (`modal`, `modal-dialog`, `modal-content`, etc.).
- **Form Inputs**: `v-model` binds form fields to the `studentObj` reactive object.
- **Date Picker**: `<VueDatePicker>` is used for the "Date of Birth" field.
  - `model-type="dd-MM-yyyy"` ensures the date is stored in the desired format.
  - `:time-config="{ enableTimePicker: false }"` disables the time selection part of the picker.
- **Validation**: Dynamic classes (`:class="{ 'is-invalid': !!studentErrObj.name_kh }"`) show validation errors based on the `studentErrObj` object.
- **State Management**: `studentObj` holds the form data, and `studentErrObj` holds validation messages. `resetAllState` clears the form when the modal is hidden.
- **jQuery Integration**: `$` from jQuery is used to programmatically show and hide the Bootstrap modal.
- **`defineExpose`**: The `showModal` and `hideModal` functions are exposed so the parent component (`Student.vue`) can control the modal.

---

## Step 3 - Edit: src/components/pages/Student.vue

Integrate the new `StudentModal` into the `Student.vue` page and trigger it from the "Register New" button.

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
  <StudentModal ref="StudentModalRef" />
</template>

<script setup>
import { h, ref, onMounted } from 'vue';
import { apiGetStudentsWithDetails } from '@/functions/api/student';
import { CloseModal, LoadingModal, MessageModal } from "@/functions/swal";
import CustomTable from '@/components/includes/controls/CustomTable.vue';
import emptyImage from '@/assets/images/emptyImage.png';
import StudentModal from '@/components/includes/modals/StudentModal.vue';

const StudentModalRef = ref(null);

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
          onClick: () => StudentModalRef.value.showModal(),
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
- **Import Modal**: `import StudentModal from '@/components/includes/modals/StudentModal.vue';` brings the new modal component into the page.
- **Template Reference**: `<StudentModal ref="StudentModalRef" />` adds the modal to the template and assigns it a `ref`.
- **`StudentModalRef`**: `const StudentModalRef = ref(null);` creates a reference to access the modal component's instance.
- **Triggering the Modal**: The `onClick` handler for the "Register New" button is updated to `() => StudentModalRef.value.showModal()`. This calls the `showModal` function exposed by the `StudentModal` component.

---

## Result

After completing these steps, clicking the "Register New" button on the Students page will open a modal with a form to enter new student details. The form includes a date picker for the date of birth, providing a much better user experience than a plain text input. The modal can be closed, and its state will reset automatically.