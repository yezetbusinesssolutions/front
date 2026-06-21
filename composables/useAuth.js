export const useAuth = () => {
  const authStore = useAuthStore();

  const login = async (username, password) => {
    return await authStore.login(username, password);
  };

  const logout = () => {
    authStore.logout();
    navigateTo("/sign-in");
  };

  const getProfile = async () => {
    return await authStore.getProfile();
  };

  const changePassword = async (oldPassword, newPassword) => {
    return await authStore.changePassword(oldPassword, newPassword);
  };

  const isAuthenticated = () => authStore.isAuthenticated;
  const isAdmin = () => authStore.isAdmin;
  const isReceiver = () => authStore.isReceiver;
  const isAssembler = () => authStore.isAssembler;
  const isSalesRep = () => authStore.isSalesRep;
  const initAuth = () => authStore.initAuth();

  return {
    user: computed(() => authStore.user),
    token: computed(() => authStore.token),
    login,
    logout,
    getProfile,
    changePassword,
    isAuthenticated,
    isAdmin,
    isReceiver,
    isAssembler,
    isSalesRep,
    initAuth,
  };
};
