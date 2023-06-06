import { defineStore } from 'pinia';

export const useSidebarStore = defineStore('sidebar', {
  state: () => {
    return {
      collapse: true,
      countDays: 15,
      evenBoardTDialogVisible: false,
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
    updateEvenBoardDialogVisible(visible: boolean) {
      this.evenBoardTDialogVisible = visible;
    }
  }
});
