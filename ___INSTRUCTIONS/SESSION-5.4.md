# Integrating an Image Cropper in a Vue 3 Project

This guide walks through adding an image cropping and uploading feature to a student management system. We'll use the `vue-advanced-cropper` library to provide a user-friendly way to handle profile pictures.

---

### Step 1 - Run Command: Install Dependencies

First, we need to add the `vue-advanced-cropper` package to our project.

```bash
npm install vue-advanced-cropper
```

**Key points:**
- This command downloads and installs the specified package from the npm registry.
- It also adds the package to our project's `package.json` and `package-lock.json` files, ensuring that it's part of the project's dependencies.

---

### Step 2 - Create New: The Cropper Modal Component

Next, we'll create a reusable component to handle the image cropping functionality. This component will include the cropper UI inside a modal dialog.

**File:** `src/components/includes/controls/CropperModal.vue`

```vue
<template>
  <div class="d-flex flex-column align-items-center m-3">
    <img v-bind="$attrs" :src="model || emptyImage" class="profile-user-img img-fluid" alt="picture" />
    <input :disabled="disabled" @change="onImageChanged($event)" type="file" class="d-none"
      :class="{ 'is-invalid': modelError !== null }" :accept="props.extensions.map(ext => `.${ext}`).join(', ')"
      :id="`file-input-${props.id}`" />
    <div class="invalid-feedback text-center">{{ modelError }}</div>
    <div class="mt-1">
      <label :for="disabled ? '' : `file-input-${props.id}`">
        <a type="button" :class="{ disabled: disabled }" class="m-1 btn btn-primary btn-sm" title="upload image"><i
            class="fas fa-upload"></i></a>
      </label>
      <a type="button" :class="{ disabled: disabled }" @click="onImageRemove()" class="m-1 btn btn-danger btn-sm"
        title="delete image"><i class="fas fa-trash"></i></a>
      <a type="button" :class="{ disabled: disabled }" @click="onImageReset()" class="m-1 btn btn-secondary btn-sm"
        title="reset image"><i class="fas fa-undo-alt"></i></a>
    </div>
  </div>
  <div class="modal fade" :id="props.id" data-backdrop="static" data-keyboard="false" tabindex="-1">
    <div class="modal-dialog modal-lg modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Crop Image Modal</h5>
          <button type="button" class="close" @click="hideCropperModal">
            <span>×</span>
          </button>
        </div>
        <div class="modal-body">
          <Cropper ref="cropperRef" class="cropper" :src="cropSrc"
            :stencil-props="{ aspectRatio: props.width / props.height }" @change="onCropChange" />
        </div>
        <div class="modal-footer justify-content-between">
          <button type="button" @click="hideCropperModal" class="btn btn-secondary">
            Cancel
          </button>
          <button @click="onImageCropped()" type="button" class="btn btn-primary">
            Crop
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import $ from 'jquery';
import { ref, onMounted } from 'vue';
import emptyImage from "@/assets/images/emptyImage.png";
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css';

const model = defineModel({ required: true });
const current = defineModel("current", { required: false, default: null });
const modelError = defineModel("error", { required: false, default: null });

const props = defineProps({
  id: {
    type: String,
    default: () => `CROPPER-MODAL-${Math.random().toString(36).substring(2, 9)}`,
  },
  width: {
    type: Number,
    default: 454,
  },
  height: {
    type: Number,
    default: 454,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  extensions: {
    type: Array,
    default: () => ['jpg', 'jpeg', 'png'],
  },
});
const cropSrc = ref(null);
const cropperRef = ref(null);
let croppedCanvas = null;
onMounted(() => {
  $(`#${props.id}`)
    .on("show.bs.modal", function (e) {
      e.stopPropagation();
    })
    .on("hide.bs.modal", function (e) {
      croppedCanvas = null;
      e.stopPropagation();
    })
    .on("hidden.bs.modal", function (e) {
      cropSrc.value = null;
      e.stopPropagation();
    });
});
const onCropChange = ({ canvas }) => {
  croppedCanvas = canvas;
};
const onImageChanged = (e) => {
  const files = e.target.files;
  if (files && files.length > 0) {
    const fileName = files[0].name;
    const idxDot = fileName.lastIndexOf(".") + 1;
    const extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
    if (!props.extensions.includes(extFile)) {
      return (modelError.value = `Only ${props.extensions.join('/')} files are allowed!`);
    }
    const reader = new FileReader();
    reader.onloadend = function () {
      cropSrc.value = reader.result;
      showCropperModal();
    };
    reader.readAsDataURL(files[0]);
    modelError.value = null;
    e.target.value = null;
  }
};
const onImageCropped = () => {
  if (croppedCanvas) {
    const canvas = document.createElement('canvas');
    canvas.width = props.width;
    canvas.height = props.height;
    canvas.getContext('2d').drawImage(croppedCanvas, 0, 0, props.width, props.height);
    model.value = canvas.toDataURL('image/png');
  }
  hideCropperModal();
};
const onImageRemove = () => {
  model.value = null;
};
const onImageReset = () => {
  model.value = current.value;
};
const showCropperModal = () => $(`#${props.id}`).modal("show");
const hideCropperModal = () => $(`#${props.id}`).modal("hide");
</script>
```

**Key points:**
- **`defineModel`**: We use `defineModel` to create two-way bindings for the image data (`model`), the original image data (`current`), and any validation errors (`error`).
- **`Cropper` component**: This is the main component from `vue-advanced-cropper`. We set its `src` to the image selected by the user and configure the cropping area with `stencil-props`.
- **File Input**: A hidden file input is used to trigger the file selection dialog. We check for valid file extensions.
- **`FileReader`**: This is a standard browser API used to read the selected image file as a data URL, which can then be passed to the cropper.
- **jQuery for Modals**: We use jQuery to programmatically show and hide the Bootstrap modal.
- **Canvas API**: After cropping, we use an HTML `<canvas>` element to draw the cropped image, resize it to our desired dimensions, and then get the result as a base64 data URL.

---

### Step 3 - Edit: Integrating the Cropper into the Student Modal

Now, we'll update the `StudentModal` to use our new `CropperModal` component and handle the image data during form submission.

**File:** `src/components/includes/modals/StudentModal.vue`

```vue
<template>
  <div class="modal fade" id="STUDENT-MODAL" data-backdrop="static" data-keyboard="false" tabindex="-1">
    <div class="modal-dialog modal-xl">
      <form @submit.prevent="saveStudent()">
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
                    <CropperModal v-model="studentObj.photo" v-model:current="currentImage"
                      v-model:error="studentErrObj.photo" :width="454" :height="454" />
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
import Swal from 'sweetalert2';
import { ref, reactive, onMounted, watch } from 'vue';
import { apiCreateStudent, apiReadStudent, apiUpdateStudent, apiDeleteStudent } from '@/functions/api/student';
import { CloseModal, LoadingModal, MessageModal } from "@/functions/swal";
import { apiGetAllGenders, apiGetAllNationalities, apiGetAllEthnicities, apiGetAllReligions } from '@/functions/api/asset';
import { apiGetProvinces, apiGetDistrictsByProvince, apiGetCommunesByDistrict, apiGetVillagesByCommune } from '@/functions/api/geo';
import CropperModal from '@/components/includes/controls/CropperModal.vue';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const props = defineProps({
  onCreated: {
    type: Function,
  },
  onUpdated: {
    type: Function,
  },
  onDeleted: {
    type: Function,
  },
});

const currentImage = ref(null);

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

async function buildFormData(data, includePhoto) {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'photo') return;
    if (value !== null && value !== undefined) form.append(key, value);
  });
  if (includePhoto) {
    if (data.photo) {
      const blob = await (await fetch(data.photo)).blob();
      form.append('photo', blob, 'photo.jpg');
    } else {
      form.append('photo', '');
    }
  }
  return form;
}

async function saveStudent() {
  try {
    LoadingModal();
    let response = null;
    if (studentObj.id === null) {
      response = await apiCreateStudent(await buildFormData(studentObj, true));
      props.onCreated(response.data.student);
    } else {
      const photoChanged = currentImage.value !== studentObj.photo;
      response = await apiUpdateStudent(await buildFormData(studentObj, photoChanged));
      props.onUpdated(response.data.student);
    }
    hideModal();
    return MessageModal({ icon: "success", title: "Success", text: response.data.message });
  } catch (error) {
    const { response } = error;
    if (!response) {
      return MessageModal({ icon: "error", title: "Error", text: error.message });
    }
    const { status, data } = response;
    if (status === 422) {
      Object.keys(studentErrObj).forEach((key) => {
        studentErrObj[key] = data.errors[key]
          ? data.errors[key][0]
          : "";
      });
      return CloseModal();
    }
    return MessageModal({ icon: "error", title: "Error", text: data.message });
  }
}
async function viewStudent(id) {
  try {
    LoadingModal();
    const response = await apiReadStudent(id);
    const {
      photo, gender, nationality, ethnicity, religion,
      pob_village, pob_commune, pob_district, pob_province,
      por_village, por_commune, por_district, por_province,
      ...rest
    } = response.data.student;
    Object.assign(studentObj, {
      ...rest,
      gender_id: gender?.id ?? null,
      nationality_id: nationality?.id ?? null,
      ethnicity_id: ethnicity?.id ?? null,
      religion_id: religion?.id ?? null,
      pob_province_id: pob_province?.id ?? null,
      pob_district_id: pob_district?.id ?? null,
      pob_commune_id: pob_commune?.id ?? null,
      pob_village_id: pob_village?.id ?? null,
      por_province_id: por_province?.id ?? null,
      por_district_id: por_district?.id ?? null,
      por_commune_id: por_commune?.id ?? null,
      por_village_id: por_village?.id ?? null,
    });
    studentObj.photo = photo;
    currentImage.value = photo;
    showModal();
    return CloseModal();
  } catch (error) {
    return MessageModal({ icon: "error", title: "Error", text: error.response?.data?.message || error.message });
  }
}
async function removeStudent(id) {
  Swal.fire({
    title: 'Want to delete the student ?',
    html: '<pre>' + "Please make a confirmation." + '</pre>',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    confirmButtonText: 'Yes, Delete it.'
  }).then(async (sw) => {
    if (sw.isConfirmed) {
      try {
        LoadingModal();
        const response = await apiDeleteStudent(id);
        const { student, message } = response.data;
        props.onDeleted(student);
        return MessageModal({ icon: "success", title: "Success", text: message });
      } catch (error) {
        return MessageModal({ icon: "error", title: "Error", text: error.response?.data?.message || error.message });
      }
    }
  });
}

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
  removeStudent,
  viewStudent
});
</script>
```

**Key points:**
- **`<CropperModal>` Usage**: We embed the cropper component and use `v-model` to bind `studentObj.photo` to it. `v-model:current` is used to store the initial image when editing a student, and `v-model:error` displays validation messages.
- **`saveStudent` function**: This function now handles both creating and updating a student. It calls `buildFormData` to prepare the data for submission.
- **`buildFormData` function**: This helper function is crucial for file uploads. It converts our reactive `studentObj` into a `FormData` object. It converts the base64 image data back into a `Blob` before appending it to the form data, which is the format expected by servers for file uploads.
- **Handling Updates**: When updating, we check if the photo has changed. If it has, we include the new photo in the `FormData`. If not, we don't send any photo data, leaving the existing photo untouched on the server.
- **CRUD functions**: `viewStudent` and `removeStudent` are added to fetch student data for editing and to delete students, respectively.
- **Props for Callbacks**: The component now accepts `onCreated`, `onUpdated`, and `onDeleted` functions as props. These will be called after the respective API calls succeed, allowing the parent component to react to the changes.

---

### Step 4 - Edit: Updating the Parent Page

Finally, we'll update the main `Student.vue` page to handle the events emitted from the `StudentModal`. This will allow the student list to update in real-time without needing a page refresh.

**File:** `src/components/pages/Student.vue`

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
  <StudentModal ref="StudentModalRef" :onCreated="onStudentCreated" :onUpdated="onStudentUpdated"
    :onDeleted="onStudentDeleted" />
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
            onClick: () => StudentModalRef.value.removeStudent(row.original.id),
            class: 'btn btn-sm btn-outline-danger mx-1'
          },
          h('i', { class: 'fa fa-trash' })
        ),
        // view btn
        h('button',
          {
            onClick: () => StudentModalRef.value.viewStudent(row.original.id),
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

const onStudentCreated = (student) => {
  students.value = [...students.value, student];
};
const onStudentUpdated = (student) => {
  students.value = students.value.map(obj => obj.id !== student.id ? obj : student);
};
const onStudentDeleted = (student) => {
  students.value = students.value.filter(obj => obj.id !== student.id);
};
</script>
```

**Key points:**
- **Passing Callbacks**: We pass the `onStudentCreated`, `onStudentUpdated`, and `onStudentDeleted` functions as props to the `StudentModal`.
- **Reactive Updates**:
  - `onStudentCreated`: Adds the new student to the `students` array.
  - `onStudentUpdated`: Finds the updated student in the array and replaces it with the new data.
  - `onStudentDeleted`: Removes the deleted student from the array.
- **Calling Modal Methods**: The action buttons in the table now correctly call the `viewStudent` and `removeStudent` methods that we exposed from the `StudentModal` component.

---

### Result

With these changes, users can now click the "Create Student" button, fill out the form, and upload a profile picture. The image can be cropped and resized before being submitted. The student list will update instantly after any create, update, or delete operation, providing a smooth and responsive user experience.