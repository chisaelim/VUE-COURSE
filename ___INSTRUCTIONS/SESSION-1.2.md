# Setting Up AdminLTE Layout and Named Views in a Vue 3 Project

This guide walks through upgrading the existing router-based app into an AdminLTE-styled interface with named `RouterView` slots, shared layout includes, and redesigned auth/dashboard pages.

---

## Step 1 - Run Command: Install AdminLTE UI Dependencies

Install the packages required by the staged UI and layout changes.

```bash
npm install husky --save-dev
npm install admin-lte@^3.2 --save
npm install bootstrap@4.6.2 
npm install @fortawesome/fontawesome-free@5.15.4 
npm install icheck-bootstrap@3.0.1
```

**Key points:**
- `@fortawesome/fontawesome-free` provides the icon classes used in navbar, sidebar, and auth forms (`fas ...`).
- `admin-lte` provides the dashboard layout classes and JS widgets used by the new components.
- `bootstrap` is required by AdminLTE and form/grid utility classes in the staged templates.
- `icheck-bootstrap` provides checkbox/radio style support loaded from `src/main.css`.
- `husky` is added to dependencies in the staged `package.json` update.

---

## Step 2 - Edit: `package.json`

Add the UI framework dependencies used by the new layout.

**Before:**

```json
{
  "dependencies": {
    "vue": "^3.5.32",
    "vue-router": "^5.1.0"
  }
}
```

**After:**

```json
{
  "dependencies": {
    "@fortawesome/fontawesome-free": "^5.15.4",
    "admin-lte": "^3.2.0",
    "bootstrap": "^4.6.2",
    "husky": "^9.1.7",
    "icheck-bootstrap": "^3.0.1",
    "vue": "^3.5.32",
    "vue-router": "^5.1.0"
  }
}
```

**Key points:**
- The new dependencies exactly match the libraries imported by `src/main.css`, `src/main.js`, and component templates.
- Existing `vue` and `vue-router` remain, so this extends the current app rather than replacing router setup.

---

## Step 3 - Create New: `src/main.css`

Create a global stylesheet entry file that imports AdminLTE-related CSS assets.

```css
@import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback');
@import '@fortawesome/fontawesome-free/css/all.min.css';
@import 'icheck-bootstrap/icheck-bootstrap.min.css';
@import 'admin-lte/dist/css/adminlte.min.css';
```

**Key points:**
- Source Sans Pro matches AdminLTE's default typography.
- Font Awesome CSS enables icon classes used in templates.
- `icheck-bootstrap` and AdminLTE CSS activate the new UI component styling.

---

## Step 4 - Edit: `index.html`

Load global CSS and apply AdminLTE wrapper classes at the root HTML level.

**Before:**

```html
<!DOCTYPE html>
<html lang="">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" href="/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vite App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

**After:**

```html
<!DOCTYPE html>
<html lang="">

<head>
  <meta charset="UTF-8">
  <link rel="icon" href="/favicon.ico">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vite App</title>
  <link rel="stylesheet" href="/src/main.css">
</head>

<body class="sidebar-mini layout-fixed">
  <div id="app" class="wrapper"></div>
  <script type="module" src="/src/main.js"></script>
</body>

</html>
```

**Key points:**
- `<link rel="stylesheet" href="/src/main.css">` loads the new global style imports.
- `body` classes (`sidebar-mini layout-fixed`) activate AdminLTE layout behavior.
- `class="wrapper"` on `#app` aligns the Vue mount point with AdminLTE structure.

---

## Step 5 - Edit: `src/main.js`

Import AdminLTE-related JavaScript bundles before bootstrapping Vue.

**Before:**

```js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

createApp(App).use(router).mount('#app')
```

**After:**

```js
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'admin-lte/dist/js/adminlte.min.js';


import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

createApp(App).use(router).mount('#app')
```

**Key points:**
- Bootstrap bundle enables JS behavior used by AdminLTE components.
- AdminLTE JS enables data-widget behaviors in navbar/sidebar markup.
- Vue app creation remains unchanged after adding framework scripts.

---

## Step 6 - Create New: Shared Layout Include Components

Create reusable layout components used in named router views.

### `src/components/includes/Navbar.vue`

```vue
<template>
    <nav class="main-header navbar navbar-expand navbar-white navbar-light">
        <!-- Left navbar links -->
        <ul class="navbar-nav">
            <li class="nav-item">
                <a class="nav-link" data-widget="pushmenu" href="#" role="button"><i class="fas fa-bars"></i></a>
            </li>
        </ul>

        <!-- Right navbar links -->
        <ul class="navbar-nav ml-auto">
            <li class="nav-item">
                <a class="nav-link" data-widget="fullscreen" href="#" role="button">
                    <i class="fas fa-expand-arrows-alt"></i>
                </a>
            </li>
        </ul>
    </nav>
</template>
```

**Key points:**
- `data-widget="pushmenu"` and `data-widget="fullscreen"` are AdminLTE widget hooks.
- Font Awesome icon classes depend on the staged icon CSS import.

### `src/components/includes/Sidebar.vue`

```vue
<template>
    <aside class="main-sidebar sidebar-dark-primary elevation-4">
        <!-- Brand Logo -->
        <RouterLink to="/" class="brand-link">
            <img :src="logoImage" alt="Chat System Logo" class="brand-image img-circle elevation-3" style="opacity: .8">
            <span class="brand-text font-weight-light">Chat System</span>
        </RouterLink>

        <!-- Sidebar -->
        <div class="sidebar">
            <!-- Sidebar user panel (optional) -->
            <div class="user-panel mt-3 pb-3 mb-3 d-flex">
                <div class="image">
                    <img :src="emptyImage" class="img-circle elevation-2" alt="User Image">
                </div>
                <div class="info">
                    <a href="#" class="d-block">Alexander Pierce</a>
                </div>
            </div>

            <!-- Sidebar Menu -->
            <nav class="mt-2">
                <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu"
                    data-accordion="false">
                    <li class="nav-item">
                        <RouterLink :to="{ name: 'Dashboard' }" active-class="active" class="nav-link">
                            <i class="nav-icon fas fa-tachometer-alt"></i>
                            <p>
                                Dashboard
                            </p>
                        </RouterLink>
                    </li>
                </ul>
            </nav>
            <!-- /.sidebar-menu -->
        </div>
        <!-- /.sidebar -->
    </aside>
</template>

<script setup>
import logoImage from '@/assets/images/logoImago.webp';
import emptyImage from '@/assets/images/emptyImage.png';
</script>
```

**Key points:**
- Uses route-name navigation for dashboard menu linking.
- Imports staged image assets for brand and user avatar rendering.
- AdminLTE sidebar classes control appearance and behavior.

### `src/components/includes/Footer.vue`

```vue
<template>
    <footer class="main-footer">
        <!-- To the right -->
        <div class="float-right d-none d-sm-inline">
            Anything you want
        </div>
        <!-- Default to the left -->
        <strong>Copyright © 2014-2021 <a href="https://adminlte.io">AdminLTE.io</a>.</strong> All rights reserved.
    </footer>
</template>
```

**Key points:**
- Uses AdminLTE footer class conventions for consistent placement and styling.

---

## Step 7 - Edit: `src/router.js`

Switch dashboard route rendering from a single component to named view components.

**Before:**

```js
import SignIn from '@/components/auth/SignIn.vue';
import SignUp from '@/components/auth/SignUp.vue';
import Dashboard from '@/components/pages/Dashboard.vue';


import { createRouter, createWebHistory } from 'vue-router';
const routes = [
    {
        path: '/',
        name: 'SignIn',
        component: SignIn,
    },
    {
        path: '/signup',
        name: 'SignUp',
        component: SignUp,
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
    },
    { path: '/:pathMatch(.*)*', redirect: { name: 'SignIn' } },
];

const router = createRouter({
    history: createWebHistory(),
    routes: routes,
});

export default router;
```

**After:**

```js
import SignIn from '@/components/auth/SignIn.vue';
import SignUp from '@/components/auth/SignUp.vue';
import Dashboard from '@/components/pages/Dashboard.vue';

import Navbar from '@/components/includes/Navbar.vue';
import Sidebar from '@/components/includes/Sidebar.vue';
import Footer from '@/components/includes/Footer.vue';


import { createRouter, createWebHistory } from 'vue-router';
const routes = [
    {
        path: '/',
        name: 'SignIn',
        component: SignIn,
    },
    {
        path: '/signup',
        name: 'SignUp',
        component: SignUp,
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        components: {
            navbar: Navbar,
            sidebar: Sidebar,
            footer: Footer,
            default: Dashboard,
        },
    },
    { path: '/:pathMatch(.*)*', redirect: { name: 'SignIn' } },
];

const router = createRouter({
    history: createWebHistory(),
    routes: routes,
});

export default router;
```

**Key points:**
- New imports register reusable include components for the dashboard route.
- `components` (plural) enables named views for a single route.
- `default` maps to the unnamed `RouterView`, while `navbar`, `sidebar`, and `footer` map to named outlets.

---

## Step 8 - Edit: `src/App.vue`

Replace a single router outlet with named router view slots.

**Before:**

```vue
<script setup></script>

<template>
  <!-- <RouterView /> -->
  <!-- <RouterView></RouterView> -->
  <router-view />
  <!-- <router-view></router-view> -->
</template>

<style scoped></style>
```

**After:**

```vue
<script setup></script>

<template>
  <RouterView name="navbar" />
  <RouterView name="sidebar" />
  <RouterView name="default" />
  <RouterView name="footer" />
</template>

<style scoped></style>
```

**Key points:**
- Each `RouterView` with a `name` renders the matching key from route `components`.
- `name="default"` renders the route's main page component.

---

## Step 9 - Edit: Auth and Dashboard Page Components

Update page templates to match AdminLTE structure.

### `src/components/auth/SignIn.vue`

**Before:**

```vue
<template>
    <h1>Sign In</h1>
    <button @click="goToDashboard">Go to Dashboard</button>
    <br>
    <br>
    <br>
    <button @click="goToSignUp">Go to Sign Up</button>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

// replace to a path
function goToDashboard() {
    router.replace('/dashboard')
}

// replace to a named route
function goToSignUp() {
    router.replace({ name: 'SignUp' })
}
</script>
```

**After:**

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
                    <form>
                        <div class="input-group mb-3">
                            <input type="email" class="form-control" placeholder="Email" />
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <span class="fas fa-envelope"></span>
                                </div>
                            </div>
                        </div>
                        <div class="input-group mb-3">
                            <input type="password" class="form-control" placeholder="Password" autocomplete />
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <span class="fas fa-lock"></span>
                                </div>
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

<script setup></script>
```

**Key points:**
- Replaces demo navigation buttons with styled login form structure.
- Uses `RouterLink` for registration navigation instead of programmatic router calls.
- Removes unused script logic after UI redesign.

### `src/components/auth/SignUp.vue`

**Before:**

```vue
<template>
    <h1>Sign Up</h1>
    <button @click="goToDashboard">Go to Dashboard</button>
    <br>
    <br>
    <br>
    <button @click="goToSignIn">Go to Sign In</button>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

// push to a path
function goToDashboard() {
    router.push('/dashboard')
}

// push to a named route
function goToSignIn() {
    router.push({ name: 'SignIn' })
}
</script>
```

**After:**

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
                    <form>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" placeholder="Name" />
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <span class="fas fa-user"></span>
                                </div>
                            </div>
                        </div>
                        <div class="input-group mb-3">
                            <input type="email" class="form-control" placeholder="Email" />
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <span class="fas fa-envelope"></span>
                                </div>
                            </div>
                        </div>
                        <div class="input-group mb-3">
                            <input type="password" class="form-control" placeholder="Password" autocomplete />
                            <div class="input-group-append">
                                <div class="input-group-text">
                                    <span class="fas fa-lock"></span>
                                </div>
                            </div>
                        </div>
                        <div class="input-group mb-3">
                            <input type="password" class="form-control" placeholder="Confirm Password" autocomplete />
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

<script setup></script>
```

**Key points:**
- Converts the sign-up view into an AdminLTE card form layout.
- Uses route-name links to return users to sign-in.
- Removes prior `useRouter` push-based script logic.

### `src/components/pages/Dashboard.vue`

**Before:**

```vue
<template>
    <h1>Dashboard</h1>
    <RouterLink to="/signup">Go to Sign Up</RouterLink>
    <br>
    <br>
    <br>
    <router-link :to="{ name: 'SignIn' }">Go to Sign In</router-link>
    <br>
    <br>
    <br>
    <button @click="goBack">Go Back</button>
    <button @click="goForward">Go Forward</button>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

function goBack() {
    // router.back(); // option 1
    router.go(-1); // option 2
}

function goForward() {
    // router.forward(); // option 1
    router.go(1); // option 2
}

</script>
```

**After:**

```vue
<template>
    <div class="content-wrapper" style="min-height: 1157px;">
        <!-- Content Header (Page header) -->
        <div class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1 class="m-0">Dashboard</h1>
                    </div><!-- /.col -->
                    <div class="col-sm-6">
                        <ol class="breadcrumb float-sm-right">
                            <li class="breadcrumb-item"><a href="#">Home</a></li>
                            <li class="breadcrumb-item active">Dashboard v1</li>
                        </ol>
                    </div><!-- /.col -->
                </div><!-- /.row -->
            </div><!-- /.container-fluid -->
        </div>
        <!-- /.content-header -->

        <!-- Main content -->
        <section class="content">
            <div class="container-fluid">

            </div>
        </section>
        <!-- /.content -->
    </div>
</template>

<script setup>

</script>
```

**Key points:**
- Replaces the demo navigation page with an AdminLTE content-wrapper structure.
- Keeps route rendering focused on page layout sections for dashboard content.
- Removes previous history-navigation script logic.

---

## Result

After these changes, the app uses AdminLTE styling and named router views for the dashboard layout:

| Route | Rendered layout |
| --- | --- |
| `/` | Full-screen sign-in card page |
| `/signup` | Full-screen sign-up card page |
| `/dashboard` | Navbar + Sidebar + Dashboard content + Footer (named views) |
| any unknown route | Redirects to `SignIn` |
