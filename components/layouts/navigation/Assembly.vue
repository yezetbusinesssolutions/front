<script setup>
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

const assemblyMenu = [
  { title: "Overview", to: "/assembly", icon: "tabler-home" },
  { title: "Receive Motor Carton from Store", to: "/assembly/receive", icon: "tabler-package" },
  { title: "Assembly Jobs", to: "/assembly/jobs", icon: "tabler-wrench" },
  { title: "Store", to: "/assembly/deliveries", icon: "tabler-truck-delivery" },
  { title: "Ready for Transfer", to: "/assembly/transfer", icon: "tabler-truck" },
];

defineProps({
  menuType: {
    type: String,
    default: "vertical",
  },
});

const showAssembly = () => {
  const role = auth.user?.role;
  return role === "ADMIN" || role === "ASSEMBLER" || role === "RECEIVER";
};
</script>

<template>
  <template v-if="menuType === 'vertical'">
    <div v-if="showAssembly()" class="vertical-nav-list__label">Assembly</div>
    <v-list-group v-if="showAssembly()" value="assembly">
      <template #activator="{ props }">
        <v-list-item v-bind="props" title="Assembly" class="vertical-nav-list__item py-2">
          <template #prepend>
            <v-icon icon="tabler-tools" />
          </template>
        </v-list-item>
      </template>

      <v-list-item
        v-for="item in assemblyMenu"
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