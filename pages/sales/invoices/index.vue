<script setup>
const api = useApi();
const invoices = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const data = await api.get("/sales/invoices");
    invoices.value = data;
  } catch (e) {
    console.error("Failed to load invoices:", e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <v-container fluid>
    <GlobalsHeader title="Sales History" is-btn btn-color="light" btn-text="New Sale" to="/sales/invoices/create" />

    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <h4 class="text-h4">All Invoices</h4>
        <v-chip>{{ invoices.length }} records</v-chip>
      </v-card-title>
      <v-divider />

      <v-data-table
        :headers="[
          { title: 'Invoice No', key: 'invoice_no' },
          { title: 'Customer', key: 'customer_name' },
          { title: 'Phone', key: 'customer_phone' },
          { title: 'Payment', key: 'payment_method' },
          { title: 'Total', key: 'total' },
          { title: 'Date', key: 'sold_at' },
        ]"
        :items="invoices"
        :loading="loading"
      >
        <template #item.total="{ item }">
          ${{ Number(item.total).toFixed(2) }}
        </template>
        <template #item.sold_at="{ item }">
          {{ new Date(item.sold_at).toLocaleDateString() }}
        </template>
        <template #item.actions="{ item }">
          <v-btn size="small" variant="tonal" :to="`/sales/invoices/${item.invoice_id}`">
            View
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
