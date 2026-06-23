import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'admin-lte/dist/js/adminlte.min.js';
import '@/functions/pdfmake.js'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { useUserStore } from '@/stores/user';
import { apiVerify } from '@/functions/api/auth';
import { createPinia } from 'pinia'
import axios from 'axios';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import VueMultiSelect from 'vue-multiselect';
import VueApexChart from 'vue3-apexcharts';

const pinia = createPinia();

const app = createApp(App);
app.use(router);
app.use(pinia);
app.component('VueDatePicker', VueDatePicker);
app.component('VueMultiSelect', VueMultiSelect);
app.component('VueApexChart', VueApexChart);
app.mount('#app');

const userStore = useUserStore();

axios.interceptors.request.use((config) => {
    const token = userStore.getSanctumToken();
    if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

router.beforeEach(async (to, from) => {
    const { guarded } = to.meta;
    if (guarded === undefined) { // if the route is not guarded, we don't need to verify the token
        return;
    }

    try {
        const response = await apiVerify();
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