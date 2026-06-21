<script setup>
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const api = useApi();

const users = ref([]);
const loading = ref(false);
const selectedUser = ref(null);
const search = ref("");
const deleteDialog = ref(false);
const deleteTarget = ref(null);

const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [""],
  sortDesc: [false],
});

const headers = ref([
  { title: "Username", key: "username" },
  { title: "Full Name", key: "full_name" },
  { title: "Role", key: "role" },
  { title: "Actions", key: "actions", sortable: false },
]);

onMounted(async () => {
  await loadUsers();
});

const loadUsers = async () => {
  loading.value = true;
  try {
    const data = await api.get("/users");
    users.value = data;
  } catch (e) {
    console.error("Failed to load users:", e);
  } finally {
    loading.value = false;
  }
};

const onSelect = (event, row) => {
  selectedUser.value = row;
};

const onEdit = () => {
  if (selectedUser.value) {
    navigateTo(`/users/${selectedUser.value.user_id}/edit`);
  }
};

const onView = () => {
  if (selectedUser.value) {
    navigateTo(`/users/${selectedUser.value.user_id}`);
  }
};

const onDelete = (item) => {
  if (!item) return;
  deleteTarget.value = item;
  deleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  const item = deleteTarget.value;
  deleteTarget.value = null;
  try {
    await api.delete(`/users/${item.user_id}`);
    await loadUsers();
    if (selectedUser.value?.user_id === item.user_id) {
      selectedUser.value = null;
    }
  } catch (e) {
    console.error("Failed to delete user:", e);
  }
};

const deleteMessage = computed(() => {
  const username = deleteTarget.value?.username || '';
  return `Are you sure you want to delete user "${username}"? This action cannot be undone.`;
});
</script>

<template>
  <v-container fluid>
    <GlobalsHeader title="Users Management" is-btn btn-color="light" btn-text="Add User" to="/users/create" :show-user-info="false" />

    <v-card>
      <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-2">
        <h4 class="text-h4">All Users</h4>
        <GlobalsTextField v-model="search" placeholder="Search users..." class="max-w-300" prepend-inner-icon="tabler-search" />
      </v-card-title>
      <v-divider />

      <v-data-table
        v-model:selected="selectedUser"
        :headers="headers"
        :items="users"
        :loading="loading"
        :search="search"
        :items-per-page="options.itemsPerPage"
        :page="options.page"
        :options="options"
        show-select
        select-strategy="single"
        item-value="user_id"
        hide-default-footer
      >
        <template #item.actions="{ item }">
          <v-btn size="small" variant="tonal" color="primary" :to="`/users/${item.user_id}`">View</v-btn>
          <v-btn size="small" variant="tonal" color="warning" :to="`/users/${item.user_id}/edit`" class="ml-1">Edit</v-btn>
          <v-btn size="small" variant="tonal" color="error" @click="onDelete(item)" class="ml-1">Delete</v-btn>
        </template>

        <template #bottom>
          <v-card-text class="pt-2">
            <div class="d-flex flex-wrap justify-center justify-sm-space-between gap-y-2 mt-2">
              <v-text-field
                v-model="options.itemsPerPage"
                label="Rows per page:"
                type="number"
                min="-1"
                max="50"
                hide-details
                variant="underlined"
                style="max-inline-size: 8rem; min-inline-size: 5rem"
              />

              <v-pagination
                v-model="options.page"
                :total-visible="$vuetify.display.smAndDown ? 3 : 5"
                :length="Math.ceil(users.length / options.itemsPerPage)"
              />
            </div>
          </v-card-text>
        </template>
      </v-data-table>

      <v-divider v-if="selectedUser" />

      <v-card v-if="selectedUser" flat class="pa-3 bg-grey-lighten-4">
        <div class="d-flex align-center ga-2">
          <span class="text-body-1">Selected: <strong>{{ selectedUser.username }}</strong> ({{ selectedUser.role }})</span>
          <v-spacer />
          <v-btn size="small" variant="tonal" color="primary" :to="`/users/${selectedUser.user_id}`">View</v-btn>
          <v-btn size="small" variant="tonal" color="warning" :to="`/users/${selectedUser.user_id}/edit`">Edit</v-btn>
          <v-btn size="small" variant="tonal" color="error" @click="onDelete(selectedUser)">Delete</v-btn>
        </div>
      </v-card>

      <v-divider />
    </v-card>

    <GlobalsConfirmDialog
      v-model="deleteDialog"
      title="Delete User"
      :message="deleteMessage"
      confirm-text="Delete"
      @confirm="confirmDelete"
    />
  </v-container>
</template>
