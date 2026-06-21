<script setup>
const api = useApi();
const motors = ref([]);
const sites = ref([]);
const loading = ref(false);
const search = ref("");
const statusFilter = ref("all");

const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [""],
  sortDesc: [false],
});

const deleteDialog = ref(false);
const deleteTarget = ref(null);
const transferDialog = ref(false);
const transferTarget = ref(null);
const transferDestinations = ref([]);
const selectedDestination = ref("");

const headers = ref([
  { title: "Serial Number", key: "serial_number" },
  { title: "Model", key: "model_name" },
  { title: "Color", key: "color" },
  { title: "Status", key: "status" },
  { title: "Site", key: "current_site_id" },
  { title: "Actions", key: "actions", sortable: false },
]);

const statusLabel = (status) => {
  switch (status) {
    case "RECEIVED": return "Receive in Store";
    case "IN_PROGRESS": return "In Progress";
    case "READY_FOR_SALE": return "Ready";
    case "SOLD": return "Sold";
    case "DEFECTIVE": return "Defective";
    default: return status;
  }
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

const filteredMotors = computed(() => {
  const base = motors.value.filter((m) => m.status !== "SOLD");
  if (statusFilter.value === "all") return base;
  return base.filter((m) => m.status === statusFilter.value);
});

const statusCounts = computed(() => {
  const activeMotors = motors.value.filter((m) => m.status !== "SOLD");
  const counts = { all: activeMotors.length };
  activeMotors.forEach((m) => {
    counts[m.status] = (counts[m.status] || 0) + 1;
  });
  return counts;
});

onMounted(async () => {
  await loadMotors();
});

const loadMotors = async () => {
  loading.value = true;
  try {
    const [sitesData, motorsData] = await Promise.all([
      api.get("/sites"),
      api.get("/assembly/motors"),
    ]);
    sites.value = sitesData;
    motors.value = motorsData;
  } catch (e) {
    console.error("Failed to load motors:", e);
  } finally {
    loading.value = false;
  }
};

const siteName = (siteId) => {
  if (!siteId) return "-";
  const site = sites.value.find((s) => s.site_id === siteId);
  return site ? `${site.site_type}: ${site.site_name}` : `Site ${siteId}`;
};

const startAssembly = async (motor) => {
  try {
    await api.post(`/assembly/start-assembly/${motor.motor_id}`);
    await loadMotors();
  } catch (e) {
    console.error("Failed to start assembly:", e);
  }
};

const completeAssembly = async (motor) => {
   try {
     await api.post(`/assembly/complete-assembly/${motor.motor_id}`);
     transferTarget.value = motor;
     selectedDestination.value = "";
     const data = await api.get("/sites");
     transferDestinations.value = data.filter((s) => s.site_type === "SHOWROOM");
     transferDialog.value = true;
   } catch (e) {
     console.error("Failed to complete assembly:", e);
   }
};

const confirmTransfer = async () => {
  if (!transferTarget.value || !selectedDestination.value) return;
  try {
    await api.post(`/assembly/transfer-to-showroom/${transferTarget.value.motor_id}`, {
      destination_site_id: Number(selectedDestination.value),
    });
    transferDialog.value = false;
    transferTarget.value = null;
    selectedDestination.value = "";
    await loadMotors();
  } catch (e) {
    console.error("Failed to transfer:", e);
  }
};

const openDefectDialog = (motor) => {
  deleteTarget.value = motor;
  deleteDialog.value = true;
};

const markDefective = async () => {
  if (!deleteTarget.value) return;
  const motor = deleteTarget.value;
  deleteTarget.value = null;
  const reason = prompt("Enter defect reason:");
  if (!reason) return;
  try {
    await api.post(`/assembly/mark-defective/${motor.motor_id}`, null, {
      params: { reason },
    });
    await loadMotors();
  } catch (e) {
    console.error("Failed to mark defective:", e);
  }
};
</script>

<template>
  <v-container fluid>
    <GlobalsHeader title="Assembly Jobs" is-btn btn-color="light" btn-text="Receive Motor Carton from Store" to="/assembly/receive" />

    <v-card>
      <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-2">
        <h4 class="text-h4">All Motors</h4>
        <GlobalsTextField v-model="search" placeholder="Search motors..." class="max-w-300" prepend-inner-icon="tabler-search" />
      </v-card-title>
      <v-divider />

      <v-row class="pa-4">
        <v-col cols="12">
          <v-btn-toggle v-model="statusFilter" mandatory density="comfortable" variant="outlined" divided>
            <v-btn value="all" size="small">All ({{ statusCounts.all || 0 }})</v-btn>
<v-btn value="RECEIVED" size="small">Receive in Store ({{ statusCounts.RECEIVED || 0 }})</v-btn>
             <v-btn value="IN_PROGRESS" size="small">In Progress ({{ statusCounts['IN_PROGRESS'] || 0 }})</v-btn>
             <v-btn value="READY_FOR_SALE" size="small">Ready ({{ statusCounts['READY_FOR_SALE'] || 0 }})</v-btn>
             <v-btn value="DEFECTIVE" size="small">Defective ({{ statusCounts.DEFECTIVE || 0 }})</v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>
      <v-divider />

      <v-data-table
        :headers="headers"
        :items="filteredMotors"
        :loading="loading"
        :search="search"
        :items-per-page="options.itemsPerPage"
        :page="options.page"
        :options="options"
        item-value="motor_id"
        hide-default-footer
      >
        <template #item.status="{ item }">
          <v-chip size="small" :color="statusColor(item.status)">
            {{ statusLabel(item.status) }}
          </v-chip>
        </template>

        <template #item.current_site_id="{ item }">
          {{ siteName(item.current_site_id) }}
        </template>

        <template #item.actions="{ item }">
          <v-btn
            v-if="item.status === 'RECEIVED'"
            size="small"
            variant="tonal"
            color="primary"
            @click="startAssembly(item)"
          >
            Start
          </v-btn>
          <v-btn
            v-if="item.status === 'IN_PROGRESS'"
            size="small"
            variant="tonal"
            color="success"
            @click="completeAssembly(item)"
          >
            Complete
          </v-btn>
          <v-btn
            v-if="['RECEIVED', 'IN_PROGRESS'].includes(item.status)"
            size="small"
            variant="tonal"
            color="error"
            @click="openDefectDialog(item)"
          >
            Defect
          </v-btn>
          <v-btn
            v-if="item.status === 'READY_FOR_SALE'"
            size="small"
            variant="tonal"
            color="info"
            :to="`/assembly/transfer/${item.motor_id}`"
          >
            Transfer
          </v-btn>
        </template>

        <template #bottom>
          <v-card-text class="pt-2">
            <div class="d-flex flex-wrap justify-center justify-sm-space-between gap-y-2 mt-2">
              <v-text-field
                v-model="options.itemsPerPage"
                label="Rows per page:"
                type="number"
                min="-1"
                max="50"
                hide-details
                variant="underlined"
                style="max-inline-size: 8rem; min-inline-size: 5rem"
              />

              <v-pagination
                v-model="options.page"
                :total-visible="$vuetify.display.smAndDown ? 3 : 5"
                :length="Math.ceil(filteredMotors.length / options.itemsPerPage)"
              />
            </div>
          </v-card-text>
        </template>
      </v-data-table>
    </v-card>

    <GlobalsConfirmDialog
      v-model="deleteDialog"
      title="Mark as Defective"
      message="Are you sure you want to mark this motor as defective? Please provide a reason."
      confirm-text="Mark Defective"
      confirm-color="error"
      @confirm="markDefective"
    />

    <v-dialog v-model="transferDialog" max-width="500">
      <v-card class="pa-6">
        <v-card-item class="pa-0">
          <div class="d-flex align-center ga-3 mb-4">
            <v-avatar color="success" size="40" rounded>
              <v-icon icon="tabler-truck" color="white" />
            </v-avatar>
            <h4 class="text-h4">Transfer to Showroom</h4>
          </div>

          <p class="text-body-1 text-medium-emphasis mb-4">
            Motor <strong>{{ transferTarget?.serial_number }}</strong> is ready for transfer. Select a destination showroom.
          </p>

          <GlobalsAutocomplete
            v-model="selectedDestination"
            :items="transferDestinations"
            item-title="site_name"
            item-value="site_id"
            label="Destination Showroom"
            :rules="[(v) => !!v || 'Select a showroom']"
            class="mb-4"
          />

          <div class="d-flex justify-end ga-2">
            <v-btn variant="tonal" color="grey" @click="transferDialog = false">Cancel</v-btn>
            <v-btn color="success" variant="elevated" @click="confirmTransfer" :disabled="!selectedDestination">
              Confirm Transfer
            </v-btn>
          </div>
        </v-card-item>
      </v-card>
    </v-dialog>
  </v-container>
</template>