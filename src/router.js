import SignIn from '@/components/auth/SignIn.vue';
import SignUp from '@/components/auth/SignUp.vue';
import SignOut from '@/components/auth/SignOut.vue';
import Profile from '@/components/auth/Profile.vue';
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
        meta: { guarded: false },
    },
    {
        path: '/signup',
        name: 'SignUp',
        component: SignUp,
        meta: { guarded: false },
    },
    {
        path: '/signout',
        name: 'SignOut',
        component: SignOut,
        // This route has no guarded meta because it use for both authenticated and unauthenticated users.
        // The authentication state will be handled in the SignOut component.
    },
    {
        path: '/profile',
        name: 'Profile',
        components: {
            navbar: Navbar,
            sidebar: Sidebar,
            footer: Footer,
            default: Profile,
        },
        meta: { guarded: true },
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
        meta: { guarded: true },
    },
    { path: '/:pathMatch(.*)*', redirect: { name: 'SignIn' } },
];

const router = createRouter({
    history: createWebHistory(),
    routes: routes,
});

export default router;