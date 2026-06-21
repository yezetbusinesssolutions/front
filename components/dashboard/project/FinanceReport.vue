<script setup>
const api = useApi();
const { user } = useAuth();
const report = ref({
  totalInvoices: 0,
  totalMotorsSold: 0,
  totalRevenue: 0,
  dailyBreakdown: {},
  paymentBreakdown: {},
});
const loading = ref(true);
const dateRange = ref({ start: "", end: "" });

const loadReport = async () => {
  loading.value = true;
  try {
    const data = await api.get("/sales/reports/financial", dateRange.value);
    report.value = data;
  } catch (e) {
    console.error("Failed to load financial report:", e);
  } finally {
    loading.value = false;
  }
};

onMounted(loadReport);
</script>

<template>
  <v-card>
    <v-card-title class="d-flex align-center justify-space-between">
      <h4 class="text-h4">Financial Report</h4>
      <div class="d-flex ga-2">
        <v-text-field v-model="dateRange.start" label="Start Date" type="date" density="compact" hide-details />
        <v-text-field v-model="dateRange.end" label="End Date" type="date" density="compact" hide-details />
        <v-btn size="small" variant="tonal" color="primary" @click="loadReport">Load</v-btn>
      </div>
    </v-card-title>
    <v-divider />

    <v-card-text>
      <v-row>
        <v-col cols="12" md="4">
          <v-card>
            <v-card-item>
              <div class="text-body-2 text-medium-emphasis">Total Invoices</div>
              <div class="text-h4 font-weight-bold">{{ loading ? '-' : report.totalInvoices }}</div>
            </v-card-item>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card>
            <v-card-item>
              <div class="text-body-2 text-medium-emphasis">Total Motors Sold</div>
              <div class="text-h4 font-weight-bold">{{ loading ? '-' : report.totalMotorsSold }}</div>
            </v-card-item>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card>
            <v-card-item>
              <div class="text-body-2 text-medium-emphasis">Total Revenue</div>
              <div class="text-h4 font-weight-bold">{{ loading ? '-' : report.totalRevenue.toLocaleString() }} ETB</div>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12" md="6">
          <h5 class="text-h5 mb-2">Payment Methods</h5>
          <v-list density="compact">
            <v-list-item v-for="(amount, method) in report.paymentBreakdown" :key="method">
              <v-list-item-title>{{ method }}</v-list-item-title>
              <v-list-item-subtitle>{{ amount.toLocaleString() }} ETB</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-col>
        <v-col cols="12" md="6">
          <h5 class="text-h5 mb-2">Daily Sales</h5>
          <v-list density="compact">
            <v-list-item v-for="(data, day) in report.dailyBreakdown" :key="day">
              <v-list-item-title>{{ day }}</v-list-item-title>
              <v-list-item-subtitle>{{ data.count }} motors - {{ data.revenue.toLocaleString() }} ETB</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>