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
