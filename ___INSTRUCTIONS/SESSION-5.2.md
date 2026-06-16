# Populating Dropdowns with Master Data in Vue 3

This session enhances the student registration form by fetching and displaying master data (like genders, nationalities, etc.) in dropdown menus. You'll create a new API module for these assets and then modify the `StudentModal` to fetch this data on load and populate `<select>` elements, making the form more dynamic and user-friendly.

---

## Step 1 - Create New: `src/functions/api/asset.js`

Create a new API module dedicated to fetching asset or master data. This keeps data-fetching logic organized and separate from other concerns.

**Full file (copyable):**

```javascript
import axios from 'axios';

const APP_API_URL = import.meta.env.VITE_APP_API_URL;

export function apiGetAllGenders() {
  return axios.get(`${APP_API_URL}/assets/all/genders`);
}
export function apiGetAllEthnicities() {
  return axios.get(`${APP_API_URL}/assets/all/ethnicities`);
}
export function apiGetAllNationalities() {
  return axios.get(`${APP_API_URL}/assets/all/nationalities`);
}
export function apiGetAllReligions() {
  return axios.get(`${APP_API_URL}/assets/all/religions`);
}
```

**Key points:**
- **Centralized API Calls**: This file groups all functions related to fetching "asset" data.
- **Clear Naming**: Functions are named descriptively (e.g., `apiGetAllGenders`), making their purpose obvious.
- **Environment Variable**: Uses `VITE_APP_API_URL` for the base API path, ensuring consistency and easy configuration.

---

## Step 2 - Edit: `src/components/includes/modals/StudentModal.vue`

Update the `StudentModal` to fetch the master data and use it to populate dropdown menus for Gender, Ethnicity, Nationality, and Religion.

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
                      <div class="form-group col-lg-4">
                        <label>Gender</label>
                        <select v-model="studentObj.gender_id" class="form-control"
                          :class="{ 'is-invalid': !!studentErrObj.gender_id }">
                          <option v-for="{ id, gd_kh_full } in genders" :key="id" :value="id">
                            {{ gd_kh_full }}
                          </option>
                        </select>
                        <div class="invalid-feedback">
                          {{ studentErrObj.gender_id }}
                        </div>
                      </div>
                      <div class="form-group col-lg-4">
                        <label>Date of Birth</label>
                        <VueDatePicker v-model="studentObj.dob" :formats="{ input: 'dd-MM-yyyy' }"
                          model-type="dd-MM-yyyy" :time-config="{ enableTimePicker: false }"
                          :class="{ 'is-invalid': !!studentErrObj.dob }" />
                        <div class="invalid-feedback">
                          {{ studentErrObj.dob }}
                        </div>
                      </div>
                      <div class="form-group col-lg-4">
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
                    <div class="row">
                      <div class="form-group col-lg-4">
                        <label>Ethnicity</label>
                        <select v-model="studentObj.ethnicity_id" class="form-control"
                          :class="{ 'is-invalid': !!studentErrObj.ethnicity_id }">
                          <option v-for="{ id, eth_kh } in ethnicities" :key="id" :value="id">
                            {{ eth_kh }}
                          </option>
                        </select>
                        <div class="invalid-feedback">
                          {{ studentErrObj.ethnicity_id }}
                        </div>
                      </div>
                      <div class="form-group col-lg-4">
                        <label>Nationality</label>
                        <select v-model="studentObj.nationality_id" class="form-control"
                          :class="{ 'is-invalid': !!studentErrObj.nationality_id }">
                          <option v-for="{ id, nat_kh } in nationalities" :key="id" :value="id">
                            {{ nat_kh }}
                          </option>
                        </select>
                        <div class="invalid-feedback">
                          {{ studentErrObj.nationality_id }}
                        </div>
                      </div>
                      <div class="form-group col-lg-4">
                        <label>Religion</label>
                        <select v-model="studentObj.religion_id" class="form-control"
                          :class="{ 'is-invalid': !!studentErrObj.religion_id }">
                          <option v-for="{ id, rel_kh } in religions" :key="id" :value="id">
                            {{ rel_kh }}
                          </option>
                        </select>
                        <div class="invalid-feedback">
                          {{ studentErrObj.religion_id }}
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
import { ref, reactive, onMounted } from 'vue';
import { CloseModal, LoadingModal, MessageModal } from "@/functions/swal";
import { apiGetAllGenders, apiGetAllNationalities, apiGetAllEthnicities, apiGetAllReligions } from '@/functions/api/asset';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const genders = ref([]);
const nationalities = ref([]);
const ethnicities = ref([]);
const religions = ref([]);

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
  try {
    LoadingModal();
    await Promise.all([
      generateGenders(),
      generateNationalities(),
      generateEthnicities(),
      generateReligions(),
    ]);
    return CloseModal();
  } catch (error) {
    return MessageModal({ icon: "error", title: "Error", text: error.response?.data?.message || error.message });
  }
});

async function generateGenders() {
  const response = await apiGetAllGenders();
  genders.value = response.data.genders;
}
async function generateNationalities() {
  const response = await apiGetAllNationalities();
  nationalities.value = response.data.nationalities;
}
async function generateEthnicities() {
  const response = await apiGetAllEthnicities();
  ethnicities.value = response.data.ethnicities;
}
async function generateReligions() {
  const response = await apiGetAllReligions();
  religions.value = response.data.religions;
}

const showModal = () => $('#STUDENT-MODAL').modal('show');
const hideModal = () => $('#STUDENT-MODAL').modal('hide');

defineExpose({
  showModal,
  hideModal,
});
</script>
```

**Key points:**
- **Dynamic Dropdowns**: New `<select>` elements are added for Gender, Ethnicity, Nationality, and Religion.
- **`v-for` for Options**: Each `<select>` uses a `v-for` loop to dynamically generate `<option>` tags from the data fetched from the API (e.g., `v-for="{ id, gd_kh_full } in genders"`).
- **Data Fetching on Mount**: The `onMounted` hook now orchestrates fetching all required master data when the component is created.
- **`Promise.all`**: Using `Promise.all` allows all four API calls to run in parallel, which is more efficient than running them sequentially. The loading modal is shown before they start and closed after they all complete.
- **Reactive Data**: New `ref`s (`genders`, `nationalities`, etc.) are created to hold the arrays of data for the dropdowns, ensuring the component updates when the data arrives.

---

## Result

After these changes, the student registration modal is significantly more powerful. Instead of requiring users to know and enter numeric IDs, it presents them with clear, human-readable dropdown menus for selecting gender, ethnicity, nationality, and religion. The data is fetched dynamically, ensuring the options are always up-to-date with the backend.