<script setup>
const api = useApi();
const deliveries = ref([]);
const sites = ref([]);
const loading = ref(false);
const search = ref("");
const dialog = ref(false);
const formLoading = ref(false);
const formError = ref("");

const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [""],
  sortDesc: [false],
});

const headers = ref([
  { title: "Delivery No", key: "delivery_no" },
  { title: "Supplier", key: "supplier_name" },
  { title: "Received At", key: "received_at" },
  { title: "Site", key: "received_at_site_id" },
  { title: "Actions", key: "actions", sortable: false },
]);

const form = ref({
  delivery_no: "",
  supplier_name: "",
  received_at_site_id: "",
  notes: "",
});

const rules = {
  required: (v) => !!v || "This field is required",
};

onMounted(async () => {
  await Promise.all([loadDeliveries(), loadSites()]);
});

const loadDeliveries = async () => {
  loading.value = true;
  try {
    const data = await api.get("/assembly/deliveries");
    deliveries.value = data;
  } catch (e) {
    console.error("Failed to load deliveries:", e);
  } finally {
    loading.value = false;
  }
};

const loadSites = async () => {
  try {
    const data = await api.get("/sites");
    sites.value = data;
  } catch (e) {
    console.error("Failed to load sites:", e);
  }
};

const openDialog = () => {
  form.value = { delivery_no: "", supplier_name: "", received_at_site_id: "", notes: "" };
  formError.value = "";
  dialog.value = true;
};

const submitDelivery = async () => {
  if (!form.value.received_at_site_id) return;
  formLoading.value = true;
  formError.value = "";
  try {
    await api.post("/assembly/deliveries", {
      delivery_no: form.value.delivery_no || undefined,
      supplier_name: form.value.supplier_name || undefined,
      received_at_site_id: Number(form.value.received_at_site_id),
      notes: form.value.notes || undefined,
    });
    dialog.value = false;
    await loadDeliveries();
  } catch (e) {
    formError.value = e.data?.detail || "Failed to create delivery";
  } finally {
    formLoading.value = false;
  }
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

const siteName = (siteId) => {
  if (!siteId) return "-";
  const site = sites.value.find((s) => s.site_id === siteId);
  return site ? `${site.site_type}: ${site.site_name}` : `Site ${siteId}`;
};
</script>

<template>
  <v-container fluid>
    <GlobalsHeader title="Deliveries" is-btn btn-color="light" btn-text="Back to Assembly" to="/assembly" />

    <v-card>
      <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-2">
        <h4 class="text-h4">Deliveries</h4>
        <div class="d-flex align-center ga-2">
          <GlobalsTextField v-model="search" placeholder="Search deliveries..." class="max-w-300" prepend-inner-icon="tabler-search" />
<v-btn color="primary" variant="elevated" @click="openDialog">
              <v-icon icon="tabler-plus" class="mr-1" />
              Create Stock
            </v-btn>
        </div>
      </v-card-title>
      <v-divider />

      <v-data-table
        :headers="headers"
        :items="deliveries"
        :loading="loading"
        :search="search"
        :items-per-page="options.itemsPerPage"
        :page="options.page"
        :options="options"
        item-value="delivery_id"
        hide-default-footer
      >
        <template #item.received_at="{ item }">
          {{ formatDate(item.received_at) }}
        </template>

        <template #item.received_at_site_id="{ item }">
          {{ siteName(item.received_at_site_id) }}
        </template>

        <template #item.actions="{ item }">
          <v-btn size="small" variant="tonal" color="primary" :to="`/assembly/deliveries/${item.delivery_id}`">
            View Details
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
                :length="Math.ceil(deliveries.length / options.itemsPerPage)"
              />
            </div>
          </v-card-text>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="600">
      <v-card class="pa-6">
        <v-card-item class="pa-0">
          <h4 class="text-h4 mb-4">Create Stock</h4>
          <v-alert v-if="formError" type="error" class="mb-4">{{ formError }}</v-alert>
          <v-form @submit.prevent="submitDelivery">
            <GlobalsTextField
              v-model="form.delivery_no"
              label="Delivery Number (optional)"
              placeholder="Leave empty for auto-generated"
              class="mb-3"
            />
            <GlobalsTextField
              v-model="form.supplier_name"
              label="Supplier Name (optional)"
              placeholder="Supplier name"
              class="mb-3"
            />
<GlobalsAutocomplete
               v-model="form.received_at_site_id"
               :items="sites"
               item-title="site_name"
               item-value="site_id"
               label="Receiving Site"
               :rules="[rules.required]"
               class="mb-3"
             />
            <GlobalsTextField
              v-model="form.notes"
              label="Notes (optional)"
              placeholder="Any additional notes"
              class="mb-3"
            />
            <div class="d-flex justify-end ga-2">
              <v-btn variant="tonal" color="grey" @click="dialog = false">Cancel</v-btn>
              <v-btn color="primary" variant="elevated" type="submit" :loading="formLoading">Create Stock</v-btn>
            </div>
          </v-form>
        </v-card-item>
      </v-card>
    </v-dialog>
  </v-container>
</template>