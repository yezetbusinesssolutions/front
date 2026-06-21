<script setup>
import { useAuthStore } from "@/stores/auth";
const api = useApi();
const auth = useAuthStore();
const motors = ref([]);
const showroomSite = ref(null);
const showrooms = ref([]);
const loading = ref(true);
const search = ref("");
const cart = ref([]);

const headers = ref([
  { title: "Serial", key: "serial_number" },
  { title: "Model", key: "model_name" },
  { title: "Color", key: "color" },
  { title: "", key: "actions", sortable: false },
]);

const loadInventory = async () => {
  loading.value = true;
  try {
    if (showroomSite.value?.site_id) {
      motors.value = await api.get(`/sales/showroom/${showroomSite.value.site_id}/motors`);
    }
  } catch (e) {
    console.error("Failed to load inventory:", e);
  } finally {
    loading.value = false;
  }
};

const addToCart = (motor) => {
  if (!cart.value.find((m) => m.motor_id === motor.motor_id)) {
    cart.value.push(motor);
  }
};

const removeFromCart = (motorId) => {
  cart.value = cart.value.filter((m) => m.motor_id !== motorId);
};

onMounted(async () => {
  await auth.initAuth();

  try {
    const sitesData = await api.get("/sites");
    showrooms.value = sitesData.filter(s => s.site_type === "SHOWROOM");

    const userSiteId = auth.user?.assigned_site_id;

    // Sales rep gets their assigned site, Admin can select any showroom
    if (auth.isSalesRep && userSiteId) {
      showroomSite.value = showrooms.value.find(s => s.site_id === userSiteId) || showrooms.value[0];
    } else if (auth.isAdmin && showrooms.value.length > 0) {
      showroomSite.value = showrooms.value[0];
    }
  } catch (e) {
    console.error("Failed to initialize showroom:", e);
  } finally {
    loading.value = false;
  }

  if (showroomSite.value?.site_id) {
    await loadInventory();
  }
});
</script>

<template>
  <v-container fluid>
    <GlobalsHeader title="Showroom" is-btn btn-color="light" :btn-text="auth.isAdmin ? 'Back to Dashboard' : 'Back to Assembly'" :to="auth.isAdmin ? '/' : '/assembly'" />

    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-2">
            <div class="d-flex align-center ga-2">
              <h4 class="text-h4">Available Motors ({{ showroomSite?.site_name }})</h4>
              <v-select
                v-if="auth.isAdmin"
                :items="showrooms"
                v-model="showroomSite"
                return-object
                item-title="site_name"
                density="compact"
                hide-details
                style="max-width: 200px;"
                @update:model-value="loadInventory"
              />
            </div>
            <GlobalsTextField v-model="search" placeholder="Search..." class="max-w-300" prepend-inner-icon="tabler-search" />
          </v-card-title>
          <v-divider />

          <v-data-table
            :headers="headers"
            :items="motors"
            :loading="loading"
            :search="search"
            item-value="motor_id"
            hide-default-footer
          >
            <template #item.actions="{ item }">
              <v-btn size="small" variant="tonal" color="primary" @click="addToCart(item)">
                Add to Sale
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            <h4 class="text-h4">Shopping Cart ({{ cart.length }})</h4>
          </v-card-title>
          <v-divider />
          <v-card-text>
            <div v-if="cart.length === 0" class="text-center text-medium-emphasis">
              No motors selected
            </div>
            <v-list v-else density="compact">
              <v-list-item v-for="motor in cart" :key="motor.motor_id">
                <v-list-item-title>{{ motor.serial_number }}</v-list-item-title>
                <v-list-item-subtitle>{{ motor.model_name }} {{ motor.color ? `(${motor.color})` : '' }}</v-list-item-subtitle>
                <template #append>
                  <v-btn icon="tabler-trash" size="small" variant="text" @click="removeFromCart(motor.motor_id)" />
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions v-if="cart.length > 0 && showroomSite">
            <v-btn color="primary" block :to="`/showroom/invoices/create?motors=${cart.map(m => m.motor_id).join(',')}`">
              Create Invoice
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>