import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === "ADMIN",
    isReceiver: (state) => state.user?.role === "RECEIVER",
    isAssembler: (state) => state.user?.role === "ASSEMBLER",
    isSalesRep: (state) => state.user?.role === "SALES_REP",
  },

  actions: {
    initAuth() {
      if (process.client) {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        if (storedToken && storedUser) {
          this.token = storedToken;
          this.user = JSON.parse(storedUser);
        }
      }
    },

    setAuth(token, user) {
      this.token = token;
      this.user = user;
      if (process.client) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      if (process.client) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    },

    async login(username, password) {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const data = await $fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      this.setAuth(data.access_token, data.user);
      return data;
    },

    async getProfile() {
      if (!this.token) return null;
      try {
        const data = await $fetch("http://localhost:8000/api/v1/auth/me", {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        this.user = data;
        return data;
      } catch {
        this.logout();
        return null;
      }
    },

    async changePassword(oldPassword, newPassword) {
      const params = new URLSearchParams();
      params.append("old_password", oldPassword);
      params.append("new_password", newPassword);

      return await $fetch("http://localhost:8000/api/v1/auth/change-password", {
        method: "POST",
        body: params,
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
    },
  },
});
