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
                    <router-link :to="{ name: 'Profile' }" class="d-block">{{ userStore.name }}</router-link>
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
                    <li class="nav-header">
                        Certificate Management
                    </li>
                    <li class="nav-item">
                        <router-link :to="{ name: 'StudentTests' }" active-class="active" class="nav-link">
                            <i class="nav-icon fas fa-user-graduate"></i>
                            <p>Student Tests</p>
                        </router-link>
                    </li>

                    <li class="nav-header">
                        Academic Management
                    </li>
                    <li class="nav-item">
                        <router-link :to="{ name: 'Students' }" active-class="active" class="nav-link">
                            <i class="nav-icon fas fa-users"></i>
                            <p>Students</p>
                        </router-link>
                    </li>
                    <li class="nav-item">
                        <router-link :to="{ name: 'Tests' }" active-class="active" class="nav-link">
                            <i class="nav-icon fas fa-vial"></i>
                            <p>Tests</p>
                        </router-link>
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
import { useUserStore } from '@/stores/user';
const userStore = useUserStore();
</script>