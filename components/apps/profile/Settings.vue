<script setup>
import avatar11 from "/images/avatar/avatar-11.jpg";

const { requiredValidator, passwordValidator, confirmedValidator } = useValidators();

const refBassicForm = ref();
const refPasswordVForm = ref();

const { user, initAuth } = useAuth();
const api = useApi();

const profileImage = ref(avatar11);

const basicForm = reactive({
  username: "",
  fullName: "",
});

const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const loading = ref(false);

onMounted(() => {
  initAuth();
  if (user.value) {
    basicForm.username = user.value.username || "";
    basicForm.fullName = user.value.full_name || "";
  }
});

const onProfileChange = (event) => {
  const file = event.target.files[0];
  profileImage.value = URL.createObjectURL(file);
};

const onBasic = async () => {
  refBassicForm.value?.validate().then(({ valid: isValid }) => {
    if (!isValid) return;
    loading.value = true;
    api.put(`/users/${user.value.user_id}`, {
      username: basicForm.username,
      full_name: basicForm.fullName,
    }).then(() => {
      if (user.value) {
        user.value.username = basicForm.username;
      }
    }).catch((e) => {
      console.error("Failed to update username:", e);
    }).finally(() => {
      loading.value = false;
    });
  });
};

const onPassword = async () => {
  refPasswordVForm.value?.validate().then(({ valid: isValid }) => {
    if (!isValid) return;
    loading.value = true;
    api.post("/auth/change-password", null, {
      params: {
        old_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      },
    }).then(() => {
      passwordForm.currentPassword = "";
      passwordForm.newPassword = "";
      passwordForm.confirmPassword = "";
    }).catch((e) => {
      console.error("Failed to change password:", e);
    }).finally(() => {
      loading.value = false;
    });
  });
};
</script>
<template>
  <!-- General Setting -->
  <v-row>
    <v-col cols="12" md="4" lg="3">
      <div>
        <h4 class="text-h4">General Setting</h4>
        <p class="text-body-1">Profile configuration settings</p>
      </div>
    </v-col>
    <v-col cols="12" md="8" lg="9">
      <v-card>
        <v-card-item>
          <h4 class="text-h4 mb-4">General Settings</h4>
          <v-row align="center">
            <v-col cols="12" sm="4">
              <v-label class="form-label"> Avatar </v-label>
            </v-col>
            <v-col cols="12" sm="8" class="d-flex align-center ga-4">
              <v-avatar size="56" :image="profileImage" />
              <input type="file" ref="file" style="display: none" @change="onProfileChange" />
              <v-btn variant="outlined" color="secondary" @click="$refs.file.click()">
                Upload Photo
              </v-btn>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" sm="4">
              <v-label class="form-label"> Cover photo </v-label>
            </v-col>
            <v-col cols="12" sm="8">
              <GlobalsFileUpload />
              <v-btn class="mt-3" variant="outlined" color="secondary"> Change </v-btn>
            </v-col>
          </v-row>

          <h4 class="text-h4 my-4">Basic information</h4>

          <v-form ref="refBassicForm" @submit.prevent="onBasic">
            <v-row no-gutters class="pb-3">
              <v-col cols="12" sm="4">
                <v-label class="form-label">Username</v-label>
              </v-col>
              <v-col cols="12" sm="8">
                <GlobalsTextField
                  v-model="basicForm.username"
                  :rules="[requiredValidator]"
                  placeholder="Username"
                />
              </v-col>
            </v-row>

            <v-row no-gutters class="pb-3">
              <v-col cols="12" sm="4">
                <v-label class="form-label">Full name</v-label>
              </v-col>
              <v-col cols="12" sm="8">
                <v-row>
                  <v-col cols="12" sm="6" class="pb-0">
                    <GlobalsTextField
                      v-model="basicForm.fullName"
                      :rules="[requiredValidator]"
                      placeholder="Full Name"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <v-col offset-sm="4">
                <v-btn type="submit" :loading="loading"> Save Changes </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card-item>
      </v-card>
    </v-col>
  </v-row>

  <!-- Change Password -->
  <v-row>
    <v-col cols="12" md="4" lg="3">
      <div>
        <h4 class="text-h4">Change Password</h4>
        <p class="text-body-1">Update your password</p>
      </div>
    </v-col>
    <v-col cols="12" md="8" lg="9">
      <v-card>
        <v-card-item>
          <h4 class="text-h4 mb-4">Change your password</h4>
          <v-form ref="refPasswordVForm" @submit.prevent="onPassword">
            <v-row no-gutters class="pb-3">
              <v-col cols="12" sm="4">
                <v-label class="form-label"> Current password </v-label>
              </v-col>
              <v-col cols="12" sm="8">
                <GlobalsTextField
                  v-model="passwordForm.currentPassword"
                  :rules="[requiredValidator, passwordValidator]"
                  placeholder="Enter Current password"
                  type="password"
                />
              </v-col>
            </v-row>
            <v-row no-gutters class="pb-3">
              <v-col cols="12" sm="4">
                <v-label class="form-label"> New password </v-label>
              </v-col>
              <v-col cols="12" sm="8">
                <GlobalsTextField
                  v-model="passwordForm.newPassword"
                  :rules="[requiredValidator, passwordValidator]"
                  placeholder="Enter New password"
                  type="password"
                />
              </v-col>
            </v-row>
            <v-row no-gutters class="pb-3">
              <v-col cols="12" sm="4">
                <v-label class="form-label"> Confirm new password </v-label>
              </v-col>
              <v-col cols="12" sm="8">
                <GlobalsTextField
                  v-model="passwordForm.confirmPassword"
                  :rules="[
                    requiredValidator,
                    confirmedValidator(passwordForm.confirmPassword, passwordForm.newPassword),
                  ]"
                  placeholder="Confirm New password"
                  type="password"
                />

                <div class="mt-4">
                  <p class="text-body-2 font-weight-8">Password requirements:</p>
                  <p class="text-body-1 mb-4">Ensure that these requirements are met:</p>
                  <ul>
                    <li class="text-body-2 py-0">Minimum 8 characters long the more, the better</li>
                    <li class="text-body-2 py-0">At least one lowercase character</li>
                    <li class="text-body-2 py-0">At least one uppercase character</li>
                    <li class="text-body-2 py-0">
                      At least one number, symbol, or whitespace character
                    </li>
                  </ul>
                </div>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col offset-sm="4">
                <v-btn type="submit" :loading="loading"> Save Changes </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card-item>
      </v-card>
    </v-col>
  </v-row>
</template>
