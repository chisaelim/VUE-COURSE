# Setting Up Vue Router in a Vue 3 Project

This guide walks through a complete vue-router setup in a Vue 3 project, from installing the package to rendering route components and navigating between pages.

---

## Step 1 - Run Command: Install `vue-router`

Install Vue Router as a project dependency before creating the router configuration.

```bash
npm install vue-router
```

**Key points:**
- `npm install` downloads the package and adds it to the project dependencies.
- `vue-router` is the official router library for Vue applications.
- After installation, the package can be imported from application files such as `src/router.js` and route components.

---

## Step 2 - Create New: Router File

Create the file `src/router.js`. This centralizes the route definitions and exports a router instance that the app can install.

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

**Key points:**
- `import SignIn`, `import SignUp`, and `import Dashboard` bring in the three page components that will be rendered for matching routes.
- `createRouter` creates the router instance used by the Vue app.
- `createWebHistory()` enables clean browser URLs that use the History API.
- Each route object maps a `path` and `name` to a component.
- `/:pathMatch(.*)*` is a catch-all route pattern for unmatched URLs.
- `redirect: { name: 'SignIn' }` sends unknown routes back to the sign-in page by route name.
- `routes: routes` passes the route list into the router configuration.
- `export default router` makes the configured router available to the app entry file.

---

## Step 3 - Edit: `src/main.js`

Register the router with the Vue application so routing features are available before the app mounts.

**Before:**

```js
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

**After:**

```js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

createApp(App).use(router).mount('#app')
```

**Key points:**
- `import router from './router';` pulls in the router instance created in `src/router.js`.
- `.use(router)` installs the router plugin into the Vue application.
- `.mount('#app')` still mounts the app to the root element, but now routing is active first.

---

## Step 4 - Edit: `src/App.vue`

Replace the starter template with a router outlet so the matched route component can render in the root app shell.

**Before:**

```vue
<script setup></script>

<template>
  <h1>You did it!</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
</template>

<style scoped></style>
```

**After:**

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

**Key points:**
- `<router-view />` is the placeholder where the matched route component renders.
- The commented `RouterView` examples show equivalent tag casing options, but only the lowercase self-closing tag is active.
- Replacing the starter markup makes the app shell route-driven instead of static.

---

## Step 5 - Create New: Route Components

Create the route components that the router will render. These files also demonstrate programmatic navigation and router links.

### `src/components/auth/SignIn.vue`

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

**Key points:**
- `useRouter()` gives the component access to the current router instance.
- `router.replace('/dashboard')` navigates by path and replaces the current history entry.
- `router.replace({ name: 'SignUp' })` navigates by route name instead of a raw path.
- The click handlers connect each button to a navigation action.

### `src/components/auth/SignUp.vue`

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

**Key points:**
- `useRouter()` is used again so this component can trigger navigation.
- `router.push('/dashboard')` adds a new history entry while navigating to the dashboard path.
- `router.push({ name: 'SignIn' })` navigates using the `SignIn` route name.
- This file demonstrates the same two navigation styles as `SignIn.vue`, but with `push` instead of `replace`.

### `src/components/pages/Dashboard.vue`

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

**Key points:**
- `<RouterLink to="/signup">` creates a declarative link to the sign-up path.
- `<router-link :to="{ name: 'SignIn' }">` shows the same link behavior using a named route object.
- `useRouter()` provides programmatic history controls inside the component.
- `router.go(-1)` moves one step back in browser history.
- `router.go(1)` moves one step forward in browser history.

---

## Result

After completing these steps, the router renders the following components for each route:

| URL | Component |
| --- | --- |
| `/` | `SignIn.vue` |
| `/signup` | `SignUp.vue` |
| `/dashboard` | `Dashboard.vue` |
| any other path | redirects to `SignIn.vue` |