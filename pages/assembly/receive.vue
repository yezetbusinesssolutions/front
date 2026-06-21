<script setup>
const api = useApi();
const sites = ref([]);
const deliveries = ref([]);
const motors = ref([]);
const loading = ref(false);
const error = ref("");
const submitSuccess = ref(false);

const form = ref({
  serial_number: "",
  model_name: "",
  color: "",
  current_site_id: null,
  delivery_no: "",
});

const rules = {
  required: (v) => !!v || "This field is required",
};

onMounted(async () => {
  try {
    const [sitesData, deliveriesData, motorsData] = await Promise.all([
      api.get("/sites"),
      api.get("/assembly/deliveries"),
      api.get("/assembly/motors"),
    ]);
    sites.value = sitesData;
    deliveries.value = deliveriesData;
    motors.value = motorsData || [];
  } catch (e) {
    console.error("Failed to load data:", e);
  }
});

const assemblyPlants = computed(() => sites.value.filter((s) => s.site_type === "ASSEMBLY_PLANT"));

const deliveryOptions = computed(() => {
  return deliveries.value.map((d) => d.delivery_no);
});

const modelOptions = computed(() => {
  const models = [...new Set(motors.value.map((m) => m.model_name).filter(Boolean))];
  return models;
});

const colorOptions = computed(() => {
  const colors = [...new Set(motors.value.map((m) => m.color).filter(Boolean))];
  return colors;
});

const onSubmit = async () => {
  loading.value = true;
  error.value = "";
  submitSuccess.value = false;
  try {
    const motor = await api.post("/assembly/receive-carton", {
      serial_number: form.value.serial_number,
      model_name: form.value.model_name,
      color: form.value.color,
      current_site_id: form.value.current_site_id,
      delivery_no: form.value.delivery_no || undefined,
    });
    // Add the new motor to the list so it appears in suggestions
    motors.value.push(motor);
    // Reset only serial number and delivery for next entry, keep model/color for bulk entry
    form.value.serial_number = "";
    form.value.delivery_no = "";
    submitSuccess.value = true;
    // Clear success message after 3 seconds
    setTimeout(() => { submitSuccess.value = false; }, 3000);
  } catch (e) {
    error.value = e.data?.detail || "Failed to receive carton";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <v-container fluid>
    <GlobalsHeader title="Receive Motor Carton from Store" is-btn btn-color="light" btn-text="Back to Assembly" to="/assembly" />

    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card>
          <v-card-item class="pa-6">
            <h4 class="text-h4 mb-4">Receive Motor Carton from Store</h4>
            <p class="text-body-1 text-medium-emphasis mb-6">
              Scan or enter the carton serial number and select the assembly plant location.
            </p>

<v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
              <v-alert v-if="submitSuccess" type="success" class="mb-4">Motor received successfully. Ready for next entry.</v-alert>

              <v-form @submit.prevent="onSubmit">
              <GlobalsTextField
                v-model="form.serial_number"
                label="Serial Number"
                :rules="[rules.required]"
                class="mb-3"
              />

              <GlobalsCombobox
                v-model="form.model_name"
                :items="modelOptions"
                label="Motor Model"
                :rules="[rules.required]"
                class="mb-3"
              />

              <GlobalsCombobox
                v-model="form.color"
                :items="colorOptions"
                label="Color"
                class="mb-3"
              />

              <GlobalsAutocomplete
                v-model="form.current_site_id"
                :items="assemblyPlants"
                item-title="site_name"
                item-value="site_id"
                label="Assembly Plant"
                :rules="[rules.required]"
                class="mb-3"
              />

              <GlobalsAutocomplete
                v-model="form.delivery_no"
                :items="deliveryOptions"
                label="Delivery Number (optional)"
                hint="Select existing delivery or leave empty for auto-generated"
                persistent-hint
                clearable
                class="mb-3"
              />

              <v-btn type="submit" color="primary" block :loading="loading">
                Receive Motor Carton from Store
              </v-btn>
            </v-form>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>