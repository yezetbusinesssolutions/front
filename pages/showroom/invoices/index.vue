<script setup>
const api = useApi();
const invoices = ref([]);
const loading = ref(false);
const search = ref("");
const statusFilter = ref("APPROVED");

const headers = ref([
  { title: "Invoice No", key: "invoice_no" },
  { title: "Customer", key: "customer_name" },
  { title: "Total", key: "total" },
  { title: "Date", key: "sold_at" },
  { title: "Status", key: "status" },
  { title: "Actions", key: "actions", sortable: false },
]);

const loadInvoices = async () => {
  loading.value = true;
  try {
    const data = await api.get("/sales/invoices", { status: statusFilter.value });
    invoices.value = data;
  } catch (e) {
    console.error("Failed to load invoices:", e);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const statusColor = (status) => {
  switch (status) {
    case "APPROVED": return "success";
    case "PENDING_APPROVAL": return "warning";
    case "REJECTED": return "error";
    case "VOIDED": return "grey";
    default: return "default";
  }
};

watch(statusFilter, loadInvoices);
onMounted(loadInvoices);
</script>

<template>
  <v-container fluid>
    <GlobalsHeader title="Invoices" is-btn btn-color="light" btn-text="Back to Showroom" to="/showroom" />

    <v-card>
      <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-2">
        <h4 class="text-h4">Invoices</h4>
        <div class="d-flex align-center ga-2">
          <v-btn-toggle v-model="statusFilter" density="compact" variant="outlined">
            <v-btn value="APPROVED" size="small">Approved</v-btn>
            <v-btn value="PENDING_APPROVAL" size="small">Pending</v-btn>
            <v-btn value="REJECTED" size="small">Rejected</v-btn>
          </v-btn-toggle>
          <GlobalsTextField v-model="search" placeholder="Search..." class="max-w-300" prepend-inner-icon="tabler-search" />
        </div>
      </v-card-title>
      <v-divider />

      <v-data-table
        :headers="headers"
        :items="invoices"
        :loading="loading"
        :search="search"
        hide-default-footer
      >
        <template #item.total="{ item }">
          {{ item.total }}
        </template>
        <template #item.sold_at="{ item }">
          {{ formatDate(item.sold_at) }}
        </template>
        <template #item.status="{ item }">
          <v-chip :color="statusColor(item.status)" size="small">
            {{ item.status }}
          </v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn size="small" variant="tonal" color="info" :to="`/showroom/invoices/${item.invoice_id}`">
            View
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>