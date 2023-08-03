import { defineStore } from 'pinia';

export const useSidebarStore = defineStore('sidebar', {
  state: () => {
    return {
      collapse: true,
      countDays: 15,
      isAutoRefresh: true,
    };
  },
  getters: {},
  actions: {
    handleCollapse() {
      this.collapse = !this.collapse;
    },
    updateCountDays(countDays: number) {
      this.countDays = countDays;
    },
    updateIsAutoRefresh(isAutoRefresh: boolean) {
      this.isAutoRefresh = isAutoRefresh;
    }
  }
});
