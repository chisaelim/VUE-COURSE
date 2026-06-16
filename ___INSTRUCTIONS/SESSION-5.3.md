# Implementing Cascading Address Dropdowns in Vue 3

This session implements a common and powerful UI pattern: cascading dropdowns. You will build out the "Place of Birth" (POB) and "Current Address" (POR) sections of the student registration form. When a user selects a province, the district dropdown will automatically populate with the districts for that province. This pattern continues down to the village level, creating an intuitive and efficient user experience for entering addresses.

---

## Step 1 - Create New: `src/functions/api/geo.js`

Create a new API module for fetching geographical data. This separates the logic for handling provinces, districts, communes, and villages from other asset types.

**Full file (copyable):**

```javascript
import axios from 'axios';

const APP_API_URL = import.meta.env.VITE_APP_API_URL;

export function apiGetProvinces() {
  return axios.get(`${APP_API_URL}/provinces`);
}
export function apiGetDistrictsByProvince(id) {
  return axios.get(`${APP_API_URL}/districts/by/province/${id}`);
}
export function apiGetCommunesByDistrict(id) {
  return axios.get(`${APP_API_URL}/communes/by/district/${id}`);
}
export function apiGetVillagesByCommune(id) {
  return axios.get(`${APP_API_URL}/villages/by/commune/${id}`);
}
```

**Key points:**
- **Domain-Specific APIs**: This module is focused solely on geographical data.
- **Parameterized Functions**: Functions like `apiGetDistrictsByProvince(id)` accept an ID to fetch filtered, dependent data, which is the foundation of the cascading effect.

---

## Step 2 - Edit: `src/components/includes/modals/StudentModal.vue`

Update the `StudentModal` to include the address sections and implement the cascading logic using Vue's `watch` function.

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
              <div class="col-12">
                <h6 class="font-weight-bold mt-2">Place of Birth (POB)</h6>
                <div class="row">
                  <div class="form-group col-lg-3">
                    <label>Province / Capital</label>
                    <select v-model="studentObj.pob_province_id" class="form-control"
                      :class="{ 'is-invalid': !!studentErrObj.pob_province_id }">
                      <option :value="null">---none---</option>
                      <option v-for="{ id, name_kh } in provinces" :key="id" :value="id">
                        {{ name_kh }}
                      </option>
                    </select>
                    <div class="invalid-feedback">
                      {{ studentErrObj.pob_province_id }}
                    </div>
                  </div>
                  <div class="form-group col-lg-3">
                    <label>District / Municipality / City</label>
                    <select v-model="studentObj.pob_district_id" class="form-control"
                      :class="{ 'is-invalid': !!studentErrObj.pob_district_id }">
                      <option :value="null">---none---</option>
                      <option v-for="{ id, name_kh } in pobDistricts" :key="id" :value="id">
                        {{ name_kh }}
                      </option>
                    </select>
                    <div class="invalid-feedback">
                      {{ studentErrObj.pob_district_id }}
                    </div>
                  </div>
                  <div class="form-group col-lg-3">
                    <label>Commune / Sangkat</label>
                    <select v-model="studentObj.pob_commune_id" class="form-control"
                      :class="{ 'is-invalid': !!studentErrObj.pob_commune_id }">
                      <option :value="null">---none---</option>
                      <option v-for="{ id, name_kh } in pobCommunes" :key="id" :value="id">
                        {{ name_kh }}
                      </option>
                    </select>
                    <div class="invalid-feedback">
                      {{ studentErrObj.pob_commune_id }}
                    </div>
                  </div>
                  <div class="form-group col-lg-3">
                    <label>Village</label>
                    <select v-model="studentObj.pob_village_id" class="form-control"
                      :class="{ 'is-invalid': !!studentErrObj.pob_village_id }">
                      <option :value="null">---none---</option>
                      <option v-for="{ id, name_kh } in pobVillages" :key="id" :value="id">
                        {{ name_kh }}
                      </option>
                    </select>
                    <div class="invalid-feedback">
                      {{ studentErrObj.pob_village_id }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-12">
                <h6 class="font-weight-bold mt-2">Current Address (POR)</h6>
                <div class="row">
                  <div class="form-group col-lg-3">
                    <label>Province / Capital</label>
                    <select v-model="studentObj.por_province_id" class="form-control"
                      :class="{ 'is-invalid': !!studentErrObj.por_province_id }">
                      <option :value="null">---none---</option>
                      <option v-for="{ id, name_kh } in provinces" :key="id" :value="id">
                        {{ name_kh }}
                      </option>
                    </select>
                    <div class="invalid-feedback">
                      {{ studentErrObj.por_province_id }}
                    </div>
                  </div>
                  <div class="form-group col-lg-3">
                    <label>District / Municipality / City</label>
                    <select v-model="studentObj.por_district_id" class="form-control"
                      :class="{ 'is-invalid': !!studentErrObj.por_district_id }">
                      <option :value="null">---none---</option>
                      <option v-for="{ id, name_kh } in porDistricts" :key="id" :value="id">
                        {{ name_kh }}
                      </option>
                    </select>
                    <div class="invalid-feedback">
                      {{ studentErrObj.por_district_id }}
                    </div>
                  </div>
                  <div class="form-group col-lg-3">
                    <label>Commune / Sangkat</label>
                    <select v-model="studentObj.por_commune_id" class="form-control"
                      :class="{ 'is-invalid': !!studentErrObj.por_commune_id }">
                      <option :value="null">---none---</option>
                      <option v-for="{ id, name_kh } in porCommunes" :key="id" :value="id">
                        {{ name_kh }}
                      </option>
                    </select>
                    <div class="invalid-feedback">
                      {{ studentErrObj.por_commune_id }}
                    </div>
                  </div>
                  <div class="form-group col-lg-3">
                    <label>Village</label>
                    <select v-model="studentObj.por_village_id" class="form-control"
                      :class="{ 'is-invalid': !!studentErrObj.por_village_id }">
                      <option :value="null">---none---</option>
                      <option v-for="{ id, name_kh } in porVillages" :key="id" :value="id">
                        {{ name_kh }}
                      </option>
                    </select>
                    <div class="invalid-feedback">
                      {{ studentErrObj.por_village_id }}
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="form-group col-lg-6">
                    <label>House Number</label>
                    <input v-model="studentObj.home_no" type="text" class="form-control"
                      :class="{ 'is-invalid': !!studentErrObj.home_no }">
                    <div class="invalid-feedback">
                      {{ studentErrObj.home_no }}
                    </div>
                  </div>
                  <div class="form-group col-lg-6">
                    <label>Street Number</label>
                    <input v-model="studentObj.street_no" type="text" class="form-control"
                      :class="{ 'is-invalid': !!studentErrObj.street_no }">
                    <div class="invalid-feedback">
                      {{ studentErrObj.street_no }}
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
import { ref, reactive, onMounted, watch } from 'vue';
import { CloseModal, LoadingModal, MessageModal } from "@/functions/swal";
import { apiGetAllGenders, apiGetAllNationalities, apiGetAllEthnicities, apiGetAllReligions } from '@/functions/api/asset';
import { apiGetProvinces, apiGetDistrictsByProvince, apiGetCommunesByDistrict, apiGetVillagesByCommune } from '@/functions/api/geo';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const genders = ref([]);
const nationalities = ref([]);
const ethnicities = ref([]);
const religions = ref([]);

const provinces = ref([]);

const pobDistricts = ref([]);
const pobCommunes = ref([]);
const pobVillages = ref([]);

const porDistricts = ref([]);
const porCommunes = ref([]);
const porVillages = ref([]);

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
      generateProvinces()
    ]);
    return CloseModal();
  } catch (error) {
    return MessageModal({ icon: "error", title: "Error", text: error.response?.data?.message || error.message });
  }
});

watch(() => studentObj.pob_province_id, async (nv, ov) => {
  pobDistricts.value = [];
  if (nv) {
    const response = await generateDistrictsByProvince(nv);
    pobDistricts.value = response.data.districts;
  };
  if (!pobDistricts.value.find(d => d.id === studentObj.pob_district_id)) {
    studentObj.pob_district_id = null;
  }
});
watch(() => studentObj.pob_district_id, async (nv, ov) => {
  pobCommunes.value = [];
  if (nv) {
    const response = await generateCommunesByDistrict(nv);
    pobCommunes.value = response.data.communes;
  };
  if (!pobCommunes.value.find(c => c.id === studentObj.pob_commune_id)) {
    studentObj.pob_commune_id = null;
  }
});
watch(() => studentObj.pob_commune_id, async (nv, ov) => {
  pobVillages.value = [];
  if (nv) {
    const response = await generateVillagesByCommune(nv);
    pobVillages.value = response.data.villages;
  };
  if (!pobVillages.value.find(v => v.id === studentObj.pob_village_id)) {
    studentObj.pob_village_id = null;
  }
});

// POR geography watchers
watch(() => studentObj.por_province_id, async (nv, ov) => {
  porDistricts.value = [];
  if (nv) {
    const response = await generateDistrictsByProvince(nv);
    porDistricts.value = response.data.districts;
  };
  if (!porDistricts.value.find(d => d.id === studentObj.por_district_id)) {
    studentObj.por_district_id = null;
  }
});
watch(() => studentObj.por_district_id, async (nv, ov) => {
  porCommunes.value = [];
  if (nv) {
    const response = await generateCommunesByDistrict(nv);
    porCommunes.value = response.data.communes;
  };
  if (!porCommunes.value.find(c => c.id === studentObj.por_commune_id)) {
    studentObj.por_commune_id = null;
  }
});
watch(() => studentObj.por_commune_id, async (nv, ov) => {
  porVillages.value = [];
  if (nv) {
    const response = await generateVillagesByCommune(nv);
    porVillages.value = response.data.villages;
  };
  if (!porVillages.value.find(v => v.id === studentObj.por_village_id)) {
    studentObj.por_village_id = null;
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
async function generateProvinces() {
  const response = await apiGetProvinces();
  provinces.value = response.data.provinces;
}
async function generateDistrictsByProvince(id) {
  const response = await apiGetDistrictsByProvince(id);
  return response;
}
async function generateCommunesByDistrict(id) {
  const response = await apiGetCommunesByDistrict(id);
  return response;
}
async function generateVillagesByCommune(id) {
  const response = await apiGetVillagesByCommune(id);
  return response;
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
- **New Address Sections**: The template now includes two new sections, "Place of Birth (POB)" and "Current Address (POR)", each with four dropdowns (Province, District, Commune, Village).
- **Separate `ref`s for POB/POR**: `pobDistricts` and `porDistricts` (and so on) are separate reactive arrays. This is crucial because POB and POR are independent of each other.
- **`watch` for Cascading**: The core of the feature is the `watch` function from Vue's Composition API.
  - `watch(() => studentObj.pob_province_id, ...)`: This watcher tracks changes to the selected province ID for the POB.
  - When the province changes, it fetches the corresponding districts and populates `pobDistricts.value`.
  - It also resets the selected district, commune, and village to `null` to prevent invalid address combinations.
- **Chained Watchers**: This pattern is repeated for districts (to fetch communes) and communes (to fetch villages), creating a "chain reaction" that powers the cascading effect.
- **Initial Data**: The `onMounted` hook is updated to also fetch the list of all provinces when the component is first created.

---

## Result

The student registration form is now equipped with fully functional cascading dropdowns for both Place of Birth and Current Address. This guides the user through the process of selecting a valid address, significantly improving data accuracy and user experience. The use of `watch` provides a clean, declarative way to handle the complex dependencies between the address fields.