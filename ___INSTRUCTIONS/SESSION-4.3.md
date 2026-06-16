# Building an Advanced Data Table Component with TanStack Vue Table

This session replaces the manual HTML table with a reusable, feature-rich CustomTable component using TanStack Vue Table. You'll install the library, create the component with sorting, filtering, and pagination capabilities, define column configurations with cell renderers, and integrate it into the Test page. The table becomes more powerful with less code.

---

## Step 1 - Run Command: Install TanStack Vue Table

Install the TanStack Vue Table library for advanced table capabilities.

```bash
npm i @tanstack/vue-table@8.21.3
```

**Key points:**
- `@tanstack/vue-table` — headless UI library that handles table logic (sorting, filtering, pagination) without styling.
- Works seamlessly with Vue 3's Composition API.
- Provides a composable that manages all table state and operations.
- Brings zero styling — you control the look by building the template yourself.

---

## Step 2 - Create New: src/components/includes/controls/CustomTable.vue

Create a reusable table component that wraps TanStack Vue Table with Bootstrap styling and features like sorting, filtering, pagination, and cell customization.

**Full file (copyable):**

```vue
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
              :class="{ 'can-sort': header.column.getCanSort() }"
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
    <div class="card-footer clearfix" v-if="!props.maxPageSize">
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
                <li class="paginate_button page-item" :class="{ disabled: !table.getCanPreviousPage() }">
                  <a @click="table.setPageIndex(0)" role="button" tabindex="0" class="page-link"><i
                      class="fas fa-angle-double-left"></i></a>
                </li>
                <li class="paginate_button page-item" :class="{ disabled: !table.getCanPreviousPage() }">
                  <a @click="table.previousPage()" role="button" tabindex="0" class="page-link"><i
                      class="fas fa-angle-left"></i></a>
                </li>

                <li v-if="currentPage > sidePage" class="paginate_button page-item">
                  <a role="button" tabindex="0" class="page-link">...</a>
                </li>
                <template v-if="table.getPageCount() > 0" v-for="index in table.getPageCount()" :key="index">
                  <li v-if="
                    index > currentPage - sidePage && index < currentPage + 2 + sidePage
                  " class="paginate_button page-item" :class="{ active: index - 1 === currentPage }">
                    <a @click="table.setPageIndex(index - 1)" role="button" tabindex="0" class="page-link">{{ index
                    }}</a>
                  </li>
                </template>
                <li v-if="currentPage + 1 < table.getPageCount() - sidePage" class="paginate_button page-item">
                  <a role="button" tabindex="0" class="page-link">...</a>
                </li>

                <li class="paginate_button page-item" :class="{ disabled: !table.getCanNextPage() }">
                  <a @click="table.nextPage()" role="button" tabindex="0" class="page-link"><i
                      class="fas fa-angle-right"></i></a>
                </li>
                <li class="paginate_button page-item" :class="{ disabled: !table.getCanNextPage() }">
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
<style scoped>
.can-sort {
  cursor: pointer;
  user-select: none;
}
</style>
<script setup>
import { computed, onBeforeUpdate, ref, watch } from "vue";
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
  maxPageSize: {
    type: Boolean,
    default: false,
  },
  pageSize: {
    type: Number,
    default: 25,
    validator: (value) => [5, 10, 25, 50, 100, 250].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const sidePage = ref(3);
const sorting = ref([]);
const filter = ref("");
const currentPage = ref(0);
const pageSize = ref(
  props.maxPageSize && props.data.length ? props.data.length : props.pageSize
);
const columns = ref(props.columns);

const table = computed(() =>
  useVueTable({
    data: props.data,
    columns: columns.value,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      get sorting() {
        return sorting.value;
      },
      get globalFilter() {
        return replaceUnicode(filter.value);
      },
    },
    initialState: {
      pagination: {
        pageIndex: currentPage.value,
        pageSize: pageSize.value,
      },
    },
    onSortingChange: (updaterOrValue) => {
      sorting.value =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting.value)
          : updaterOrValue;
    },
  })
);

const showedPage = ref(null);

onBeforeUpdate(() => {
  if (filter.value !== "") {
    if (!showedPage.value) {
      showedPage.value = table.value.getState().pagination.pageIndex;
    }
    if (table.value.getPageCount() <= currentPage.value) {
      currentPage.value = 0;
    } else {
      currentPage.value = table.value.getState().pagination.pageIndex;
    }
  } else {
    if (showedPage.value && showedPage.value !== currentPage.value) {
      currentPage.value = showedPage.value;
      showedPage.value = null;
    } else {
      currentPage.value = table.value.getState().pagination.pageIndex;
    }
  }
  columns.value = [...props.columns];
});

watch([() => props.data, pageSize], (nv, ov) => {
  currentPage.value = 0;
});

function replaceUnicode(text) {
    const salabpi = ["ង", "ញ", "ប", "ម", "យ", "រ", "វ"];
    const treysab = ["ស", "ហ", "អ"];
    const chars = salabpi.concat(treysab);
    const vowels = ["ិ", "ី", "ឹ", "ឺ", "ើ"];
    text = text
        .replaceAll("្" + "ដ", "្ត")
        .replaceAll("ា" + "ំ", "ាំ")
        .replaceAll("េ" + "ី", "ើ")
        .replaceAll("េ" + "ា", "ោ")
        .replaceAll("េ" + "ះ", "េះ")
        .replaceAll("ោ" + "ះ", "ោះ")
        .replaceAll("េ" + "ុ" + "ី", "ុ" + "ើ");
    for (const char of chars) {
        for (const vowel of vowels) {
            let replacementSign = "";
            if (salabpi.includes(char)) {
                replacementSign = "៉";
            } else if (treysab.includes(char)) {
                replacementSign = "៊";
            } else {
                continue;
            }
            const word = char + "ុ" + vowel;
            const replacement = char + replacementSign + vowel;
            text = text.replaceAll(word, replacement);
        }
    }
    return text;
}
</script>
```

**Key points:**
- `<FlexRender>` — TanStack component that renders dynamic column headers and cells from configuration.
- `useVueTable()` — the main composable that manages table state: sorting, filtering, pagination.
- `getCoreRowModel()`, `getPaginationRowModel()`, `getSortedRowModel()`, `getFilteredRowModel()` — row model functions that power each feature.
- `state: { get sorting(), get globalFilter() }` — reactive properties that TanStack reads to filter/sort.
- `onSortingChange` — handler that updates `sorting` ref when user clicks a header.
- `filter` ref — bound to search input; TanStack uses it for global filter.
- `pageSize` ref — user can select rows per page; TanStack respects it.
- Pagination UI — buttons for first/previous/next/last page; clickable page numbers.
- `replaceUnicode()` — Khmer text normalization for accurate filtering (converts diacritic marks to standard form).

---

## Step 3 - Edit: Import CustomTable and Define Column Configuration in Test.vue

Add CustomTable import, import `h` function for rendering, and define the columns array with all table features.

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
            <CustomTable :title="'Test List'" :data="tests" :columns="columns" />
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
import { h, ref, reactive, onMounted } from 'vue';
import { apiGetTestsWithDetails, apiCreateTest, apiReadTest, apiUpdateTest, apiDeleteTest } from '@/functions/api/test';
import { CloseModal, LoadingModal, MessageModal } from "@/functions/swal";
import CustomTable from '@/components/includes/controls/CustomTable.vue';

const tests = ref([]);
const columns = [
  {
    accessorKey: 'name_kh',
    header: 'Name (Khmer)',
  },
  {
    accessorKey: 'name_en',
    header: 'Name (English)',
  },
  {
    accessorKey: 'short_name',
    header: 'Short Name (English)',
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
          onClick: () => showModal(),
          class: 'btn btn-sm btn-success ml-3'
        },
        'Create New'
      )
    ],
    cell: ({
      row
    }) => [
        // delete btn
        h('button',
          {
            onClick: () => removeTest(row.original.id),
            class: 'btn btn-sm btn-outline-danger mx-1'
          },
          h('i', { class: 'fa fa-trash' })
        ),
        // view btn
        h('button',
          {
            onClick: () => viewTest(row.original.id),
            class: 'btn btn-sm btn-secondary mx-1'
          },
          h('i', { class: 'fa fa-eye' })
        ),
      ],
    enableSorting: false,
    enableGlobalFilter: false,
  }
];

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
- `import { h, ... }` — `h` is Vue's hyperscript function for programmatically creating elements.
- `import CustomTable from ...` — import the reusable component.
- Each column object has `accessorKey`, `header`, and optional `cell` function.
- `accessorKey: 'name_kh'` — TanStack uses this to read data from `row.original.name_kh`.
- `accessorFn` — custom function to extract/compute data (used for "Created By" which combines creator.name and created_at).
- `header: 'Text'` — simple string header.
- `header: () => [...]` — function that returns Vue elements; here we render a label + "Create New" button.
- `cell: ({ row }) => [...]` — function that renders the cell content; receives row data and context.
- `h('button', { onClick: ..., class: ... }, 'text')` — render button with event handlers and classes.
- `row.original` — the actual data object for this row.
- `enableSorting: false` — the "Actions" column is not sortable.
- `enableGlobalFilter: false` — the "Actions" column is not searchable.
- `:title` — prop passed to CustomTable for header text.
- `:data="tests"` — prop containing the reactive data array.
- `:columns="columns"` — prop containing the column configuration array.
- All sorting, filtering, pagination, and cell rendering is now handled by CustomTable.
- The template is now much cleaner — one line instead of 30 lines of manual table HTML.

---

## Result

After completing these four steps, you will have:

1. ✓ @tanstack/vue-table installed and ready for use.
2. ✓ A reusable CustomTable component with:
   - Advanced sorting (click headers to sort ascending/descending).
   - Global search/filter (works with Khmer text normalization).
   - Pagination (configurable rows per page: 5, 10, 25, 50, 100, 250, or all).
   - Dynamic page number buttons with smart ellipsis.
   - Page state display ("Page 1 of 5 - 47 results").
3. ✓ Column configuration with mixed data display (simple fields and complex nested rendering).
4. ✓ Actions column with View and Delete buttons integrated into header.
5. ✓ Test page simplified — the table is now one component instead of 30 lines of HTML.

The table is now feature-rich and reusable in other pages. Adding sorting, filtering, and pagination required only configuration — no extra code to manage state or UI logic.
