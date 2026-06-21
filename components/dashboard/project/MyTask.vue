<script setup>
const api = useApi();
const tasks = ref([]);
const loading = ref(true);

const menuList = [
  { title: "Action" },
  { title: "Another Action" },
  { title: "Something elese here" },
];

const tableHeader = ["", "Task", "Status"];

const resolveStatusVariant = (status) => {
  switch (status) {
    case "Received": return { color: "info", text: "Received" };
    case "In Progress": return { color: "warning", text: "In Progress" };
    case "Ready for Sale": return { color: "success", text: "Ready" };
    case "Sold": return { color: "primary", text: "Sold" };
    case "Defective": return { color: "error", text: "Defective" };
    default: return { color: "grey", text: status };
  }
};

onMounted(async () => {
  try {
    const data = await api.get("/assembly/motors");
    tasks.value = Array.isArray(data) ? data.slice(0, 7) : [];
  } catch (e) {
    console.error("Failed to load tasks:", e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <v-card class="h-100">
    <v-card-title class="d-flex align-center justify-space-between">
      <h4 class="text-h4">Recent Motors</h4>
      <v-menu location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            class="text-button"
            size="small"
            variant="outlined"
            color="secondary"
          >
            Filter <v-icon icon="tabler-chevron-down" />
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="(item, i) in menuList" :key="i" :value="item.title">
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-title>
    <v-divider />
    <v-table hover>
      <thead>
        <tr>
          <th v-for="item in tableHeader" :key="item">
            {{ item }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="motor in tasks" :key="motor.motor_id">
          <td class="w-36">
            <v-checkbox />
          </td>
          <td class="min-w-65">
            <div class="d-flex align-center">
              <v-avatar color="grey-lighten-2" size="32" rounded class="mr-2">
                <v-icon icon="tabler-engine" size="18" color="grey-darken-2" />
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ motor.serial_number }}</div>
                <div class="text-caption text-medium-emphasis">{{ motor.model_name }}</div>
              </div>
            </div>
          </td>
          <td class="min-w-37">
            <v-chip
              size="x-small"
              class="font-weight-6"
              :color="resolveStatusVariant(motor.status).color"
              label
            >
              {{ resolveStatusVariant(motor.status).text }}
            </v-chip>
          </td>
        </tr>
        <tr v-if="!tasks.length">
          <td colspan="3" class="text-center text-medium-emphasis py-4">No motors yet.</td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>
