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
</template>

<script setup>
import { h, ref, onMounted } from 'vue';
import { apiGetStudentsWithDetails } from '@/functions/api/student';
import { CloseModal, LoadingModal, MessageModal } from "@/functions/swal";
import CustomTable from '@/components/includes/controls/CustomTable.vue';
import emptyImage from '@/assets/images/emptyImage.png';

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
          onClick: () => { },
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
