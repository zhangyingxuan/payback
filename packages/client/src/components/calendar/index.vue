<template>
  <!-- <span class="time">{{ time }}</span> -->
  <span v-html="text"></span>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import dayjs from 'dayjs';

const time = ref('');
const FAVS = ['元旦', '劳动', '国庆', '春节', '清明', '端午', '中秋'];
const arr = [
  0, 0, 46, 3, 94, 4, 120, 1, 168, 5, 266, 6, 273, 2, 365, 0, 400, 3, 459, 4,
  485, 1, 522, 5, 620, 6, 638, 2, 730, 0, 754, 3, 824, 4, 851, 1, 906, 5, 1004,
  2, 1004, 6, 1096, 0, 1138, 3, 1189, 4, 1216, 1, 1260, 5, 1359, 6, 1369, 2,
  1461, 0, 1492, 3, 1555, 4, 1581, 1, 1614, 5, 1713, 6, 1734, 2, 1826, 0, 1847,
  3, 1920, 4, 1946, 1, 1998, 5, 2097, 6, 2099, 2, 2191, 0, 2231, 3, 2285, 4,
  2312, 1, 2352, 5, 2451, 6, 2465, 2, 2557, 0, 2585, 3, 2650, 4, 2677, 1, 2707,
  5, 2830, 2, 2835, 6, 2922, 0, 2969, 3, 3016, 4, 3042, 1, 3091, 5, 3189, 6,
  3195, 2, 3287, 0, 3323, 3, 3381, 4, 3407, 1, 3446, 5, 3544, 6, 3560, 2, 3652,
  0, 3677, 3, 3746, 4, 3773, 1, 3800, 5, 3926, 2, 3928, 6, 4018, 0, 4061, 3,
  4111, 4, 4138, 1, 4184, 5, 4282, 6, 4291, 2, 4383, 0, 4416, 3, 4477, 4, 4503,
  1, 4637, 6, 4656, 2,
];
const getResult = (_n: number) => {
  const n = Math.floor((_n - 1514736000000) / 86400000);
  for (let i = 0; i < arr.length; i += 2) {
    if (arr[i] >= n) {
      const result = new Array();
      for (let j = 0; j < 14; j += 2) {
        const m = arr[i + j];
        result.push([arr[i + j + 1], m - n]);
      }
      return result[0];
    }
  }
  return [];
};

const now = new Date().getTime();
const latestFestival = getResult(now);
const text = `${FAVS[latestFestival[0]]}<span class="red bold">${
  latestFestival[1]
}</span>天`;

time.value = dayjs().format('MM-DD HH:mm:ss');
// 设置时间
setInterval(() => {
  time.value = dayjs().format('MM-DD HH:mm:ss');
}, 1000);
</script>

<style scoped lang="less">
.time {
  min-width: 170px;
}
</style>
