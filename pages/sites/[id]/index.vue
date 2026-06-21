<script setup>
const route = useRoute();
const api = useApi();
const siteData = ref(null);
const loading = ref(true);

const formatSiteType = (type) => {
  if (!type) return 'N/A';
  switch (type) {
    case "WAREHOUSE": return "Warehouse";
    case "SHOWROOM": return "Showroom";
    case "ASSEMBLY_PLANT": return "Assembly Plant";
    case "JOINT": return "Joint";
    default: return type;
  }
};

onMounted(async () => {
  try {
    const data = await api.get(`/sites/${route.params.id}`);
    siteData.value = data;
  } catch (e) {
    console.error("Failed to load site:", e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <v-container fluid>
    <GlobalsHeader title="Site Details" is-btn btn-color="light" btn-text="Back to Sites" to="/sites" />

    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-item class="pa-6">
            <div v-if="loading" class="text-center pa-4">
              <v-progress-circular indeterminate />
            </div>
            <div v-else-if="siteData">
              <v-row class="mb-4">
                <v-col cols="12" sm="3"><strong>Site Name:</strong></v-col>
                <v-col cols="12" sm="9">{{ siteData.site_name }}</v-col>
              </v-row>
              <v-row class="mb-4">
                <v-col cols="12" sm="3"><strong>Type:</strong></v-col>
                <v-col cols="12" sm="9">{{ formatSiteType(siteData.site_type) }}</v-col>
              </v-row>
              <v-row class="mb-4">
                <v-col cols="12" sm="3"><strong>Address:</strong></v-col>
                <v-col cols="12" sm="9">{{ siteData.address || 'N/A' }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="3"><strong>Site ID:</strong></v-col>
                <v-col cols="12" sm="9">{{ siteData.site_id }}</v-col>
              </v-row>
            </div>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
