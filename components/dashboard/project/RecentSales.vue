<script setup>
const api = useApi();
const sales = ref([]);
const loading = ref(true);

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

onMounted(async () => {
  try {
    const data = await api.get("/sales/invoices", { status: "APPROVED" });
    if (Array.isArray(data)) {
      sales.value = data.slice(0, 5).map(i => ({
        invoice_id: i.invoice_id,
        invoice_no: i.invoice_no,
        customer: i.customer_name,
        total: i.total,
        sold_at: i.sold_at,
        motor_count: i.motor_count,
      }));
    }
  } catch (e) {
    console.error("Failed to load sales:", e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <v-card class="h-100">
    <v-card-title class="d-flex align-center justify-space-between">
      <h4 class="text-h4">Recent Sales</h4>
      <v-btn size="small" variant="tonal" color="primary" to="/showroom/invoices">Show More</v-btn>
    </v-card-title>
    <v-divider />

    <v-table hover style="max-height: 420px">
      <thead>
        <tr>
          <th>Invoice No</th>
          <th>Customer</th>
          <th>Total</th>
          <th>Date</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="sale in sales" :key="sale.invoice_id">
          <td class="font-weight-medium">{{ sale.invoice_no }}</td>
          <td>{{ sale.customer }}</td>
          <td>{{ sale.total.toLocaleString() }} ETB</td>
          <td>{{ formatDate(sale.sold_at) }}</td>
        </tr>
        <tr v-if="!sales.length">
          <td colspan="4" class="text-center text-medium-emphasis py-4">No sales yet.</td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>