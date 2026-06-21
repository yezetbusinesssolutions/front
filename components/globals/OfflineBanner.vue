<script setup>
import { useSyncQueueStore } from "@/stores/syncQueue";

const isOnline = ref(navigator.onLine);
const syncStore = useSyncQueueStore();

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine;
  if (isOnline.value && syncStore.hasPendingSync) {
    syncStore.processQueue();
  }
};

onMounted(() => {
  syncStore.initQueue();
  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
});

onUnmounted(() => {
  window.removeEventListener("online", updateOnlineStatus);
  window.removeEventListener("offline", updateOnlineStatus);
});
</script>

<template>
  <div class="offline-sync-container">
    <v-alert
      v-if="!isOnline"
      type="warning"
      variant="tonal"
      class="offline-banner"
      elevation="2"
    >
      <div class="d-flex align-center">
        <v-icon icon="tabler-wifi-off" class="mr-2" />
        <div>
          <strong>Offline Mode</strong>
          <span class="ml-2 text-caption d-none d-sm-inline">Some features are limited. Changes will sync when connection returns.</span>
        </div>
      </div>
    </v-alert>

    <v-alert
      v-else-if="syncStore.hasPendingSync"
      type="info"
      variant="tonal"
      class="sync-banner"
      elevation="2"
    >
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-progress-circular indeterminate size="16" class="mr-2" />
          <span>Syncing {{ syncStore.pendingCount }} pending change{{ syncStore.pendingCount !== 1 ? 's' : '' }}...</span>
        </div>
        <v-btn size="small" variant="text" @click="syncStore.processQueue">Retry</v-btn>
      </div>
    </v-alert>
  </div>
</template>

<style scoped lang="scss">
.offline-sync-container {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  z-index: 1000;
}

.offline-banner,
.sync-banner {
  margin: 0;
  border-radius: 0;
  border-left: 0;
  border-right: 0;
}
</style>