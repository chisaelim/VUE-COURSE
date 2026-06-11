import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'admin-lte/dist/js/adminlte.min.js';


import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { useUserStore } from '@/stores/user';
import { apiVerify } from '@/functions/api/auth';
import { createPinia } from 'pinia'

const pinia = createPinia();

createApp(App).use(router).use(pinia).mount('#app');

const userStore = useUserStore();
router.beforeEach(async (to, from) => {
    const { guarded } = to.meta;
    if (guarded === undefined) { // if the route is not guarded, we don't need to verify the token
        return;
    }

    try {
        const token = userStore.getSanctumToken();
        const response = await apiVerify(token);
        const { data } = response;
        userStore.setState(data.user);
    } catch (error) {
        userStore.reset();
    }

    if (guarded && !userStore.isAuthenticated) { // if the route is guarded and the user is not authenticated, redirect to signin page
        return { name: 'SignIn' };
    }
    if (!guarded && userStore.isAuthenticated) { // if the route is not guarded and the user is authenticated, redirect to dashboard page
        return { name: 'Dashboard' };
    }
});