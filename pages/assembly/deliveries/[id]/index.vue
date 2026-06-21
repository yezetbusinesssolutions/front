<script setup>
const route = useRoute();
const api = useApi();
const delivery = ref(null);
const motors = ref([]);
const sites = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const [deliveryData, motorsData, sitesData] = await Promise.all([
      api.get(`/assembly/deliveries/${route.params.id}`),
      api.get(`/assembly/deliveries/${route.params.id}/motors`),
      api.get("/sites"),
    ]);
    delivery.value = deliveryData;
    motors.value = motorsData;
    sites.value = sitesData;
  } catch (e) {
    console.error("Failed to load delivery:", e);
  } finally {
    loading.value = false;
  }
});

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusColor = (status) => {
  switch (status) {
    case "RECEIVED": return "info";
    case "IN_PROGRESS": return "warning";
    case "READY_FOR_SALE": return "success";
    case "SOLD": return "primary";
    case "DEFECTIVE": return "error";
    default: return "default";
  }
};

const siteName = (siteId) => {
  if (!siteId) return "-";
  const site = sites.value.find((s) => s.site_id === siteId);
  return site ? `${site.site_type}: ${site.site_name}` : `Site ${siteId}`;
};
</script>

<template>
  <v-container fluid>
    <GlobalsHeader title="Delivery Details" is-btn btn-color="light" btn-text="Back to Deliveries" to="/assembly/deliveries" />

    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular indeterminate size="48" />
    </div>
    <div v-else-if="delivery">
      <v-row class="mb-6">
        <v-col cols="12" md="8">
          <v-card>
            <v-card-item class="pa-6">
              <h4 class="text-h4 mb-4">Delivery Information</h4>
              <v-row>
                <v-col cols="12" sm="6" class="mb-2">
                  <div class="text-body-2 text-medium-emphasis">Delivery Number</div>
                  <div class="text-body-1 font-weight-medium">{{ delivery.delivery_no }}</div>
                </v-col>
                <v-col cols="12" sm="6" class="mb-2">
                  <div class="text-body-2 text-medium-emphasis">Received At</div>
                  <div class="text-body-1 font-weight-medium">{{ formatDate(delivery.received_at) }}</div>
                </v-col>
                <v-col cols="12" sm="6" class="mb-2">
                  <div class="text-body-2 text-medium-emphasis">Supplier</div>
                  <div class="text-body-1 font-weight-medium">{{ delivery.supplier_name || "N/A" }}</div>
                </v-col>
                <v-col cols="12" sm="6" class="mb-2">
                  <div class="text-body-2 text-medium-emphasis">Site</div>
                  <div class="text-body-1 font-weight-medium">{{ siteName(delivery.received_at_site_id) }}</div>
                </v-col>
                <v-col cols="12" v-if="delivery.notes">
                  <div class="text-body-2 text-medium-emphasis">Notes</div>
                  <div class="text-body-1">{{ delivery.notes }}</div>
                </v-col>
              </v-row>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>

      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <h4 class="text-h4">Motors in This Delivery ({{ motors.length }})</h4>
        </v-card-title>
        <v-divider />

        <v-data-table
          :headers="[
            { title: 'Serial', key: 'serial_number' },
            { title: 'Model', key: 'model_name' },
            { title: 'Color', key: 'color' },
            { title: 'Status', key: 'status' },
            { title: 'Current Site', key: 'current_site_id' },
            { title: 'Actions', key: 'actions', sortable: false },
          ]"
          :items="motors"
          :loading="loading"
          item-value="motor_id"
        >
          <template #item.status="{ item }">
            <v-chip :color="statusColor(item.status)" size="small">
              {{ item.status }}
            </v-chip>
          </template>

          <template #item.current_site_id="{ item }">
            {{ siteName(item.current_site_id) }}
          </template>

          <template #item.actions="{ item }">
            <v-btn size="small" variant="tonal" color="primary" :to="`/assembly/motors/${item.motor_id}`">
              View
            </v-btn>
          </template>
        </v-data-table>
      </v-card>
    </div>
    <div v-else class="text-center pa-8">
      <p class="text-body-1">Delivery not found.</p>
      <v-btn color="primary" to="/assembly/deliveries">Back to Deliveries</v-btn>
    </div>
  </v-container>
</template>