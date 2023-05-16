import { defineStore } from 'pinia';

export const useSidebarStore = defineStore('sidebar', {
  state: () => {
    return {
      collapse: true,
      countDays: 20,
    };
  },
  getters: {},
  actions: {
    handleCollapse() {
      this.collapse = !this.collapse;
    },
    updateCountDays(countDays: number) {
      this.countDays = countDays;
    }
  }
});
