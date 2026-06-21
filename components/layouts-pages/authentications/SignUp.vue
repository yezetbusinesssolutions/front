<script setup>
const { requiredValidator, passwordValidator, confirmedValidator, alphaValidator } = useValidators();

const refVForm = ref();
const isPasswordVisible = ref(false);

const props = defineProps({
  sites: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  initialData: { type: Object, default: null },
  error: { type: String, default: "" },
});

const emit = defineEmits(["submit"]);

const roles = [
  { title: "Receiver", value: "RECEIVER" },
  { title: "Assembler", value: "ASSEMBLER" },
  { title: "Sales Rep", value: "SALES_REP" },
  { title: "Admin", value: "ADMIN" },
];

const form = reactive({
  userName: props.initialData?.username || "",
  fullName: props.initialData?.full_name || "",
  email: "",
  password: "",
  confirmPassword: "",
  role: props.initialData?.role || "RECEIVER",
  assigned_site_id: props.initialData?.assigned_site_id || "",
  policyCheck: false,
});

const errors = ref({
  userName: undefined,
  fullName: undefined,
  password: undefined,
  confirmPassword: undefined,
  role: undefined,
});

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (!isValid) return;
    emit("submit", {
      ...form,
      userName: form.userName,
      fullName: form.fullName,
      role: form.role,
      assigned_site_id: form.assigned_site_id,
      password: form.password,
    });
  });
};
</script>

<template>
  <v-card elevation="4">
    <v-card-item class="pa-6">
      <div class="mb-6">
        <p class="text-body-1">Enter user information.</p>
      </div>

      <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>

      <v-form ref="refVForm" @submit.prevent="onSubmit">
        <GlobalsTextField
          v-model="form.userName"
          label="Username"
          autofocus
          placeholder="Username here"
          :rules="[requiredValidator, alphaDashValidator]"
          :error-messages="errors.userName"
          class="mb-3"
        />

        <GlobalsTextField
          v-model="form.fullName"
          label="Full Name"
          placeholder="Full name here"
          :rules="[requiredValidator]"
          class="mb-3"
        />

        <GlobalsAutocomplete
          v-model="form.role"
          :items="roles"
          item-title="title"
          item-value="value"
          label="Role"
          :rules="[requiredValidator]"
          class="mb-3"
        />

        <GlobalsAutocomplete
          v-model="form.assigned_site_id"
          :items="sites"
          item-title="site_name"
          item-value="site_id"
          label="Assigned Site"
          clearable
          class="mb-3"
        />

        <GlobalsTextField
          v-model="form.password"
          label="Password"
          placeholder="************"
          :rules="[requiredValidator, passwordValidator]"
          :type="isPasswordVisible ? 'text' : 'password'"
          :error-messages="errors.password"
          :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
          @click:append-inner="isPasswordVisible = !isPasswordVisible"
          class="mb-3"
        />

        <GlobalsTextField
          v-model="form.confirmPassword"
          label="Confirm Password"
          placeholder="************"
          :rules="[requiredValidator, confirmedValidator(form.confirmPassword, form.password)]"
          :type="isPasswordVisible ? 'text' : 'password'"
          :error-messages="errors.confirmPassword"
          :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
          @click:append-inner="isPasswordVisible = !isPasswordVisible"
          class="mb-3"
        />

        <v-btn type="submit" block :loading="loading"> Create User </v-btn>
      </v-form>
    </v-card-item>
  </v-card>
</template>
