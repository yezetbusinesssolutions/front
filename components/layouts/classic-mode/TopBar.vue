<script setup>
import Notification from "@/components/layouts/Notification.vue";
import UserProfile from "@/components/layouts/UserProfile.vue";
import { useSyncQueueStore } from "@/stores/syncQueue";

import { useGlobal } from "@/stores/global";
const { themeHeaderHeight, themeSidebarWidth, smallDisplay, themeName } = themeConfig();
const globalStore = useGlobal();
const syncStore = useSyncQueueStore();

const toggleSidebarPhone = (tempObj) => {
  globalStore.sideBarToggle(tempObj);
};

watch(smallDisplay, (newValue, oldValue) => {
  if (newValue && !oldValue) {
    toggleSidebarPhone(false);
  } else {
    toggleSidebarPhone(true);
  }
});

if (smallDisplay.value) {
  toggleSidebarPhone(false);
}

onMounted(() => {
  syncStore.initQueue();
});
</script>

<template>
  <v-app-bar :height="themeHeaderHeight" class="app-header" fixed>
    <template #prepend>
<div class="d-flex d-md-none align-item-center mr-3">
        <span class="text-h6 font-weight-bold">Motor Inventory</span>
      </div>

      <icon-btn
        class="d-none d-sm-flex"
        @click.stop="globalStore.sideBarToggle()"
        :style="`margin-left:${
          globalStore.sideNavBar && !smallDisplay ? themeSidebarWidth : '0'
        }px;`"
      >
        <v-icon size="25" icon="tabler-menu-2" />
      </icon-btn>

      <GlobalsTextField
        placeholder="Search"
        height="39"
        append-inner-icon="tabler-search"
        class="min-w-57 ml-4 d-none d-sm-flex"
      />
    </template>

    <template #append>
      <icon-btn class="d-flex d-sm-none" @click.stop="globalStore.sideBarToggle()">
        <v-icon size="25" icon="tabler-menu-2" />
      </icon-btn>

      <v-btn
        v-if="syncStore.hasPendingSync"
        icon
        variant="text"
        size="small"
        class="mr-1"
        @click="syncStore.processQueue"
      >
        <v-badge :content="syncStore.pendingCount" color="warning" overlap>
          <v-icon icon="tabler-refresh" />
        </v-badge>
      </v-btn>

      <Notification />
      <UserProfile />
    </template>
  </v-app-bar>
</template>
