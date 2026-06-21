<script setup>
const api = useApi();
const sites = ref([]);
const readyMotors = ref([]);
const selectedMotor = ref(null);
const loading = ref(false);
const error = ref("");
const success = ref(false);
const successMessage = ref("");

const transferForm = ref({
  motor_id: null,
  destination_site_id: "",
});

const transfers = ref([]);
const transfersLoading = ref(false);
const transferSearch = ref("");
const transfersLimit = ref(5);

const route = useRoute();

onMounted(async () => {
  try {
    const [sitesData, motorsData] = await Promise.all([
      api.get("/sites"),
      api.get("/assembly/ready-for-transfer"),
    ]);
    sites.value = sitesData;
    readyMotors.value = motorsData;

    const motorId = Number(route.params.id);
    if (motorId) {
      const motor = readyMotors.value.find((m) => m.motor_id === motorId);
      if (motor) {
        selectedMotor.value = motor;
        transferForm.value.motor_id = motor.motor_id;
      }
    }
  } catch (e) {
    console.error("Failed to load data:", e);
  }
});

const siteName = computed(() => {
  if (!selectedMotor.value) return "";
  const site = sites.value.find((s) => s.site_id === selectedMotor.value.current_site_id);
  return site ? `${site.site_type}: ${site.site_name}` : `Site ${selectedMotor.value.current_site_id}`;
});

const showrooms = computed(() => sites.value.filter((s) => s.site_type === "SHOWROOM"));

const motorOptions = computed(() => {
  return readyMotors.value.map((m) => ({
    title: `${m.serial_number} — ${m.model_name}${m.color ? ` (${m.color})` : ""}`,
    value: m.motor_id,
  }));
});

const onMotorSelect = (motorId) => {
  transferForm.value.motor_id = motorId;
  selectedMotor.value = readyMotors.value.find((m) => m.motor_id === motorId) || null;
};

const onSubmit = async () => {
  if (!transferForm.value.motor_id || !transferForm.value.destination_site_id) {
    error.value = "Please select a motor and destination showroom";
    return;
  }
  loading.value = true;
  error.value = "";
  success.value = false;
  try {
    await api.post(`/assembly/transfer-to-showroom/${transferForm.value.motor_id}`, {
      destination_site_id: Number(transferForm.value.destination_site_id),
    });
    success.value = true;
    successMessage.value = `Motor ${selectedMotor.value?.serial_number} transferred successfully`;
    transferForm.value = { motor_id: null, destination_site_id: "" };
    selectedMotor.value = null;
    await loadTransferHistory();
  } catch (e) {
    error.value = e.data?.detail || "Transfer failed";
  } finally {
    loading.value = false;
  }
};

const loadTransferHistory = async () => {
  transfersLoading.value = true;
  try {
    const data = await api.get("/assembly/transfers");
    transfers.value = Array.isArray(data) ? data : [];
    transfersLimit.value = 5;
  } catch (e) {
    console.error("Failed to load transfers:", e);
  } finally {
    transfersLoading.value = false;
  }
};

const filteredTransfers = computed(() => {
  if (!transferSearch.value) return transfers.value;
  const q = transferSearch.value.toLowerCase();
  return transfers.value.filter((t) => {
    return (
      (t.motor_serial && t.motor_serial.toLowerCase().includes(q)) ||
      String(t.motor_id).includes(q) ||
      (t.from_site_name && t.from_site_name.toLowerCase().includes(q)) ||
      (t.to_site_name && t.to_site_name.toLowerCase().includes(q)) ||
      (t.transferred_by_name && t.transferred_by_name.toLowerCase().includes(q))
    );
  });
});

const visibleTransfers = computed(() => {
  return filteredTransfers.value.slice(0, transfersLimit.value);
});

const canShowMore = computed(() => {
  return filteredTransfers.value.length > transfersLimit.value;
});

const showMore = () => {
  transfersLimit.value = filteredTransfers.value.length;
};

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

onMounted(async () => {
  await loadTransferHistory();
});
</script>

<template>
  <v-container fluid>
    <GlobalsHeader title="Transfer to Showroom" is-btn btn-color="light" btn-text="Back to Assembly" to="/assembly" />

    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card elevation="4">
          <v-card-item class="pa-6">
            <div class="mb-6">
              <p class="text-body-1">Select a motor ready for sale and choose a destination showroom.</p>
            </div>

            <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
            <v-alert v-if="success" type="success" class="mb-4">{{ successMessage }}</v-alert>

            <v-form @submit.prevent="onSubmit">
              <GlobalsAutocomplete
                v-model="transferForm.motor_id"
                :items="motorOptions"
                item-title="title"
                item-value="value"
                label="Select Motor (Ready for Sale)"
                placeholder="Search by serial number or model..."
                :rules="[(v) => !!v || 'Select a motor']"
                clearable
                class="mb-3"
                @update:model-value="onMotorSelect"
              />

              <v-card v-if="selectedMotor" variant="outlined" class="mb-4 pa-3 bg-grey-lighten-4">
                <div class="d-flex align-center ga-2">
                  <v-icon icon="tabler-engine" color="grey" />
                  <div>
                    <div class="text-body-1 font-weight-medium">{{ selectedMotor.serial_number }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ selectedMotor.model_name }}{{ selectedMotor.color ? ` · ${selectedMotor.color}` : "" }}
                      · {{ siteName }}
                    </div>
                  </div>
                </div>
              </v-card>

              <GlobalsAutocomplete
                v-model="transferForm.destination_site_id"
                :items="showrooms"
                item-title="site_name"
                item-value="site_id"
                label="Destination Showroom"
                :rules="[(v) => !!v || 'Select a showroom']"
                class="mb-3"
              />

              <v-btn type="submit" color="primary" block :loading="loading" :disabled="!transferForm.motor_id || !transferForm.destination_site_id">
                Confirm Transfer
              </v-btn>
            </v-form>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-6">
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-2">
            <h4 class="text-h4">Recent Transfer History</h4>
            <GlobalsTextField v-model="transferSearch" placeholder="Search transfers..." class="max-w-300" prepend-inner-icon="tabler-search" />
          </v-card-title>
          <v-divider />

          <div v-if="transfersLoading" class="text-center pa-6">
            <v-progress-circular indeterminate />
          </div>

          <v-table v-else hover density="comfortable">
            <thead>
              <tr>
                <th class="text-left">Motor</th>
                <th class="text-left">From</th>
                <th class="text-left">To</th>
                <th class="text-left">Transferred By</th>
                <th class="text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in visibleTransfers" :key="t.transfer_id">
                <td class="font-weight-medium">{{ t.motor_serial || 'Motor #' + t.motor_id }}</td>
                <td>{{ t.from_site_name || 'Site ' + t.from_site_id }}</td>
                <td>{{ t.to_site_name || 'Site ' + t.to_site_id }}</td>
                <td>{{ t.transferred_by_name || 'User #' + t.transferred_by }}</td>
                <td>{{ formatDate(t.transferred_at) }}</td>
              </tr>
              <tr v-if="!visibleTransfers.length && !transfersLoading">
                <td colspan="5" class="text-center text-medium-emphasis py-4">No transfers found.</td>
              </tr>
            </tbody>
          </v-table>
          <v-card-actions v-if="canShowMore" class="justify-center">
            <v-btn variant="text" color="primary" @click="showMore">Show More</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>