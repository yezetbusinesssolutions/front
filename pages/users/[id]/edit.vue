<script setup>
import SignUp from "@/components/layouts-pages/authentications/SignUp.vue";

const route = useRoute();
const api = useApi();
const sites = ref([]);
const loading = ref(false);
const error = ref("");
const userData = ref(null);

onMounted(async () => {
  try {
    const [data, sitesData] = await Promise.all([
      api.get(`/users/${route.params.id}`),
      api.get("/sites"),
    ]);
    userData.value = data;
    sites.value = sitesData;
  } catch (e) {
    error.value = "Failed to load user";
  }
});

const onSubmit = async (formData) => {
  loading.value = true;
  error.value = "";
  try {
    await api.put(`/users/${route.params.id}`, {
      username: formData.userName,
      full_name: formData.fullName,
      role: formData.role,
      assigned_site_id: formData.assigned_site_id ? Number(formData.assigned_site_id) : null,
      password: formData.password,
    });
    navigateTo("/users");
  } catch (e) {
    error.value = e.data?.detail || "Failed to update user";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <v-container fluid>
    <GlobalsHeader title="Edit User" is-btn btn-color="light" btn-text="Back to Users" to="/users" />

    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card>
          <v-card-item class="pa-6">
            <h4 class="text-h4 mb-4">Edit User</h4>
            <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
            <SignUp
              v-if="userData"
              :sites="sites"
              :loading="loading"
              :initial-data="userData"
              @submit="onSubmit"
            />
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
