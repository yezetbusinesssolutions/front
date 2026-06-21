<script setup>
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

const salesMenu = [
  { title: "Showroom", to: "/showroom", icon: "tabler-building-store" },
  { title: "Create Invoice", to: "/showroom/invoices/create", icon: "tabler-receipt" },
  { title: "Invoices", to: "/showroom/invoices", icon: "tabler-history" },
];

const adminMenu = [
  { title: "Pending Approvals", to: "/showroom/pending", icon: "tabler-clock" },
];

defineProps({
  menuType: {
    type: String,
    default: "vertical",
  },
});

const showSales = () => {
  const role = auth.user?.role;
  return role === "ADMIN" || role === "SALES_REP";
};
</script>

<template>
  <template v-if="menuType === 'vertical'">
    <div v-if="showSales()" class="vertical-nav-list__label">Sales</div>
    <v-list-group v-if="showSales()" value="sales">
      <template #activator="{ props }">
        <v-list-item v-bind="props" title="Sales" class="vertical-nav-list__item py-2">
          <template #prepend>
            <v-icon icon="tabler-cash" />
          </template>
        </v-list-item>
      </template>

      <v-list-item
        v-for="item in salesMenu"
        :key="item.to"
        class="vertical-nav-list__group"
        :title="item.title"
        :value="item.to"
        :to="item.to"
      />

      <template v-if="auth.isAdmin">
        <v-list-item
          v-for="item in adminMenu"
          :key="item.to"
          class="vertical-nav-list__group"
          :title="item.title"
          :value="item.to"
          :to="item.to"
        />
      </template>
    </v-list-group>
  </template>
</template>
