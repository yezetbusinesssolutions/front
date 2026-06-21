<script setup>
const api = useApi();
const invoices = ref([]);
const loading = ref(false);

const headers = ref([
  { title: "Invoice No", key: "invoice_no" },
  { title: "Customer", key: "customer_name" },
  { title: "Total", key: "total" },
  { title: "Date", key: "sold_at" },
  { title: "Actions", key: "actions", sortable: false },
]);

const loadPendingInvoices = async () => {
  loading.value = true;
  try {
    const data = await api.get("/sales/invoices", { status: "PENDING_APPROVAL" });
    invoices.value = data;
  } catch (e) {
    console.error("Failed to load pending invoices:", e);
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
    hour: "2-digit",
    minute: "2-digit",
  });
};

onMounted(loadPendingInvoices);
</script>

<template>
  <v-container fluid>
    <GlobalsHeader title="Pending Approvals" is-btn btn-color="light" btn-text="Back to Showroom" to="/showroom" />

    <v-card>
      <v-card-title>
        <h4 class="text-h4">Invoices Awaiting Approval</h4>
      </v-card-title>
      <v-divider />

      <v-data-table
        :headers="headers"
        :items="invoices"
        :loading="loading"
        hide-default-footer
      >
        <template #item.sold_at="{ item }">
          {{ formatDate(item.sold_at) }}
        </template>
        <template #item.actions="{ item }">
          <v-btn size="small" variant="tonal" color="primary" :to="`/showroom/invoices/${item.invoice_id}`">
            Review
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>