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