<script setup>
import TopBar from "@/components/layouts/classic-mode/TopBar.vue";
import NavBar from "@/components/layouts/classic-mode/NavBar.vue";
import OfflineBanner from "@/components/globals/OfflineBanner.vue";
</script>
<template>
  <!-- Offline Banner -->
  <OfflineBanner />

  <!-- Header -->
  <TopBar />

  <!-- Navbar -->
  <NavBar />

  <v-main class="app-content-area">
    <slot />
  </v-main>
</template>
