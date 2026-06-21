<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "Are you sure?",
  },
  message: {
    type: String,
    default: "This action cannot be undone.",
  },
  confirmText: {
    type: String,
    default: "Delete",
  },
  cancelText: {
    type: String,
    default: "Cancel",
  },
  confirmColor: {
    type: String,
    default: "error",
  },
});

const emit = defineEmits(["update:modelValue", "confirm", "cancel"]);

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const onConfirm = () => {
  emit("confirm");
  dialog.value = false;
};

const onCancel = () => {
  emit("cancel");
  dialog.value = false;
};
</script>

<template>
  <v-dialog v-model="dialog" max-width="400">
    <v-card class="pa-6">
      <v-card-item class="pa-0">
        <div class="d-flex align-center ga-3 mb-4">
          <v-avatar color="error" size="40" rounded>
            <v-icon icon="tabler-alert-octagon" color="white" />
          </v-avatar>
          <h4 class="text-h4">{{ title }}</h4>
        </div>

        <p class="text-body-1 text-medium-emphasis mb-6">{{ message }}</p>

        <div class="d-flex justify-end ga-2">
          <v-btn variant="tonal" color="grey" @click="onCancel">{{ cancelText }}</v-btn>
          <v-btn :color="confirmColor" variant="elevated" @click="onConfirm">{{ confirmText }}</v-btn>
        </div>
      </v-card-item>
    </v-card>
  </v-dialog>
</template>
