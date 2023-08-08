import { defineStore } from 'pinia';
import dayjs from 'dayjs';

// isAutoRefresh 根据时间判断初始值是否为true；交易时间为true
const currentTime = dayjs();
const currentDate = currentTime.format('YYYY-MM-DD');

function isTradeTime() {
  const day = currentTime.day();
  // 周一到周五 9.19 - 15:00 为交易时间；
  return day >= 1 && day <= 5 && currentTime.isAfter(currentDate + ' 09:19:00') && currentTime.isBefore(currentDate + ' 15:00:00');
}

export const useSidebarStore = defineStore('sidebar', {
  state: () => {
    return {
      collapse: true,
      countDays: 15,
      isAutoRefresh: false,
      // isAutoRefresh: isTradeTime(),
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
      this.isAutoRefresh = isAutoRefresh && isTradeTime();
    }
  }
});
