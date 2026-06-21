<script setup>
import OverView from "@/components/dashboard/project/OverView.vue";
import TasksPerformance from "@/components/dashboard/project/TasksPerformance.vue";
import ActiveProjects from "@/components/dashboard/project/ActiveProjects.vue";
import MyTask from "@/components/dashboard/project/MyTask.vue";
import Teams from "@/components/dashboard/project/Teams.vue";
import RecentSales from "@/components/dashboard/project/RecentSales.vue";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const layoutClassic = route.path.includes("horizontal");

onMounted(() => {
  if (!auth.isAdmin) {
    if (auth.isSalesRep) {
      router.replace("/showroom");
    } else {
      router.replace("/assembly");
    }
  }
});

const api = useApi();
const recentDeliveries = ref([]);
const deliveriesLoading = ref(true);

onMounted(async () => {
  try {
    const data = await api.get("/assembly/deliveries");
    recentDeliveries.value = Array.isArray(data) ? data.slice(0, 5) : [];
  } catch (e) {
    console.error("Failed to load deliveries:", e);
  } finally {
    deliveriesLoading.value = false;
  }
});

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
</script>

<template>
  <div v-if="auth.isAdmin">
    <div class="project-dashboard ma-n1">
      <div :class="`project-dashboard__background-${layoutClassic ? 'horizontal' : 'classic'}`" />
    </div>

    <v-container fluid>
      <GlobalsHeader title="Dashboard" is-btn btn-color="light" btn-text="Receive Motor Carton from Store" to="/assembly/receive" />
      <over-view />

      <div class="pb-5">
        <v-row>
          <v-col lg="8" cols="12">
            <active-projects />
          </v-col>
          <v-col lg="4" cols="12">
            <tasks-performance />
          </v-col>
        </v-row>
      </div>

      <div class="pb-5">
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title class="d-flex align-center justify-space-between">
                <h4 class="text-h4">Recent Store Items</h4>
                <v-btn size="small" variant="tonal" color="primary" to="/assembly/deliveries">View All</v-btn>
              </v-card-title>
              <v-divider />
              <v-table hover density="comfortable">
                <thead>
                  <tr>
                    <th class="text-left">Delivery No</th>
                    <th class="text-left">Supplier</th>
                    <th class="text-left">Received At</th>
                    <th class="text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="delivery in recentDeliveries" :key="delivery.delivery_id">
                    <td class="font-weight-medium">{{ delivery.delivery_no }}</td>
                    <td>{{ delivery.supplier_name || "—" }}</td>
                    <td>{{ formatDate(delivery.received_at) }}</td>
                    <td>
                      <v-btn size="small" variant="tonal" color="primary" :to="`/assembly/deliveries/${delivery.delivery_id}`">
                        View
                      </v-btn>
                    </td>
                  </tr>
                  <tr v-if="!recentDeliveries.length">
                    <td colspan="4" class="text-center text-medium-emphasis py-4">No deliveries yet.</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <div class="pb-5">
        <v-row>
          <v-col lg="6" cols="12">
            <my-task />
          </v-col>
          <v-col lg="6" cols="12">
            <teams />
          </v-col>
        </v-row>
      </div>

      <div class="pb-5">
        <v-row>
          <v-col cols="12">
            <recent-sales />
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<style scoped lang="scss">
.project-dashboard-background {
  background: rgba(var(--v-theme-primary));
  padding-bottom: 8.5rem;
  padding-top: 3rem;
  position: absolute;
  top: 0;
}

.project-dashboard {
  position: relative;
  &__background-classic {
    @extend .project-dashboard-background;
    width: 100%;
    left: 0px;
  }

  &__background-horizontal {
    @extend .project-dashboard-background;
    width: 200%;
    transform: translate(-20%);
  }
}
</style>
