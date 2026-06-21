<script setup>
const api = useApi();
const users = ref([]);
const loading = ref(true);

const menuList = [
  { title: "Action" },
  { title: "Another Action" },
  { title: "Something elese here" },
];

const tableHeader = ["Name", "Role", "Last Activity", ""];

const resolveStatusVariant = (status) => {
  switch (status) {
    case "ADMIN": return { color: "error", text: "Admin" };
    case "RECEIVER": return { color: "info", text: "Receiver" };
    case "ASSEMBLER": return { color: "warning", text: "Assembler" };
    case "SALES_REP": return { color: "success", text: "Sales Rep" };
    default: return { color: "grey", text: status };
  }
};

onMounted(async () => {
  try {
    const data = await api.get("/users");
    users.value = Array.isArray(data) ? data.slice(0, 7) : [];
  } catch (e) {
    console.error("Failed to load users:", e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <v-card class="h-100">
    <v-card-title class="d-flex align-center justify-space-between">
      <h4 class="text-h4">Team Members</h4>
    </v-card-title>
    <v-divider />

    <v-table hover style="max-height: 420px">
      <thead>
        <tr>
          <th v-for="item in tableHeader" :key="item">
            {{ item }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="user in users" :key="user.user_id">
          <td>
            <div class="d-flex align-center">
              <v-avatar color="grey-lighten-2" size="40" rounded>
                <v-icon icon="tabler-user" size="20" color="grey-darken-2" />
              </v-avatar>
              <div class="pl-3">
                <div class="font-weight-7 mb-n1">{{ user.full_name || user.username }}</div>
                <p class="text-caption">{{ user.username }}</p>
              </div>
            </div>
          </td>
          <td class="min-w-50">
            <v-chip :color="resolveStatusVariant(user.role).color" size="small" label>
              {{ resolveStatusVariant(user.role).text }}
            </v-chip>
          </td>
          <td class="min-w-37">
            <span class="text-body-2 text-medium-emphasis">Active</span>
          </td>
          <td>
            <v-menu location="start">
              <template v-slot:activator="{ props }">
                <icon-btn icon="tabler-dots-vertical" v-bind="props" size="small" />
              </template>
              <v-list>
                <v-list-item v-for="(item, i) in menuList" :key="i" :value="item.title">
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </td>
        </tr>
        <tr v-if="!users.length">
          <td colspan="4" class="text-center text-medium-emphasis py-4">No users found.</td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>
