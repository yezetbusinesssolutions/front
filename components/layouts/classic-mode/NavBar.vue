<script setup>
import Navigation from "@/components/layouts/navigation/Index.vue";

import { useGlobal } from "@/stores/global";
const { themeSidebarWidth, smallDisplay, themeName } = themeConfig();
const globalStore = useGlobal();
</script>

<template>
  <v-navigation-drawer
    v-model="globalStore.sideNavBar"
    :width="themeSidebarWidth"
    :permanent="smallDisplay ? false : true"
    :class="{ 'sidebar-visibile': !smallDisplay && globalStore.sideNavBar }"
  >
    <div class="app-nav-logo-wrapper aligin-center">
      <span class="text-h6 font-weight-bold pl-3">SIMONS MC P.L.C</span>
    </div>

    <Navigation />
  </v-navigation-drawer>
</template>

<style lang="scss">
@use "@configured-variables" as variable;

.app-nav-logo-wrapper {
  height: variable.$dash-ui-header-height;
  padding: map_get(variable.$list-item, padding);
  align-items: center;
}
</style>
