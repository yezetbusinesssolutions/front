<script setup>
const auth = useAuth();

const sitesMenu = [
  { title: "All Sites", to: "/sites", icon: "tabler-map-pin" },
  { title: "Create Site", to: "/sites/create", icon: "tabler-plus" },
];

defineProps({
  menuType: {
    type: String,
    default: "vertical",
  },
});

const showSites = () => auth.user.value?.role === "ADMIN";
</script>

<template>
  <template v-if="menuType === 'vertical'">
    <div v-if="showSites()" class="vertical-nav-list__label">Sites</div>
    <v-list-group v-if="showSites()" value="sites">
      <template #activator="{ props }">
        <v-list-item v-bind="props" title="Sites" class="vertical-nav-list__item py-2">
          <template #prepend>
            <v-icon icon="tabler-map-pin" />
          </template>
        </v-list-item>
      </template>

      <v-list-item
        v-for="item in sitesMenu"
        :key="item.to"
        class="vertical-nav-list__group"
        :title="item.title"
        :value="item.to"
        :to="item.to"
      >
        <template #prepend>
          <v-icon :icon="item.icon" />
        </template>
      </v-list-item>
    </v-list-group>
  </template>
</template>
