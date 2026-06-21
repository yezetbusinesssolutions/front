<script setup>
const api = useApi();
const sites = ref([]);
const selectedSite = ref("");
const motors = ref([]);
const loading = ref(false);

onMounted(async () => {
  try {
    const data = await api.get("/sites");
    sites.value = data;
    if (data.length > 0) {
      selectedSite.value = data[0].site_id;
      await loadMotors();
    }
  } catch (e) {
    console.error("Failed to load sites:", e);
  }
});

const loadMotors = async () => {
  if (!selectedSite.value) return;
  loading.value = true;
  try {
    const data = await api.get(`/sales/showroom/${selectedSite.value}/motors`);
    motors.value = data;
  } catch (e) {
    console.error("Failed to load motors:", e);
  } finally {
    loading.value = false;
  }
};

watch(selectedSite, loadMotors);
</script>

<template>
  <v-container fluid>
    <GlobalsHeader title="Showroom Inventory" is-btn btn-color="light" btn-text="New Sale" to="/sales/invoices/create" />

    <v-card class="mb-4">
      <v-card-item>
        <GlobalsAutocomplete
          v-model="selectedSite"
          :items="sites"
          item-title="site_name"
          item-value="site_id"
          label="Select Showroom"
          class="max-w-400"
        />
      </v-card-item>
    </v-card>

    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <h4 class="text-h4">Available Motors</h4>
        <v-chip>{{ motors.length }} units</v-chip>
      </v-card-title>
      <v-divider />

      <v-data-table
        :headers="[
          { title: 'Serial', key: 'serial_number' },
          { title: 'Model', key: 'model_name' },
          { title: 'Color', key: 'color' },
          { title: 'Status', key: 'status' },
        ]"
        :items="motors"
        :loading="loading"
      >
        <template #item.status="{ item }">
          <v-chip color="success" size="small">{{ item.status }}</v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn size="small" variant="tonal" color="primary" :to="`/sales/invoices/create?motor_id=${item.motor_id}`">
            Sell
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
