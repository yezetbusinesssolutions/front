import { fileURLToPath } from "url";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

// PWA Config
const title = "Motor Inventory";
const shortTitle = "Motors";
const description = "Motor Sales & Assembly Management System";
const themeColor = "#1976d2";

export default defineNuxtConfig({
  ssr: false,
  alias: {
    "@configured-variables": fileURLToPath(
      new URL("./assets/styles/_variables.scss", import.meta.url)
    ),
  },

  app: {
    baseURL: "/",
    head: {
      title: title,
      titleTemplate: "%s - Motor Inventory",
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      ],
      meta: [
        { charset: "utf-8" },
        {
          hid: "description",
          name: "description",
          content: description,
        },
        { property: "og:site_name", content: title },
        { hid: "og:type", property: "og:type", content: "website" },
        {
          hid: "og:title",
          property: "og:title",
          content: title,
        },
        {
          hid: "og:description",
          property: "og:description",
          content: description,
        },
      ],
    },
  },

  build: { transpile: ["vuetify"] },

  compatibilityDate: "2024-07-15",

  css: [
    "/assets/styles/_index.scss",
    "/assets/styles/plugin/vue-code-highlighter.css",
    "dropzone-vue/dist/drop-zone.common.css",
    "apexcharts/dist/apexcharts.css",
  ],

  components: [
    {
      path: "~/components/globals",
      prefix: "Globals",
    },
  ],

  devtools: { enabled: false },

  modules: [
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@vite-pwa/nuxt",
    async (options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        config.plugins ||= [];
        config.plugins.push(
          vuetify({
            styles: {
              configFile: "/assets/styles/vuetify/_setting.scss",
            },
          })
        );
      });
    },
  ],

pwa: {
    registerType: "autoUpdate",
    injectRegister: "script",
    meta: {
      viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
      appleStatusBarStyle: "black-translucent",
      appleMobileWebAppCapable: "yes",
    },
    manifest: {
      name: title,
      short_name: shortTitle,
      description: description,
      theme_color: themeColor,
      background_color: "#ffffff",
      display: "standalone",
      start_url: "/",
      icons: [
        {
          src: "/icons/pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/icons/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      screenshots: [
        {
          src: "/icon.png",
          sizes: "512x512",
          type: "image/png",
          form_factor: "wide",
          label: "Motor Inventory Dashboard"
        },
        {
          src: "/icon.png",
          sizes: "512x512",
          type: "image/png",
          label: "Motor Inventory Mobile View"
        }
      ],
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
      runtimeCaching: [
        {
          urlPattern: ({ url }) => url.pathname.startsWith("/api/sales/showroom"),
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "showroom-inventory",
            expiration: { maxEntries: 100 },
          },
        },
        {
          urlPattern: ({ url }) => url.pathname.startsWith("/api/assembly/motors"),
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "assembly-motors",
            expiration: { maxEntries: 100 },
          },
        },
        {
          urlPattern: ({ url }) => url.pathname.startsWith("/api/assembly/deliveries"),
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "assembly-deliveries",
            expiration: { maxEntries: 50 },
          },
        },
        {
          urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
          handler: "NetworkFirst",
          options: {
            cacheName: "api-cache",
            expiration: { maxEntries: 50 },
            networkTimeoutSeconds: 10,
          },
        },
      ],
    },
  },

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
});