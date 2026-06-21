<script setup>
const api = useApi();
const loading = ref(false);
const error = ref("");

const siteTypes = [
  { title: "Warehouse", value: "WAREHOUSE" },
  { title: "Showroom", value: "SHOWROOM" },
  { title: "Assembly Plant", value: "ASSEMBLY_PLANT" },
  { title: "Joint", value: "JOINT" },
];

const form = reactive({
  site_name: "",
  site_type: "",
  address: "",
});

const rules = {
  required: (v) => !!v || "This field is required",
};

const onSubmit = async () => {
  loading.value = true;
  error.value = "";
  try {
    await api.post("/sites", {
      site_name: form.site_name,
      site_type: form.site_type,
      address: form.address || null,
    });
    navigateTo("/sites");
  } catch (e) {
    error.value = e.data?.detail || "Failed to create site";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <v-container fluid>
    <GlobalsHeader title="Create Site" is-btn btn-color="light" btn-text="Back to Sites" to="/sites" />

    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card elevation="4">
          <v-card-item class="pa-6">
            <div class="mb-6">
              <p class="text-body-1">Enter site information.</p>
            </div>

            <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>

            <v-form @submit.prevent="onSubmit">
              <GlobalsTextField
                v-model="form.site_name"
                label="Site Name"
                :rules="[rules.required]"
                class="mb-3"
              />

              <GlobalsAutocomplete
                v-model="form.site_type"
                :items="siteTypes"
                item-title="title"
                item-value="value"
                label="Site Type"
                :rules="[rules.required]"
                class="mb-3"
              />

              <GlobalsTextField
                v-model="form.address"
                label="Address"
                class="mb-3"
              />

              <v-btn type="submit" color="primary" block :loading="loading">
                Create Site
              </v-btn>
            </v-form>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
