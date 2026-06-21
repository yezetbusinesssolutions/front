<script setup>
import { computed, ref } from "vue";
const api = useApi();
const stats = ref({
  received: 0,
  inProgress: 0,
  readyForSale: 0,
  defective: 0,
});
const motors = ref([]);
const kanbanLoading = ref(true);
const statsLoading = ref(true);

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

const statusLabels = {
  RECEIVED: "Received",
  IN_PROGRESS: "In Progress",
  READY_FOR_SALE: "Ready for Sale",
  DEFECTIVE: "Defective",
};

const statusColumns = [
  { key: "RECEIVED", title: "Received", icon: "tabler-package" },
  { key: "IN_PROGRESS", title: "In Progress", icon: "tabler-loader" },
  { key: "READY_FOR_SALE", title: "Ready for Sale", icon: "tabler-check" },
  { key: "DEFECTIVE", title: "Defective", icon: "tabler-alert-triangle" },
];

const motorsByStatus = computed(() => {
  const grouped = {};
  statusColumns.forEach((col) => {
    grouped[col.key] = motors.value.filter((m) => m.status === col.key);
  });
  return grouped;
});

const draggedMotor = ref(null);
const defectDialog = ref(false);
const defectReason = ref("");
const transferDialog = ref(false);
const transferTarget = ref(null);
const selectedDestination = ref("");
const transferDestinations = ref([]);
const kanbanError = ref("");

const onDragStart = (motor, status) => {
  draggedMotor.value = { motor, fromStatus: status };
};

const onDragEnd = () => {
  draggedMotor.value = null;
};

const onDrop = async (targetStatus) => {
  if (!draggedMotor.value) return;
  const { motor, fromStatus } = draggedMotor.value;
  if (fromStatus === targetStatus) {
    draggedMotor.value = null;
    return;
  }
  if (fromStatus === "READY_FOR_SALE" && targetStatus === "RECEIVED") {
    kanbanError.value = "Motor already for sale — cannot be moved back to Received";
    setTimeout(() => { kanbanError.value = ""; }, 3000);
    draggedMotor.value = null;
    return;
  }
  if (targetStatus === "DEFECTIVE") {
    defectReason.value = "";
    defectDialog.value = true;
    return;
  }
  if (targetStatus === "READY_FOR_SALE") {
    await api.post(`/assembly/complete-assembly/${motor.motor_id}`);
    transferTarget.value = motor;
    selectedDestination.value = "";
    const data = await api.get("/sites");
    transferDestinations.value = data.filter((s) => s.site_type === "SHOWROOM");
    transferDialog.value = true;
    draggedMotor.value = null;
    return;
  }
  try {
    if (targetStatus === "IN_PROGRESS") {
      await api.post(`/assembly/start-assembly/${motor.motor_id}`);
    } else if (targetStatus === "RECEIVED") {
      await api.put(`/assembly/motors/${motor.motor_id}`, {
        status: "RECEIVED",
        assembly_started: null,
        assembled_at: null,
        assembled_by: null,
      });
    }
    await loadMotors();
  } catch (e) {
    console.error("Failed to update status:", e);
  } finally {
    draggedMotor.value = null;
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

const confirmDefect = async () => {
  if (!draggedMotor.value || !defectReason.value.trim()) return;
  const motor = draggedMotor.value.motor;
  try {
    await api.post(`/assembly/mark-defective/${motor.motor_id}`, null, {
      params: { reason: defectReason.value },
    });
    await loadMotors();
  } catch (e) {
    console.error("Failed to mark defective:", e);
  } finally {
    defectDialog.value = false;
    defectReason.value = "";
    draggedMotor.value = null;
  }
};

const loadMotors = async () => {
  try {
    const allMotors = await api.get("/assembly/motors");
    motors.value = Array.isArray(allMotors) ? allMotors : [];
  } catch (e) {
    console.error("Failed to load motors:", e);
  }
};

onMounted(async () => {
  await loadMotors();
  try {
    const [received, inProgress, ready, defective] = await Promise.all([
      api.get("/assembly/motors", { status: "RECEIVED" }),
      api.get("/assembly/motors", { status: "IN_PROGRESS" }),
      api.get("/assembly/motors", { status: "READY_FOR_SALE" }),
      api.get("/assembly/motors", { status: "DEFECTIVE" }),
    ]);
    stats.value = {
      received: Array.isArray(received) ? received.length : 0,
      inProgress: Array.isArray(inProgress) ? inProgress.length : 0,
      readyForSale: Array.isArray(ready) ? ready.length : 0,
      defective: Array.isArray(defective) ? defective.length : 0,
    };
  } catch (e) {
    console.error("Failed to load stats:", e);
  } finally {
    statsLoading.value = false;
    kanbanLoading.value = false;
  }
});
</script>

<template>
  <v-container fluid>
    <GlobalsHeader title="Assembly Overview" is-btn btn-color="light" btn-text="Receive Motor Carton from Store" to="/assembly/receive" />

    <div class="project-over-view pb-5">
      <v-row>
        <v-col cols="12" md="6" lg="3">
          <v-card class="card-lift">
            <v-card-item>
              <div class="d-flex justify-space-between align-center">
                <h4 class="text-h4">Received</h4>
                <div class="soft-bg-info size-10">
                  <v-icon icon="tabler-package" size="24" color="info" />
                </div>
              </div>
              <div class="mt-3 mb-1">
                <h3 class="text-h1">{{ statsLoading ? '-' : stats.received }}</h3>
              </div>
              <p class="text-body-1">Awaiting assembly</p>
            </v-card-item>
          </v-card>
        </v-col>

        <v-col cols="12" md="6" lg="3">
          <v-card class="card-lift">
            <v-card-item>
              <div class="d-flex justify-space-between align-center">
                <h4 class="text-h4">In Progress</h4>
                <div class="soft-bg-warning size-10">
                  <v-icon icon="tabler-loader" size="24" color="warning" />
                </div>
              </div>
              <div class="mt-3 mb-1">
                <h3 class="text-h1">{{ statsLoading ? '-' : stats.inProgress }}</h3>
              </div>
              <p class="text-body-1">Currently assembling</p>
            </v-card-item>
          </v-card>
        </v-col>

        <v-col cols="12" md="6" lg="3">
          <v-card class="card-lift">
            <v-card-item>
              <div class="d-flex justify-space-between align-center">
                <h4 class="text-h4">Ready for Sale</h4>
                <div class="soft-bg-success size-10">
                  <v-icon icon="tabler-check" size="24" color="success" />
                </div>
              </div>
              <div class="mt-3 mb-1">
                <h3 class="text-h1">{{ statsLoading ? '-' : stats.readyForSale }}</h3>
              </div>
              <p class="text-body-1">In showroom</p>
            </v-card-item>
          </v-card>
        </v-col>

        <v-col cols="12" md="6" lg="3">
          <v-card class="card-lift">
            <v-card-item>
              <div class="d-flex justify-space-between align-center">
                <h4 class="text-h4">Defective</h4>
                <div class="soft-bg-error size-10">
                  <v-icon icon="tabler-alert-triangle" size="24" color="error" />
                </div>
              </div>
              <div class="mt-3 mb-1">
                <h3 class="text-h1">{{ statsLoading ? '-' : stats.defective }}</h3>
              </div>
              <p class="text-body-1">Needs attention</p>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <v-row>
      <v-col cols="12" md="6" lg="3" v-for="column in statusColumns" :key="column.key">
        <v-card class="h-100 d-flex flex-column" rounded="lg">
          <v-card-item class="pa-4 flex-shrink-0" :class="`bg-${statusColor(column.key)}-lighten-5`">
            <div class="d-flex align-center">
              <v-avatar :color="statusColor(column.key)" size="40" rounded class="mr-3">
                <v-icon :icon="column.icon" size="22" color="white" />
              </v-avatar>
              <div>
                <h6 class="text-h6 font-weight-medium">{{ column.title }}</h6>
                <span class="text-body-2 text-medium-emphasis">{{ motorsByStatus[column.key]?.length || 0 }} motors</span>
              </div>
            </div>
          </v-card-item>
          <v-divider />
          <v-card-text
            class="pa-3 flex-grow-1 bg-grey-lighten-5"
            style="min-height: 300px; max-height: 500px; overflow-y: auto;"
            @dragover.prevent
            @drop="onDrop(column.key)"
          >
            <div v-if="kanbanLoading" class="text-center pa-6">
              <v-progress-circular indeterminate size="32" :color="statusColor(column.key)" />
            </div>
            <div v-else-if="motorsByStatus[column.key]?.length">
              <v-card
                v-for="motor in motorsByStatus[column.key]"
                :key="motor.motor_id"
                variant="elevated"
                class="mb-3 pipeline-card"
                :to="`/assembly/motors/${motor.motor_id}`"
                draggable="true"
                @dragstart="onDragStart(motor, column.key)"
                @dragend="onDragEnd"
              >
                <v-card-item class="pa-3">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <v-avatar color="grey-lighten-2" size="32" rounded>
                      <v-icon icon="tabler-engine" size="18" color="grey-darken-2" />
                    </v-avatar>
                    <v-chip :color="statusColor(motor.status)" size="x-small" label>
                      {{ statusLabels[motor.status] || motor.status }}
                    </v-chip>
                  </div>
                  <div class="text-body-1 font-weight-bold mb-1">{{ motor.serial_number }}</div>
                  <div class="text-caption text-medium-emphasis mb-1">{{ motor.model_name }}</div>
                  <div class="d-flex align-center text-caption text-medium-emphasis" v-if="motor.color">
                    <v-icon icon="tabler-palette" size="12" class="mr-1" />
                    {{ motor.color }}
                  </div>
                </v-card-item>
              </v-card>
            </div>
            <div v-else class="text-center pa-6">
              <v-icon icon="tabler-package-off" size="40" color="grey-lighten-2" class="mb-2" />
              <p class="text-body-2 text-medium-emphasis">No motors in this stage</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <h4 class="text-h4">Quick Actions</h4>
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="3">
                  <v-btn block variant="outlined" to="/assembly/receive" class="mb-2">
                    <v-icon icon="tabler-package" class="mr-2" />
                    Receive Motor Carton from Store
                  </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-btn block variant="outlined" to="/assembly/jobs" class="mb-2">
                  <v-icon icon="tabler-wrench" class="mr-2" />
                  Assembly Jobs
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-btn block variant="outlined" to="/assembly/transfer" class="mb-2">
                  <v-icon icon="tabler-truck" class="mr-2" />
                  Transfer to Showroom
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-btn block variant="outlined" to="/assembly/deliveries" class="mb-2">
                  <v-icon icon="tabler-truck-delivery" class="mr-2" />
                  Deliveries
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="defectDialog" max-width="500">
      <v-card class="pa-6">
        <v-card-item class="pa-0">
          <div class="d-flex align-center ga-3 mb-4">
            <v-avatar color="error" size="40" rounded>
              <v-icon icon="tabler-alert-octagon" color="white" />
            </v-avatar>
            <h4 class="text-h4">Mark as Defective</h4>
          </div>

          <p class="text-body-1 text-medium-emphasis mb-4">
            You are marking <strong>{{ draggedMotor?.motor?.serial_number }}</strong> as defective. Please provide a reason.
          </p>

          <GlobalsTextField
            v-model="defectReason"
            label="Defect Reason"
            placeholder="e.g. missing parts, damaged frame, electrical failure"
            :rules="[(v) => !!v || 'Reason is required']"
            class="mb-4"
          />

          <div class="d-flex justify-end ga-2">
            <v-btn variant="tonal" color="grey" @click="defectDialog = false">Cancel</v-btn>
            <v-btn color="error" variant="elevated" @click="confirmDefect" :disabled="!defectReason.trim()">
              Mark Defective
            </v-btn>
          </div>
        </v-card-item>
      </v-card>
    </v-dialog>

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

<style lang="scss">
.pipeline-card {
  cursor: grab;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: rgba(var(--v-theme-primary), 0.3);
  }
  &:active {
    cursor: grabbing;
  }
  &.dragging {
    opacity: 0.5;
    transform: rotate(2deg);
  }
}
</style>