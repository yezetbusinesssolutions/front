<script setup>
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  isBtn: {
    type: Boolean,
    default: false,
  },
  btnColor: {
    type: String,
    default: "primary",
  },
  btnText: {
    type: String,
    default: "Button",
  },
  to: {
    type: String,
    default: "",
  },
  showUserInfo: {
    type: Boolean,
    default: true,
  },
});

const { user, initAuth } = useAuth();

onMounted(() => {
  initAuth();
});
</script>

<template>
  <div class="global-header d-flex align-center justify-space-between pb-5 flex-wrap ga-2">
    <h3 :class="`global-header__text text-h3 ${btnColor === 'light' ? 'text-light' : ''}`">
      {{ props.title }}
    </h3>

    <div class="d-flex align-center ga-3">
      <div class="text-right" v-if="showUserInfo && user">
        <div class="text-body-2 font-weight-medium">{{ user.full_name || user.username }}</div>
        <div class="text-caption text-medium-emphasis">{{ user.role }}</div>
      </div>
      <v-btn v-if="isBtn" :color="btnColor" :to="to">{{ props.btnText }}</v-btn>
    </div>
  </div>
</template>

<style scoped lang="scss">
.global-header {
  &__text {
    z-index: 1;
  }
}
</style>
