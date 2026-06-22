<script setup>
import { useSyncQueueStore } from "@/stores/syncQueue";

const api = useApi();
const route = useRoute();
const syncStore = useSyncQueueStore();
const availableMotors = ref([]);
const selectedMotors = ref([]);
const sites = ref([]);
const loading = ref(false);
const submitting = ref(false);
const error = ref("");
const offlineSubmitted = ref(false);
const motorSelectionDialog = ref(false);
const paymentProofImage = ref(null);

const ethiopianToGregorian = (ethDate) => {
  if (!ethDate) return "";
  const [year, month, day] = ethDate.split("-").map(Number);
  const gregYear = year + 8;
  return `${gregYear}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const ethiopianToday = () => {
  const today = new Date();
  const ethYear = today.getFullYear() - 8;
  return `${ethYear}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const form = ref({
  customer_name: "",
  customer_id_number: "",
  customer_id_type: "",
  customer_id_issue_date: ethiopianToday(),
  customer_id_expiry_date: ethiopianToday(),
  customer_id_authority: "",
  customer_phone: "",
  customer_alt_phone: "",
  customer_email: "",
  customer_region: "",
  customer_city: "",
  customer_sub_city: "",
  customer_woreda: "",
  customer_house_number: "",
  payment_method: "CASH",
  site_id: "",
  subtotal: 0,
  tax: 0,
  total: 0,
  payment_proof_path: "",
});

const motorIds = computed(() => {
  const query = route.query.motors;
  return query ? query.split(",").map(Number) : [];
});

watch([motorIds, availableMotors], (newVals) => {
  const [newIds, motors] = newVals;
  if (newIds.length > 0 && motors.length > 0) {
    selectedMotors.value = motors.filter(m => newIds.includes(m.motor_id));
    calculateTotals();
  }
});

const loadMotors = async () => {
  try {
    if (form.value.site_id) {
      const motorsData = await api.get(`/sales/showroom/${form.value.site_id}/motors`);
      availableMotors.value = motorsData;
    }
  } catch (e) {
    console.error("Failed to load motors:", e);
  }
};

const calculateTotals = () => {
  const subtotal = selectedMotors.value.reduce((sum, m) => sum + (m.price || 1000), 0);
  form.value.subtotal = subtotal;
  form.value.tax = subtotal * 0.1;
  form.value.total = subtotal + form.value.tax;
};

const openMotorSelection = async () => {
  if (!form.value.site_id) {
    error.value = "Please select a showroom first";
    return;
  }
  await loadMotors();
  motorSelectionDialog.value = true;
};

const toggleMotorSelection = (motor) => {
  const idx = selectedMotors.value.findIndex(m => m.motor_id === motor.motor_id);
  if (idx >= 0) {
    selectedMotors.value.splice(idx, 1);
  } else {
    selectedMotors.value.push(motor);
  }
  calculateTotals();
};

const openPaymentProofPicker = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const result = await api.upload('/sales/upload/payment-proof', formData);
        const fullUrl = result.url.startsWith('http') ? result.url : `/${result.url.startsWith('/') ? result.url.slice(1) : result.url}`;
        form.value.payment_proof_path = result.url;
        paymentProofImage.value = fullUrl;
      } catch (err) {
        error.value = "Failed to upload payment proof";
      }
    }
  };
  input.click();
};

const submitInvoice = async () => {
  if (!form.value.customer_name || !form.value.customer_phone || !form.value.site_id) {
    error.value = "Customer name, phone, and site are required";
    return;
  }

  if (selectedMotors.value.length === 0) {
    error.value = "Please select at least one motor";
    return;
  }

  submitting.value = true;
  error.value = "";

  const submitData = {
    ...form.value,
    customer_id_issue_date: ethiopianToGregorian(form.value.customer_id_issue_date),
    customer_id_expiry_date: ethiopianToGregorian(form.value.customer_id_expiry_date),
    motor_ids: selectedMotors.value.map(m => m.motor_id),
  };

  try {
    const result = await api.post("/sales/invoices", submitData);
    if (result?.offline) {
      offlineSubmitted.value = true;
      error.value = "Saved locally. Will sync when online.";
    } else {
      navigateTo("/showroom/invoices");
    }
  } catch (e) {
    error.value = e.data?.detail || "Failed to create invoice";
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  const sitesData = await api.get("/sites");
  sites.value = sitesData.filter((s) => s.site_type === "SHOWROOM");

  const userShowroom = sites.value.find((s) => s.site_type === "SHOWROOM");
  if (userShowroom) {
    form.value.site_id = userShowroom.site_id;
    await loadMotors();
    if (motorIds.value.length > 0) {
      selectedMotors.value = availableMotors.value.filter(m => motorIds.value.includes(m.motor_id));
      calculateTotals();
    }
  }
});
</script>

<template>
  <v-container fluid>
    <GlobalsHeader title="Create Invoice" is-btn btn-color="light" btn-text="Back to Showroom" to="/showroom" />

    <v-card class="mx-auto" max-width="800">
      <v-card-item class="pa-6">
        <h4 class="text-h4 mb-4">New Invoice</h4>
        
        <v-alert v-if="error" :type="offlineSubmitted ? 'info' : 'error'" class="mb-4">
          {{ error }}
        </v-alert>

        <v-form @submit.prevent="submitInvoice">
          <div class="mb-4">
            <h6 class="text-h6 mb-2">Selected Motors ({{ selectedMotors.length }})</h6>
            <v-chip v-for="motor in selectedMotors" :key="motor.motor_id" class="mr-1 mb-1" closable @click:close="toggleMotorSelection(motor)">
              {{ motor.serial_number }}
            </v-chip>
            <v-btn size="small" variant="outlined" @click="openMotorSelection" class="mb-2">
              <v-icon icon="tabler-plus" class="mr-1" /> Select Motors
            </v-btn>
          </div>

          <h5 class="text-h5 mb-2">Customer Information</h5>
          <p class="text-body-2 text-medium-emphasis mb-3">Full Name must match buyer's official government-issued ID exactly</p>
          
          <GlobalsTextField
            v-model="form.customer_name"
            label="Full Name (as per ID)"
            :rules="[(v) => !!v || 'Full name required']"
            class="mb-3"
          />

          <v-row>
            <v-col cols="12" md="4">
              <GlobalsTextField v-model="form.customer_id_number" label="ID/Passport Number" class="mb-3" />
            </v-col>
            <v-col cols="12" md="4">
              <GlobalsTextField v-model="form.customer_id_type" label="ID Type" placeholder="National ID, Passport, etc." class="mb-3" />
            </v-col>
            <v-col cols="12" md="4">
              <GlobalsTextField v-model="form.customer_id_authority" label="Issuing Authority" class="mb-3" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field 
                v-model="form.customer_id_issue_date" 
                label="Issue Date (Ethiopian)" 
                type="date" 
                class="mb-3" 
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field 
                v-model="form.customer_id_expiry_date" 
                label="Expiry Date (Ethiopian)" 
                type="date" 
                class="mb-3" 
              />
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <h5 class="text-h5 mb-2">Contact Details</h5>
          
          <v-row>
            <v-col cols="12" md="6">
              <GlobalsTextField
                v-model="form.customer_phone"
                label="Primary Phone"
                :rules="[(v) => !!v || 'Phone required']"
                class="mb-3"
              />
            </v-col>
            <v-col cols="12" md="6">
              <GlobalsTextField v-model="form.customer_alt_phone" label="Alternative Phone" class="mb-3" />
            </v-col>
          </v-row>

          <GlobalsTextField v-model="form.customer_email" label="Email" type="email" class="mb-3" />

          <v-divider class="my-4" />

          <h5 class="text-h5 mb-2">Physical Address</h5>

          <v-row>
            <v-col cols="12" md="3">
              <GlobalsTextField v-model="form.customer_region" label="Region" class="mb-3" />
            </v-col>
            <v-col cols="12" md="3">
              <GlobalsTextField v-model="form.customer_city" label="City" class="mb-3" />
            </v-col>
            <v-col cols="12" md="3">
              <GlobalsTextField v-model="form.customer_sub_city" label="Sub-City" class="mb-3" />
            </v-col>
            <v-col cols="12" md="3">
              <GlobalsTextField v-model="form.customer_woreda" label="Woreda" class="mb-3" />
            </v-col>
          </v-row>

          <GlobalsTextField v-model="form.customer_house_number" label="House Number" class="mb-3" />

          <v-divider class="my-4" />

          <h5 class="text-h5 mb-2">Payment</h5>

          <v-row>
            <v-col cols="12" md="4">
              <GlobalsAutocomplete
                v-model="form.payment_method"
                :items="['CASH', 'CARD', 'FINANCING', 'BANK_TRANSFER']"
                label="Payment Method"
                class="mb-3"
              />
            </v-col>
            <v-col cols="12" md="4">
              <GlobalsAutocomplete
                v-model="form.site_id"
                :items="sites"
                item-title="site_name"
                item-value="site_id"
                label="Showroom"
                :rules="[(v) => !!v || 'Showroom required']"
                class="mb-3"
              />
            </v-col>
            <v-col cols="12" md="4">
              <div class="d-flex flex-column">
                <v-btn size="small" variant="outlined" @click="openPaymentProofPicker" class="mb-2">
                  <v-icon icon="tabler-upload" class="mr-1" /> Upload Proof
                </v-btn>
                <img v-if="paymentProofImage" :src="paymentProofImage" style="max-height: 80px; object-fit: contain;" @error="console.error('Preview failed:', paymentProofImage)" />
              </div>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <v-row>
            <v-col cols="12" sm="4">
              <v-text-field v-model.number="form.subtotal" label="Subtotal" type="number" class="mb-2" />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field v-model.number="form.tax" label="Tax (10%)" type="number" class="mb-2" />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field v-model.number="form.total" label="Total" type="number" class="mb-4" />
            </v-col>
          </v-row>

          <v-btn type="submit" color="primary" block :loading="submitting">
            Submit for Approval
          </v-btn>
        </v-form>
      </v-card-item>
    </v-card>

    <v-dialog v-model="motorSelectionDialog" max-width="800">
      <v-card>
        <v-card-title>Select Motors</v-card-title>
        <v-divider />
        <v-card-text>
          <v-data-table
            :items="availableMotors"
            :headers="[
              { title: 'Serial', key: 'serial_number' },
              { title: 'Model', key: 'model_name' },
              { title: 'Color', key: 'color' },
              { title: '', key: 'actions', sortable: false },
            ]"
            item-value="motor_id"
          >
            <template #item.actions="{ item }">
              <v-btn
                :color="selectedMotors.some(m => m.motor_id === item.motor_id) ? 'success' : 'primary'"
                size="small"
                @click="toggleMotorSelection(item)"
              >
                {{ selectedMotors.some(m => m.motor_id === item.motor_id) ? 'Selected' : 'Select' }}
              </v-btn>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" @click="motorSelectionDialog = false">Done</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>