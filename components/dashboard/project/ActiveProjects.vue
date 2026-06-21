<script setup>
const api = useApi();
const recentMotors = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const data = await api.get("/assembly/motors");
    recentMotors.value = Array.isArray(data) ? data.slice(0, 6) : [];
  } catch (e) {
    console.error("Failed to load motors:", e);
  } finally {
    loading.value = false;
  }
});

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

const resolveStatusVariant = (status) => {
  switch (status) {
    case "RECEIVED": return { color: "info", text: "Received" };
    case "IN_PROGRESS": return { color: "warning", text: "In Progress" };
    case "READY_FOR_SALE": return { color: "success", text: "Ready" };
    case "SOLD": return { color: "primary", text: "Sold" };
    case "DEFECTIVE": return { color: "error", text: "Defective" };
    default: return { color: "grey", text: status };
  }
};
</script>

<template>
  <v-card class="h-100">
    <v-card-title class="d-flex align-center justify-space-between">
      <h4 class="text-h4">Recent Motors</h4>
      <v-btn size="small" variant="tonal" color="primary" to="/assembly/jobs">View All</v-btn>
    </v-card-title>
    <v-divider />
    <v-table hover density="comfortable">
      <thead>
        <tr>
          <th>Serial</th>
          <th>Model</th>
          <th>Status</th>
          <th>Site</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="motor in recentMotors" :key="motor.motor_id">
          <td class="font-weight-medium">{{ motor.serial_number }}</td>
          <td>{{ motor.model_name }}</td>
          <td>
            <v-chip :color="resolveStatusVariant(motor.status).color" size="x-small" label>
              {{ resolveStatusVariant(motor.status).text }}
            </v-chip>
          </td>
          <td>Site {{ motor.current_site_id }}</td>
        </tr>
        <tr v-if="!recentMotors.length">
          <td colspan="4" class="text-center text-medium-emphasis py-4">No motors yet.</td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>
