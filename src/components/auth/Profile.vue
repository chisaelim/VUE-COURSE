<template>
    <div class="content-wrapper" style="min-height: 1416px">
        <!-- Content Header (Page header) -->
        <section class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1>Profile</h1>
                    </div>
                    <div class="col-sm-6">
                        <ol class="breadcrumb float-sm-right">
                            <li class="breadcrumb-item">
                                <router-link :to="{ name: 'Dashboard' }">Home</router-link>
                            </li>
                            <li class="breadcrumb-item active">Profile</li>
                        </ol>
                    </div>
                </div>
            </div>
            <!-- /.container-fluid -->
        </section>

        <!-- Main content -->
        <section class="content">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-md-4">
                        <!-- Profile Image -->
                        <div class="card card-primary card-outline">
                            <div class="card-body box-profile">
                                <div class="text-center">
                                    <img class="profile-user-img img-fluid img-circle"
                                        :src="previewImage || userStore.profile_image || emptyImage"
                                        alt="User profile picture" />
                                    <input @change="onChangeImage" type="file" class="d-none"
                                        :accept="allowedExtensions.map((ext) => '.' + ext).join(', ')"
                                        id="file-input" />
                                    <div class="mt-1">
                                        <label :for="'file-input'">
                                            <a type="button" class="m-1 btn btn-primary btn-sm"><i
                                                    class="fas fa-upload"></i></a>
                                        </label>
                                        <a v-if="userStore.profile_image" type="button" @click="deleteImage()"
                                            class="m-1 btn btn-danger btn-sm"><i class="fas fa-trash"></i></a>
                                        <a v-if="previewImage" type="button" @click="resetImage()"
                                            class="m-1 btn btn-secondary btn-sm"><i class="fas fa-undo-alt"></i></a>
                                        <a v-if="previewImage" type="button" @click="updateImage()"
                                            class="m-1 btn btn-success btn-sm"><i class="fas fa-check"></i></a>
                                    </div>
                                </div>

                                <h3 class="profile-username text-center">{{ userStore.name }}</h3>

                                <p class="text-muted text-center">{{ userStore.email }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-header p-2">
                                <ul class="nav nav-pills">
                                    <li class="nav-item">
                                        <a class="nav-link active" href="#password_settings" data-toggle="tab">Password
                                            Settings</a>
                                    </li>
                                </ul>
                            </div>
                            <div class="card-body">
                                <div class="tab-content">
                                    <div class="active tab-pane" id="password_settings">
                                        <form @submit.prevent="savePassword" class="form-horizontal">
                                            <div class="form-group row">
                                                <label class="col-sm-3 col-form-label">Current Password</label>
                                                <div class="col-sm-9">
                                                    <input v-model="user.current_password" type="password"
                                                        class="form-control" placeholder="Current Password"
                                                        :class="{ 'is-invalid': !!userError.current_password }" />
                                                    <div class="invalid-feedback">
                                                        {{ userError.current_password }}
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="form-group row">
                                                <label class="col-sm-3 col-form-label">New Password</label>
                                                <div class="col-sm-9">
                                                    <input v-model="user.new_password" type="password"
                                                        class="form-control" placeholder="New Password"
                                                        :class="{ 'is-invalid': !!userError.new_password }" />
                                                    <div class="invalid-feedback">
                                                        {{ userError.new_password }}
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="form-group row">
                                                <label class="col-sm-3 col-form-label">Confirm Password</label>
                                                <div class="col-sm-9">
                                                    <input v-model="user.new_password_confirmation" type="password"
                                                        class="form-control" placeholder="Confirm Password" />
                                                </div>
                                            </div>

                                            <div class="form-group row">
                                                <div class="offset-sm-2 col-sm-10">
                                                    <button type="reset" class="mx-3 btn btn-danger">Cancel</button>
                                                    <button type="submit" class="mx-3 btn btn-outline-primary">
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                    <!-- /.tab-pane -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>


<script setup>
import emptyImage from "@/assets/images/emptyImage.png";
import { reactive, ref } from "vue";
import { useUserStore } from '@/stores/user';
import { CloseModal, LoadingModal, MessageModal } from "@/functions/swal";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import {
    apiChangePassword,
    apiDeleteProfileImage,
    apiUpdateProfileImage,
} from "@/functions/api/auth";

const userStore = useUserStore();
const router = useRouter();

const user = reactive({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
});

const userError = reactive({
    current_password: "",
    new_password: "",
});


const defaultUser = JSON.parse(JSON.stringify(user));
const defaultUserError = JSON.parse(JSON.stringify(userError));

function resetAllState() {
    Object.assign(user, defaultUser);
    Object.assign(userError, defaultUserError);
}

async function savePassword() {
    try {
        LoadingModal('Saving password...');
        const response = await apiChangePassword(
            user.current_password,
            user.new_password,
            user.new_password_confirmation
        );
        resetAllState();
        await MessageModal({ icon: "success", title: "Success", text: response.data.message, }, () => router.push({ name: "SignIn" }));
    } catch (error) {
        const { response } = error;
        if (!response) {
            return MessageModal({ icon: "error", title: "Error", text: error.message });
        }
        const { status, data } = response;
        if (status === 422) {
            Object.keys(userError).forEach((key) => {
                userError[key] = data.errors[key]
                    ? data.errors[key][0]
                    : "";
            });
            return CloseModal();
        }
        return MessageModal({ icon: "error", title: "Error", text: data.message });
    }
}

const previewImage = ref(null);
const selectedImageFile = ref(null);
const allowedExtensions = ["jpg", "jpeg", "png"];

function onChangeImage(event) {
    const files = event.target.files;
    if (files && files.length > 0) {
        const extFile = files[0].name.split(".").pop()?.toLowerCase();
        if (!allowedExtensions.includes(extFile)) {
            return MessageModal({ icon: "error", title: "Error", text: "Only jpg/jpeg and png files are allowed!" });
        }
        const reader = new FileReader();
        reader.onloadend = function () {
            const img = new Image();
            img.onerror = function () {
                return MessageModal({ icon: "error", title: "Error", text: "Failed to load image. Please try a different file." });
            };
            img.onload = function () {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                // Set canvas size to 454x454
                canvas.width = 454;
                canvas.height = 454;

                // Calculate crop dimensions (center crop)
                const size = Math.min(img.width, img.height);
                const x = (img.width - size) / 2;
                const y = (img.height - size) / 2;

                // Draw image cropped and resized to 454x454
                ctx.drawImage(img, x, y, size, size, 0, 0, 454, 454);

                canvas.toBlob((blob) => {
                    if (!blob) {
                        return MessageModal({ icon: "error", title: "Error", text: "Failed to process image. Please try again." });
                    }

                    selectedImageFile.value = new File([blob], "profile.png", { type: "image/png" });
                    previewImage.value = canvas.toDataURL("image/png");
                }, "image/png");
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(files[0]);
        event.target.value = null;
    }
}

function resetImage() {
    selectedImageFile.value = null;
    previewImage.value = null;
}

async function deleteImage() {
    await Swal.fire({
        title: 'Are you sure?',
        text: "You will delete your profile image!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                LoadingModal('Deleting profile image...');
                const response = await apiDeleteProfileImage();
                userStore.profile_image = null;
                userStore.profile_thumbnail = null;
                resetImage();
                await MessageModal({ icon: "success", title: "Success", text: response.data.message });
            } catch (error) {
                return MessageModal({ icon: "error", title: "Error", text: error.response?.data?.message || error.message });
            }
        }
    });
}

async function updateImage() {
    try {
        LoadingModal('Saving profile image...');
        const response = await apiUpdateProfileImage(selectedImageFile.value);
        userStore.profile_image = response.data.profile_image;
        userStore.profile_thumbnail = response.data.profile_thumbnail;
        resetImage();
        await MessageModal({ icon: "success", title: "Success", text: response.data.message });
    } catch (error) {
        return MessageModal({ icon: "error", title: "Error", text: error.response?.data?.message || error.message });
    }
}
</script>