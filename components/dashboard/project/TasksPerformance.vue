<script setup>
const api = useApi();
const assemblyStats = ref({
  received: 0,
  inProgress: 0,
  readyForSale: 0,
  sold: 0,
  defective: 0,
});
const loading = ref(true);

const { themeColors } = themeConfig();

const options = {
  chart: {
    type: "donut",
    toolbar: { show: false },
  },
  labels: ["Received", "In Progress", "Ready for Sale", "Sold", "Defective"],
  colors: [
    themeColors.info,
    themeColors.warning,
    themeColors.success,
    themeColors.primary,
    themeColors.error,
  ],
  stroke: { lineCap: "round" },
  plotOptions: {
    radialBar: {
      startAngle: -168,
      endAngle: -450,
      hollow: { size: "55%" },
      track: { background: "transaprent" },
      dataLabels: { show: !1 },
    },
  },
  responsive: [
    {
      breakpoint: 340,
      options: { chart: { height: 250 } },
    },
  ],
};

const series = ref([100, 78, 89]);

const menuList = [
  { title: "Action" },
  { title: "Another Action" },
  { title: "Something elese here" },
];

onMounted(async () => {
  try {
    const [received, inProgress, ready, sold, defective] = await Promise.all([
      api.get("/assembly/motors", { status: "RECEIVED" }),
      api.get("/assembly/motors", { status: "IN_PROGRESS" }),
      api.get("/assembly/motors", { status: "READY_FOR_SALE" }),
      api.get("/assembly/motors", { status: "SOLD" }),
      api.get("/assembly/motors", { status: "DEFECTIVE" }),
    ]);
    const stats = {
      received: Array.isArray(received) ? received.length : 0,
      inProgress: Array.isArray(inProgress) ? inProgress.length : 0,
      readyForSale: Array.isArray(ready) ? ready.length : 0,
      sold: Array.isArray(sold) ? sold.length : 0,
      defective: Array.isArray(defective) ? defective.length : 0,
    };
    assemblyStats.value = stats;
    const total = stats.received + stats.inProgress + stats.readyForSale + stats.sold + stats.defective;
    if (total > 0) {
      series.value = [
        Math.round((stats.received / total) * 100),
        Math.round((stats.inProgress / total) * 100),
        Math.round((stats.readyForSale / total) * 100),
        Math.round((stats.sold / total) * 100),
        Math.round((stats.defective / total) * 100),
      ];
    }
  } catch (e) {
    console.error("Failed to load stats:", e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <ClientOnly>
    <v-card class="h-100">
      <v-card-title class="d-flex align-center justify-space-between">
        <h4 class="text-h4">Assembly Pipeline</h4>
        <v-menu location="start">
          <template v-slot:activator="{ props }">
            <icon-btn size="small" icon="tabler-dots-vertical" v-bind="props" />
          </template>
          <v-list>
            <v-list-item v-for="(item, i) in menuList" :key="i" :value="item.title">
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-card-title>
      <v-divider />
      <v-card-item>
        <div v-if="loading" class="text-center pa-6">
          <v-progress-circular indeterminate />
        </div>
        <div v-else>
          <div class="d-flex aligin-center justify-center">
            <apexchart height="320" type="radialBar" :options="options" :series="series" />
          </div>
          <div class="d-flex aligin-center justify-space-around flex-wrap pt-5 pa-2">
            <div class="text-center">
              <v-icon icon="tabler-package" size="30" class="text-info" />
              <h2 class="text-h2 font-weight-8">{{ assemblyStats.received }}</h2>
              <p class="text-body-1">Received</p>
            </div>
            <div class="text-center">
              <v-icon icon="tabler-loader" size="30" class="text-warning" />
              <h2 class="text-h2 font-weight-8">{{ assemblyStats.inProgress }}</h2>
              <p class="text-body-1">In Progress</p>
            </div>
            <div class="text-center">
              <v-icon icon="tabler-check" size="30" class="text-success" />
              <h2 class="text-h2 font-weight-8">{{ assemblyStats.readyForSale }}</h2>
              <p class="text-body-1">Ready</p>
            </div>
            <div class="text-center">
              <v-icon icon="tabler-receipt" size="30" class="text-primary" />
              <h2 class="text-h2 font-weight-8">{{ assemblyStats.sold }}</h2>
              <p class="text-body-1">Sold</p>
            </div>
            <div class="text-center">
              <v-icon icon="tabler-alert-triangle" size="30" class="text-error" />
              <h2 class="text-h2 font-weight-8">{{ assemblyStats.defective }}</h2>
              <p class="text-body-1">Defective</p>
            </div>
          </div>
        </div>
      </v-card-item>
    </v-card>
  </ClientOnly>
</template>
