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
                                    <img class="profile-user-img img-fluid img-circle" :src="emptyImage"
                                        alt="User profile picture" />
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
import { reactive } from "vue";
import { useUserStore } from '@/stores/user';
const userStore = useUserStore();

const user = reactive({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
});

const userError = reactive({
    current_password: "",
    new_password: "",
});

async function savePassword() {

}

</script>