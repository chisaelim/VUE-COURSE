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
