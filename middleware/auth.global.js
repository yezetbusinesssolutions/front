export default defineNuxtRouteMiddleware((to) => {
  const isPublic = ["/sign-in", "/sign-up"].includes(to.path);

  if (process.client) {
    const token = localStorage.getItem("token");

    if (!token && !isPublic) {
      return navigateTo("/sign-in");
    }

    if (token && isPublic) {
      return navigateTo("/");
    }
  }
});
