<script setup>
const { requiredValidator } = useValidators();
const { login } = useAuth();

const refVForm = ref();
const isPasswordVisible = ref(false);
const username = ref("");
const password = ref("");
const rememberMe = ref(false);
const loading = ref(false);
const error = ref("");

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (!isValid) return;
    loading.value = true;
    error.value = "";
    login(username.value, password.value)
      .then(() => {
        navigateTo("/");
      })
      .catch((err) => {
        error.value = err.data?.detail || "Login failed. Please try again.";
      })
      .finally(() => {
        loading.value = false;
      });
  });
};
</script>

<template>
  <v-card elevation="4">
    <v-card-item class="pa-6">
      <div class="mb-6">
        <h3 class="text-h3 mb-2">SIMONS MC P.L.C</h3>
        <p class="text-body-1">Please enter your user information.</p>
      </div>

      <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>

      <v-form ref="refVForm" @submit.prevent="onSubmit">
        <GlobalsTextField
          v-model="username"
          label="Username"
          autofocus
          placeholder="Enter your username"
          :rules="[requiredValidator]"
          :error-messages="error"
          class="mb-3"
        />

        <GlobalsTextField
          v-model="password"
          label="Password"
          placeholder="************"
          :rules="[requiredValidator]"
          :type="isPasswordVisible ? 'text' : 'password'"
          :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
          @click:append-inner="isPasswordVisible = !isPasswordVisible"
          class="mb-3"
        />

        <v-checkbox v-model="rememberMe" label="Remember me" class="mb-4" />

        <v-btn type="submit" block :loading="loading"> Sign in </v-btn>
        <div class="mt-4 d-flex align-center justify-space-between ga-2 flex-wrap">
          <span></span>
          <NuxtLink to="forget-password" class="font-weight-5"> Forgot your password? </NuxtLink>
        </div>
      </v-form>
    </v-card-item>
  </v-card>
</template>
