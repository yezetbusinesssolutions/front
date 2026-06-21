<script setup>
const auth = useAuth();

const usersMenu = [
  { title: "My Profile", to: "/profile", icon: "tabler-user" },
  { title: "Settings", to: "/settings", icon: "tabler-settings" },
];

const adminMenu = [
  { title: "All Users", to: "/users", icon: "tabler-users" },
  { title: "Create User", to: "/users/create", icon: "tabler-user-plus" },
];

defineProps({
  menuType: {
    type: String,
    default: "vertical",
  },
});
</script>

<template>
  <template v-if="menuType === 'vertical'">
    <v-list-group value="users">
      <template #activator="{ props }">
        <v-list-item v-bind="props" title="Users" class="vertical-nav-list__item py-2">
          <template #prepend>
            <v-icon icon="tabler-user" />
          </template>
        </v-list-item>
      </template>

      <v-list-item
        v-for="item in usersMenu"
        :key="item.to"
        class="vertical-nav-list__group"
        :title="item.title"
        :value="item.to"
        :to="item.to"
      />

      <template v-if="auth.user.value?.role === 'ADMIN'">
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