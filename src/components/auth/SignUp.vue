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