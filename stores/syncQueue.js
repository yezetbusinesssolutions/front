import { defineStore } from "pinia";
import { useAuthStore } from "./auth";

const DB_NAME = "motor-inventory-sync";
const STORE_NAME = "pending-requests";

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
  });
};

export const useSyncQueueStore = defineStore("syncQueue", {
  state: () => ({
    pendingItems: [],
    isProcessing: false,
    error: null,
  }),

  getters: {
    hasPendingSync: (state) => state.pendingItems.length > 0,
    pendingCount: (state) => state.pendingItems.length,
  },

  actions: {
    async initQueue() {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      this.pendingItems = await new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
      });
    },

    async enqueue(request) {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      await new Promise((resolve) => {
        const req = store.add({
          ...request,
          timestamp: Date.now(),
          retryCount: 0,
        });
        req.onsuccess = () => resolve(req.result);
      });
      this.pendingItems = await new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
      });
    },

    async processQueue() {
      if (this.isProcessing || !this.hasPendingSync) return;

      this.isProcessing = true;
      this.error = null;

      const items = [...this.pendingItems];
      for (const item of items) {
        try {
          const response = await fetch(`http://localhost:8000/api/v1${item.endpoint}`, {
            method: item.method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${useAuthStore().token}`,
            },
            body: JSON.stringify(item.body),
          });

          if (response.ok) {
            const db = await openDB();
            const tx = db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            store.delete(item.id);
          } else {
            const data = await response.json();
            this.error = data.detail || "Sync failed";
            const db = await openDB();
            const tx = db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            store.delete(item.id);
          }
        } catch (e) {
          this.error = e.message;
        }
        await this.initQueue();
      }

      this.isProcessing = false;
    },
  },
});