<script setup>
const route = useRoute();
const api = useApi();
const motor = ref(null);
const history = ref([]);
const delivery = ref(null);
const sites = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const [motorData, historyData, sitesData] = await Promise.all([
      api.get(`/assembly/motors/${route.params.id}`),
      api.get(`/assembly/motors/${route.params.id}/history`),
      api.get("/sites"),
    ]);
    motor.value = motorData;
    history.value = historyData;
    sites.value = sitesData;
    if (motor.value.delivery_id) {
      try {
        delivery.value = await api.get(`/assembly/deliveries/${motor.value.delivery_id}`);
      } catch {
        delivery.value = null;
      }
    }
  } catch (e) {
    console.error("Failed to load motor:", e);
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

const reasonConfig = (reason) => {
  switch (reason) {
    case "RECEIVED":
      return { icon: "tabler-package", color: "info", label: "Carton Received", desc: "Motor arrived at assembly plant" };
    case "ASSEMBLY_COMPLETE":
      return { icon: "tabler-check", color: "success", label: "Assembly Completed", desc: "Motor assembled and quality checked" };
    case "STOCK_MOVE":
      return { icon: "tabler-truck", color: "primary", label: "Stock Transfer", desc: "Moved to new location" };
    case "RETURN_DEFECTIVE":
      return { icon: "tabler-alert-octagon", color: "error", label: "Marked Defective", desc: "Failed quality inspection" };
    case "SALE_TRANSFER":
      return { icon: "tabler-receipt", color: "primary", label: "Sold", desc: "Motor sold to customer" };
    default:
      return { icon: "tabler-circle", color: "grey", label: reason, desc: "" };
  }
};

const getSiteName = (siteId) => {
  if (!siteId) return null;
  const site = sites.value.find((s) => s.site_id === siteId);
  return site ? `${site.site_type}: ${site.site_name}` : `Site ${siteId}`;
};

const lifecycleSteps = computed(() => {
  const steps = [];
  if (motor.value?.received_at) {
    steps.push({
      title: "Received",
      date: formatDate(motor.value.received_at),
      status: "completed",
      icon: "tabler-package",
      color: "info",
      detail: `Arrived at ${getSiteName(motor.value.current_site_id) || "assembly plant"}`,
    });
  }
  if (motor.value?.assembly_started) {
    steps.push({
      title: "Assembly Started",
      date: formatDate(motor.value.assembly_started),
      status: "completed",
      icon: "tabler-loader",
      color: "warning",
      detail: "Work began on assembly",
    });
  }
  if (motor.value?.assembled_at) {
    steps.push({
      title: "Assembly Completed",
      date: formatDate(motor.value.assembled_at),
      status: "completed",
      icon: "tabler-check",
      color: "success",
      detail: "Quality check passed",
    });
  }
  if (motor.value?.status === "DEFECTIVE") {
    steps.push({
      title: "Marked Defective",
      date: formatDate(motor.value.assembly_started),
      status: "completed",
      icon: "tabler-alert-triangle",
      color: "error",
      detail: motor.value.defect_reason || "Failed quality check",
    });
  }
  if (motor.value?.status === "SOLD") {
    steps.push({
      title: "Sold",
      date: formatDate(motor.value.assembled_at),
      status: "completed",
      icon: "tabler-receipt",
      color: "primary",
      detail: "Transferred to customer",
    });
  }
  return steps;
});
</script>

<template>
  <v-container fluid>
    <GlobalsHeader title="Motor Details" is-btn btn-color="light" btn-text="Back to Assembly" to="/assembly/jobs" />

    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular indeterminate size="48" />
    </div>

    <div v-else-if="motor">
      <v-row class="mb-6">
        <v-col cols="12" md="6">
          <v-card elevation="4">
            <v-card-item class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-avatar :color="statusColor(motor.status)" size="48" rounded class="mr-3">
                  <v-icon icon="tabler-engine" size="28" color="white" />
                </v-avatar>
                <div>
                  <h4 class="text-h4">{{ motor.serial_number }}</h4>
                  <v-chip :color="statusColor(motor.status)" size="small" label>
                    {{ motor.status }}
                  </v-chip>
                </div>
              </div>
              <v-divider class="mb-4" />
              <v-row>
                <v-col cols="12" sm="6" class="mb-3">
                  <div class="text-body-2 text-medium-emphasis">Model</div>
                  <div class="text-body-1 font-weight-medium">{{ motor.model_name }}</div>
                </v-col>
                <v-col cols="12" sm="6" class="mb-3">
                  <div class="text-body-2 text-medium-emphasis">Color</div>
                  <div class="text-body-1 font-weight-medium">{{ motor.color || "N/A" }}</div>
                </v-col>
                <v-col cols="12" sm="6" class="mb-3">
                  <div class="text-body-2 text-medium-emphasis">Current Location</div>
                  <div class="text-body-1 font-weight-medium">{{ getSiteName(motor.current_site_id) || `Site ${motor.current_site_id}` }}</div>
                </v-col>
                <v-col cols="12" sm="6" class="mb-3">
                  <div class="text-body-2 text-medium-emphasis">Received At</div>
                  <div class="text-body-1 font-weight-medium">{{ formatDate(motor.received_at) }}</div>
                </v-col>
                <v-col cols="12" sm="6" class="mb-3" v-if="motor.assembly_started">
                  <div class="text-body-2 text-medium-emphasis">Assembly Started</div>
                  <div class="text-body-1 font-weight-medium">{{ formatDate(motor.assembly_started) }}</div>
                </v-col>
                <v-col cols="12" sm="6" class="mb-3" v-if="motor.assembled_at">
                  <div class="text-body-2 text-medium-emphasis">Assembly Completed</div>
                  <div class="text-body-1 font-weight-medium">{{ formatDate(motor.assembled_at) }}</div>
                </v-col>
                <v-col cols="12" v-if="motor.defect_reason">
                  <v-alert type="error" variant="tonal" class="mb-0">
                    <strong>Defect:</strong> {{ motor.defect_reason }}
                  </v-alert>
                </v-col>
                <v-col cols="12" v-if="delivery">
                  <div class="text-body-2 text-medium-emphasis">Delivery</div>
                  <v-btn size="small" variant="tonal" color="primary" :to="`/assembly/deliveries/${delivery.delivery_id}`">
                    {{ delivery.delivery_no }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-item>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card elevation="4">
            <v-card-item class="pa-6">
              <h4 class="text-h4 mb-4">Lifecycle Timeline</h4>
              <v-timeline side="end" density="comfortable">
                <v-timeline-item
                  v-for="(step, index) in lifecycleSteps"
                  :key="index"
                  :dot-color="step.color"
                  size="small"
                >
                  <div class="d-flex align-start">
                    <v-avatar :color="step.color" size="36" rounded class="mr-3 mt-1">
                      <v-icon :icon="step.icon" size="18" color="white" />
                    </v-avatar>
                    <div class="flex-grow-1">
                      <div class="text-body-1 font-weight-medium">{{ step.title }}</div>
                      <div class="text-caption text-medium-emphasis mb-1">{{ step.date }}</div>
                      <div class="text-body-2">{{ step.detail }}</div>
                    </div>
                  </div>
                </v-timeline-item>
                <v-timeline-item
                  v-if="!lifecycleSteps.length"
                  size="small"
                >
                  <div class="text-body-2 text-medium-emphasis">No lifecycle events recorded yet.</div>
                </v-timeline-item>
              </v-timeline>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-card elevation="4">
            <v-card-item class="pa-6">
              <h4 class="text-h4 mb-4">Transfer History</h4>
              <v-table density="comfortable" hover>
                <thead>
                  <tr>
                    <th class="text-left">Event</th>
                    <th class="text-left">Date</th>
                    <th class="text-left">From</th>
                    <th class="text-left">To</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="event in history" :key="event.transfer_id">
                    <td>
                      <div class="d-flex align-center ga-2">
                        <v-avatar :color="reasonConfig(event.reason).color" size="32" rounded>
                          <v-icon :icon="reasonConfig(event.reason).icon" size="16" color="white" />
                        </v-avatar>
                        <span class="font-weight-medium">{{ reasonConfig(event.reason).label }}</span>
                      </div>
                    </td>
                    <td>{{ formatDate(event.transferred_at) }}</td>
                    <td>{{ getSiteName(event.from_site_id) || "—" }}</td>
                    <td>{{ getSiteName(event.to_site_id) || "—" }}</td>
                  </tr>
                  <tr v-if="!history.length">
                    <td colspan="4" class="text-center text-medium-emphasis">No transfer history yet.</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <div v-else class="text-center pa-8">
      <p class="text-body-1">Motor not found.</p>
      <v-btn color="primary" to="/assembly/jobs">Back to Assembly Jobs</v-btn>
    </div>
  </v-container>
</template>