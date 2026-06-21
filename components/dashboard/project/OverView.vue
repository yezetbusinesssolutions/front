<script setup>
const api = useApi();

const formatCurrency = (value) => {
  if (!value && value !== 0) return '0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

const stats = ref({
  totalMotors: 0,
  activeAssembly: 0,
  totalSites: 0,
  readyForTransfer: 0,
  soldToday: 0,
  revenueToday: 0,
});
const loading = ref(true);

onMounted(async () => {
  try {
    const [motors, assembly, sites, ready] = await Promise.all([
      api.get("/assembly/motors").catch(() => []),
      api.get("/assembly/motors", { status: "IN_PROGRESS" }).catch(() => []),
      api.get("/sites").catch(() => []),
      api.get("/assembly/ready-for-transfer").catch(() => []),
    ]);
    const dailyReport = await api.get("/sales/reports/daily").catch(() => ({}));
    
    stats.value = {
      totalMotors: Array.isArray(motors) ? motors.length : 0,
      activeAssembly: Array.isArray(assembly) ? assembly.length : 0,
      totalSites: Array.isArray(sites) ? sites.length : 0,
      readyForTransfer: Array.isArray(ready) ? ready.length : 0,
      soldToday: dailyReport?.total_motors_sold || 0,
      revenueToday: dailyReport?.total_revenue || 0,
    };
  } catch (e) {
    console.error("Failed to load stats:", e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="project-over-view pb-5">
    <v-row>
      <v-col cols="12" md="6" lg="3">
        <v-card class="card-lift">
          <v-card-item>
            <div class="d-flex justify-space-between align-center">
              <h4 class="text-h4">Total Motors</h4>
              <div class="soft-bg-primary size-10">
                <v-icon icon="tabler-engine" size="24" color="primary" />
              </div>
            </div>
            <div class="mt-3 mb-1">
              <h3 class="text-h1">{{ loading ? '-' : stats.totalMotors }}</h3>
            </div>
            <p class="text-body-1">In system</p>
          </v-card-item>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <v-card class="card-lift">
          <v-card-item>
            <div class="d-flex justify-space-between align-center">
              <h4 class="text-h4">Active Assembly</h4>
              <div class="soft-bg-warning size-10">
                <v-icon icon="tabler-loader" size="24" color="warning" />
              </div>
            </div>
            <div class="mt-3 mb-1">
              <h3 class="text-h1">{{ loading ? '-' : stats.activeAssembly }}</h3>
            </div>
            <p class="text-body-1">In progress</p>
          </v-card-item>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <v-card class="card-lift">
          <v-card-item>
            <div class="d-flex justify-space-between align-center">
              <h4 class="text-h4">Sold Today</h4>
              <div class="soft-bg-success size-10">
                <v-icon icon="tabler-shopping-cart" size="24" color="success" />
              </div>
            </div>
            <div class="mt-3 mb-1">
              <h3 class="text-h1">{{ loading ? '-' : stats.soldToday }}</h3>
            </div>
            <p class="text-body-1">Units sold</p>
          </v-card-item>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <v-card class="card-lift">
          <v-card-item>
            <div class="d-flex justify-space-between align-center">
              <h4 class="text-h4">Revenue Today</h4>
              <div class="soft-bg-info size-10">
                <v-icon icon="tabler-currency-dollar" size="24" color="info" />
              </div>
            </div>
            <div class="mt-3 mb-1">
              <h3 class="text-h1">{{ loading ? '-' : formatCurrency(stats.revenueToday) }}</h3>
            </div>
            <p class="text-body-1">ETB</p>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>