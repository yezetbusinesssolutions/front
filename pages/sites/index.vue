<script setup>
const api = useApi();
const sites = ref([]);
const loading = ref(false);
const selectedSite = ref(null);
const search = ref("");
const deleteDialog = ref(false);
const deleteTarget = ref(null);

const formatSiteType = (type) => {
  switch (type) {
    case "WAREHOUSE": return "Warehouse";
    case "SHOWROOM": return "Showroom";
    case "ASSEMBLY_PLANT": return "Assembly Plant";
    case "JOINT": return "Joint";
    default: return type;
  }
};

const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [""],
  sortDesc: [false],
});

const headers = ref([
  { title: "Site Name", key: "site_name" },
  { title: "Type", key: "site_type" },
  { title: "Address", key: "address" },
  { title: "Actions", key: "actions", sortable: false },
]);

onMounted(async () => {
  await loadSites();
});

const loadSites = async () => {
  loading.value = true;
  try {
    const data = await api.get("/sites");
    sites.value = data;
  } catch (e) {
    console.error("Failed to load sites:", e);
  } finally {
    loading.value = false;
  }
};

const onView = () => {
  if (selectedSite.value) {
    navigateTo(`/sites/${selectedSite.value.site_id}`);
  }
};

const onEdit = () => {
  if (selectedSite.value) {
    navigateTo(`/sites/${selectedSite.value.site_id}/edit`);
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
    await api.delete(`/sites/${item.site_id}`);
    await loadSites();
    if (selectedSite.value?.site_id === item.site_id) {
      selectedSite.value = null;
    }
  } catch (e) {
    console.error("Failed to delete site:", e);
  }
};

const deleteMessage = computed(() => {
  const name = deleteTarget.value?.site_name || '';
  return `Are you sure you want to delete site "${name}"? This action cannot be undone.`;
});
</script>

<template>
  <v-container fluid>
    <GlobalsHeader title="Sites Management" is-btn btn-color="light" btn-text="Add Site" to="/sites/create" :show-user-info="false" />

    <v-card>
      <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-2">
        <h4 class="text-h4">All Sites</h4>
        <GlobalsTextField v-model="search" placeholder="Search sites..." class="max-w-300" prepend-inner-icon="tabler-search" />
      </v-card-title>
      <v-divider />

      <v-data-table
        v-model:selected="selectedSite"
        :headers="headers"
        :items="sites"
        :loading="loading"
        :search="search"
        :items-per-page="options.itemsPerPage"
        :page="options.page"
        :options="options"
        show-select
        select-strategy="single"
        item-value="site_id"
        hide-default-footer
      >
        <template #item.site_type="{ item }">
          {{ formatSiteType(item.site_type) }}
        </template>
        <template #item.actions="{ item }">
          <v-btn size="small" variant="tonal" color="primary" :to="`/sites/${item.site_id}`">View</v-btn>
          <v-btn size="small" variant="tonal" color="warning" :to="`/sites/${item.site_id}/edit`" class="ml-1">Edit</v-btn>
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
                :length="Math.ceil(sites.length / options.itemsPerPage)"
              />
            </div>
          </v-card-text>
        </template>
      </v-data-table>

      <v-divider v-if="selectedSite" />

      <v-card v-if="selectedSite" flat class="pa-3 bg-grey-lighten-4">
        <div class="d-flex align-center ga-2">
          <span class="text-body-1">Selected: <strong>{{ selectedSite.site_name }}</strong> ({{ formatSiteType(selectedSite.site_type) }})</span>
          <v-spacer />
          <v-btn size="small" variant="tonal" color="primary" :to="`/sites/${selectedSite.site_id}`">View</v-btn>
          <v-btn size="small" variant="tonal" color="warning" :to="`/sites/${selectedSite.site_id}/edit`">Edit</v-btn>
          <v-btn size="small" variant="tonal" color="error" @click="onDelete(selectedSite)">Delete</v-btn>
        </div>
      </v-card>

      <v-divider />
    </v-card>

    <GlobalsConfirmDialog
      v-model="deleteDialog"
      title="Delete Site"
      :message="deleteMessage"
      confirm-text="Delete"
      @confirm="confirmDelete"
    />
  </v-container>
</template>
