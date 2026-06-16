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
