<script setup>
const api = useApi();
const sites = ref([]);
const availableMotors = ref([]);
const selectedMotors = ref([]);
const invoiceForm = ref({
  site_id: "",
  customer_name: "",
  customer_phone: "",
  payment_method: "Cash",
});
const loading = ref(false);
const error = ref("");

const paymentMethods = [
  { title: "Cash", value: "Cash" },
  { title: "Card", value: "Card" },
  { title: "Financing", value: "Financing" },
  { title: "Bank Transfer", value: "Bank Transfer" },
];

onMounted(async () => {
  try {
    const [sitesData] = await Promise.all([
      api.get("/sites"),
    ]);
    sites.value = sitesData;
    if (sitesData.length > 0) {
      invoiceForm.value.site_id = sitesData[0].site_id;
      await loadAvailableMotors();
    }
  } catch (e) {
    console.error("Failed to load data:", e);
  }
});

const loadAvailableMotors = async () => {
  if (!invoiceForm.value.site_id) return;
  try {
    const data = await api.get(`/sales/showroom/${invoiceForm.value.site_id}/motors`);
    availableMotors.value = data;
  } catch (e) {
    console.error("Failed to load motors:", e);
  }
};

const watchSite = () => {
  loadAvailableMotors();
  selectedMotors.value = [];
};

const subtotal = computed(() => {
  return selectedMotors.value.length * 0;
});

const tax = computed(() => subtotal.value * 0.05);
const total = computed(() => subtotal.value + tax.value);

const onSubmit = async () => {
  loading.value = true;
  error.value = "";
  try {
    await api.post("/sales/invoices", {
      ...invoiceForm.value,
      site_id: Number(invoiceForm.value.site_id),
      motor_ids: selectedMotors.value,
      subtotal: subtotal.value,
      tax: tax.value,
      total: total.value,
    });
    navigateTo("/sales/invoices");
  } catch (e) {
    error.value = e.data?.detail || "Failed to create invoice";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <v-container fluid>
    <GlobalsHeader title="New Invoice" is-btn btn-color="light" btn-text="Back to Sales" to="/sales/inventory" />

    <v-row justify="center">
      <v-col cols="12" lg="8">
        <v-card>
          <v-card-item class="pa-6">
            <h4 class="text-h4 mb-4">Create Sale Invoice</h4>

            <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>

            <v-form @submit.prevent="onSubmit">
              <v-row>
                <v-col cols="12" md="6">
                  <GlobalsAutocomplete
                    v-model="invoiceForm.site_id"
                    :items="sites"
                    item-title="site_name"
                    item-value="site_id"
                    label="Showroom"
                    :rules="[(v) => !!v || 'Select a showroom']"
                    @update:model-value="watchSite"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <GlobalsTextField
                    v-model="invoiceForm.customer_name"
                    label="Customer Name"
                    :rules="[(v) => !!v || 'Required']"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <GlobalsTextField
                    v-model="invoiceForm.customer_phone"
                    label="Customer Phone"
                    :rules="[(v) => !!v || 'Required']"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <GlobalsAutocomplete
                    v-model="invoiceForm.payment_method"
                    :items="paymentMethods"
                    item-title="title"
                    item-value="value"
                    label="Payment Method"
                    :rules="[(v) => !!v || 'Required']"
                  />
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <h4 class="text-h4 mb-3">Select Motors</h4>
              <v-data-table
                :headers="[
                  { title: 'Serial', key: 'serial_number' },
                  { title: 'Model', key: 'model_name' },
                  { title: 'Color', key: 'color' },
                ]"
                :items="availableMotors"
                :custom-filter="() => true"
                show-select
                v-model:selected="selectedMotors"
              >
                <template #item.data-table-select="{ item }">
                  <v-checkbox-btn
                    :model-value="selectedMotors.includes(item.motor_id)"
                    @update:model-value="
                      const idx = selectedMotors.indexOf(item.motor_id);
                      if (idx >= 0) selectedMotors.splice(idx, 1);
                      else selectedMotors.push(item.motor_id);
                    "
                  />
                </template>
              </v-data-table>

              <v-divider class="my-4" />

              <div class="d-flex justify-end">
                <div class="text-right" style="min-width: 200px;">
                  <div class="d-flex justify-space-between mb-2">
                    <span>Subtotal:</span>
                    <span>${{ subtotal.value.toFixed(2) }}</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2">
                    <span>Tax (5%):</span>
                    <span>${{ tax.value.toFixed(2) }}</span>
                  </div>
                  <v-divider class="my-2" />
                  <div class="d-flex justify-space-between text-h5">
                    <span>Total:</span>
                    <span>${{ total.value.toFixed(2) }}</span>
                  </div>
                </div>
              </div>

              <div class="mt-4">
                <v-btn type="submit" color="primary" size="large" block :loading="loading" :disabled="selectedMotors.length === 0">
                  Create Invoice ({{ selectedMotors.length }} motor(s))
                </v-btn>
              </div>
            </v-form>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
