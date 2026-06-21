<script setup>
const route = useRoute();
const api = useApi();
const userData = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const data = await api.get(`/users/${route.params.id}`);
    userData.value = data;
  } catch (e) {
    console.error("Failed to load user:", e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <v-container fluid>
    <GlobalsHeader title="User Details" is-btn btn-color="light" btn-text="Back to Users" to="/users" />

    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-item class="pa-6">
            <div v-if="loading" class="text-center pa-4">
              <v-progress-circular indeterminate />
            </div>
            <div v-else-if="userData">
              <v-row class="mb-4">
                <v-col cols="12" sm="3"><strong>Username:</strong></v-col>
                <v-col cols="12" sm="9">{{ userData.username }}</v-col>
              </v-row>
              <v-row class="mb-4">
                <v-col cols="12" sm="3"><strong>Full Name:</strong></v-col>
                <v-col cols="12" sm="9">{{ userData.full_name }}</v-col>
              </v-row>
              <v-row class="mb-4">
                <v-col cols="12" sm="3"><strong>Role:</strong></v-col>
                <v-col cols="12" sm="9">{{ userData.role }}</v-col>
              </v-row>
              <v-row class="mb-4">
                <v-col cols="12" sm="3"><strong>Assigned Site:</strong></v-col>
                <v-col cols="12" sm="9">{{ userData.assigned_site_id || 'None' }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="3"><strong>User ID:</strong></v-col>
                <v-col cols="12" sm="9">{{ userData.user_id }}</v-col>
              </v-row>
            </div>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
