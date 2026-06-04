# Setting Up Reactive Auth Form State in a Vue 3 Project

This guide walks through converting the auth pages into reactive forms with `v-model` bindings, submit handlers, and inline error-message placeholders.

---

## Step 1 - Edit: `src/components/auth/SignIn.vue`

Connect the sign-in form to reactive state and prepare inline validation feedback.

**Full file (copyable):**

```vue
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
```

**Key points:**
- `@submit.prevent="signIn"` blocks page reload and routes submission through a Vue handler.
- `v-model="user.email"` and `v-model="user.password"` keep input values synchronized with reactive state.
- `:class="{ 'is-invalid': !!userError... }"` toggles Bootstrap invalid styling when an error string exists.
- `<div class="invalid-feedback">...</div>` renders field-level validation messages.
- `reactive(...)` groups form values and errors into mutable objects tracked by Vue reactivity.

---

## Step 2 - Edit: `src/components/auth/SignUp.vue`

Apply the same reactive form pattern to the sign-up page, including additional fields.

**Full file (copyable):**

```vue
<template>
    <div class="login-page">
        <div class="login-box">
            <div class="card card-outline card-primary">
                <div class="card-header text-center">
                    <RouterLink to="/" class="h1"><b>Admin</b>LTE</RouterLink>
                </div>
                <div class="card-body">
                    <p class="login-box-msg">Sign up for a new membership</p>
                    <form @submit.prevent="signUp">
                        <div class="input-group mb-3">
                            <input type="text" v-model="user.name" class="form-control" placeholder="Name"
                                :class="{ 'is-invalid': !!userError.name }" />
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <span class="fas fa-user"></span>
                                </div>
                            </div>
                            <div class="invalid-feedback">
                                {{ userError.name }}
                            </div>
                        </div>
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
                        <div class="input-group mb-3">
                            <input type="password" v-model="user.password_confirmation" class="form-control"
                                placeholder="Confirm Password" autocomplete />
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <span class="fas fa-lock"></span>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-8"></div>
                            <div class="col-4">
                                <button type="submit" class="btn btn-primary btn-block">Sign up</button>
                            </div>
                        </div>
                    </form>
                    <p class="mb-1">
                        <RouterLink :to="{ name: 'SignIn' }" class="text-center">I already have an
                            account</RouterLink>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive } from "vue";

const user = reactive({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
});

const userError = reactive({
    name: "",
    email: "",
    password: "",
});

async function signUp() {
    console.log("signUp");
}
</script>
```

**Key points:**
- The sign-up form now uses `@submit.prevent="signUp"` for controlled submission.
- `user` state tracks all input values, including `password_confirmation`.
- `userError` stores per-field error text for `name`, `email`, and `password`.
- Invalid styles and feedback blocks are shown only when each error key has content.
- `signUp()` is now the single entry point where validation/API logic can be added.

---

## Result

Both auth pages now use Vue reactivity for input state and are structured to show inline validation feedback consistently. The templates are ready for the next step: implementing real validation rules and API requests inside `signIn()` and `signUp()`.
