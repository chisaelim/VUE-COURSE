<template>
    <div class="login-page">
        <div class="login-box">
            <div class="card card-outline card-primary">
                <div class="card-header text-center">
                    <RouterLink to="/" class="h1"><b>Admin</b>LTE</RouterLink>
                </div>
                <div class="card-body">
                    <p class="login-box-msg">Sign in to start your session</p>
                    <form @submit.prevent="signIn">
                        <div class="input-group mb-3">
                            <input type="email" v-model="user.email" class="form-control" placeholder="Email"
                                :class="{ 'is-invalid': !!userError.email }" />
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <span class="fas fa-envelope"></span>
                                </div>
                            </div>
                            <div class="invalid-feedback">
                                {{ userError.email }}
                            </div>
                        </div>
                        <div class="input-group mb-3">
                            <input type="password" v-model="user.password" class="form-control" placeholder="Password"
                                autocomplete :class="{ 'is-invalid': !!userError.password }" />
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <span class="fas fa-lock"></span>
                                </div>
                            </div>
                            <div class="invalid-feedback">
                                {{ userError.password }}
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-8"></div>
                            <div class="col-4">
                                <button type="submit" class="btn btn-primary btn-block">Sign In</button>
                            </div>
                        </div>
                    </form>
                    <p class="mb-0">
                        <RouterLink :to="{ name: 'SignUp' }" class="text-center">Register a new
                            membership</RouterLink>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive } from "vue";

const user = reactive({
    email: "",
    password: "",
});

const userError = reactive({
    email: "",
    password: "",
});

async function signIn() {
    console.log("signIn");
}
</script>