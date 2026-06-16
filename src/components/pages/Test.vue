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
                  <th>Actions <button class="btn btn-sm btn-primary">Add</button></th>
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
                    <button class="mx-1 btn btn-sm btn-info">View</button>
                    <button class="mx-1 btn btn-sm btn-danger">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { apiGetTestsWithDetails } from '@/functions/api/test';
import { CloseModal, LoadingModal, MessageModal } from "@/functions/swal";

const tests = ref([]);

onMounted(async () => {
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
</script>
