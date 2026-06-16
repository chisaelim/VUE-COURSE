<template>
  <div class="card">
    <div class="card-header">
      <div class="d-flex justify-content-between">
        <h3 class="card-title my-auto">{{ props.title }}</h3>
        <div class="d-flex justify-content-end">
          <div class="card-tools">
            <div class="input-group input-group">
              <input v-model="filter" type="text" class="form-control float-right" :placeholder="'Search'" />
              <div class="input-group-append">
                <button class="btn btn-default">
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card-body table-responsive p-0">
      <table class="text-nowrap table-head-fixed table-valign-middle table table-head-fixed table-bordered table-hover">
        <thead class="text-center">
          <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <th v-for="header in headerGroup.headers" :key="header.id"
              @click="header.column.getToggleSortingHandler()?.($event)">
              <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
              {{ { asc: " ↓", desc: " ↑" }[header.column.getIsSorted()] }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in table.getRowModel().rows" :key="row.id">
            <td v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="card-footer clearfix">
      <div class="row">
        <div class="col-md text-nowrap mb-2">
          <div class="d-flex justify-content-between">
            <div class="col-auto my-auto">
              <span>Page {{ table.getState().pagination.pageIndex + 1 }} of
                {{ table.getPageCount() }} -
                {{ table.getFilteredRowModel().rows.length }}
                {{
                  table.getFilteredRowModel().rows.length !== 1 ? "results" : "result"
                }}</span>
            </div>
            <div class="col-auto">
              <div class="input-group input-group">
                <div class="input-group-prepend">
                  <button class="btn btn-default">Show</button>
                </div>
                <select v-model="pageSize" class="form-control">
                  <option v-for="size in [5, 10, 25, 50, 100, 250]" :key="size" :value="size">
                    {{ size }}
                  </option>

                  <option :value="table.getFilteredRowModel().rows.length">Max</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-auto">
          <div class="d-flex justify-content-center">
            <div class="dataTables_paginate paging_simple_numbers">
              <ul class="pagination">
                <li class="paginate_button page-item">
                  <a @click="table.setPageIndex(0)" role="button" tabindex="0" class="page-link"><i
                      class="fas fa-angle-double-left"></i></a>
                </li>
                <li class="paginate_button page-item">
                  <a @click="table.previousPage()" role="button" tabindex="0" class="page-link"><i
                      class="fas fa-angle-left"></i></a>
                </li>

                <template v-if="table.getPageCount() > 0" v-for="index in table.getPageCount()" :key="index">
                  <li class="paginate_button page-item"
                    :class="{ active: index - 1 === table.getState().pagination.pageIndex }">
                    <a @click="table.setPageIndex(index - 1)" role="button" tabindex="0" class="page-link">{{ index
                      }}</a>
                  </li>
                </template>

                <li class="paginate_button page-item">
                  <a @click="table.nextPage()" role="button" tabindex="0" class="page-link"><i
                      class="fas fa-angle-right"></i></a>
                </li>
                <li class="paginate_button page-item">
                  <a @click="table.setPageIndex(table.getPageCount() - 1)" role="button" tabindex="0"
                    class="page-link"><i class="fas fa-angle-double-right"></i></a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, ref, watch } from "vue";
import {
  useVueTable,
  FlexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/vue-table";

const props = defineProps({
  title: String,
  data: Array,
  columns: Array,
});

const filter = ref("");
const currentPage = ref(0);
const pageSize = ref(10);

const table = computed(() =>
  useVueTable({
    data: props.data,
    columns: props.columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      get globalFilter() {
        return filter.value;
      },
    },
    initialState: {
      pagination: {
        pageIndex: currentPage.value,
        pageSize: pageSize.value,
      },
    },
  })
);

watch([() => props.data, pageSize], (nv, ov) => {
  currentPage.value = 0;
});
</script>
