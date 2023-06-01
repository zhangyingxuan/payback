<template>
  <el-drawer
    v-model="superData.drawerVisible"
    title="我的收藏语句"
    :with-header="false"
    :size="isMobile ? '90%' : '50%'"
    @close="onDrawerClose"
  >
    <div><el-tag class="ml-2" type="success">同花顺爱问财收藏</el-tag></div>
    <ul class="iwencaiCollectList__ul">
      <li v-for="(item, index) in iwencaiCollectList" :key="'item' + index">
        <el-link
          :href="iwencaiUrl + item"
          type="primary"
          :underline="false"
          icon="Link"
          target="_blank"
        >
          {{ item }}</el-link
        >
      </li>
    </ul>

    <div><el-tag class="ml-2" type="success">当前市场高标/龙头</el-tag></div>
    <div>
      <el-tag class="ml-2" type="success">龙虎榜</el-tag>
      <ul class="iwencaiCollectList__ul">
        <li>
          <el-link
            type="primary"
            href="https://data.10jqka.com.cn/mobile/transaction/index.html?client_userid=GJkFn&back_source=wxhy&share_hxapp=isc&fontzoom=no#/"
            target="_blank"
            >点击查看</el-link
          >
        </li>
      </ul>
    </div>
    <div>
      <el-tag class="ml-2" type="success">同花顺热榜</el-tag>
      <ul class="iwencaiCollectList__ul">
        <li>
          <el-link
            type="primary"
            href="https://eq.10jqka.com.cn/frontend/thsTopRank/index.html?client_userid=GJkFn&back_source=wxhy&share_hxapp=isc&fontzoom=no#/"
            target="_blank"
            >点击查看</el-link
          >
        </li>
      </ul>
    </div>
  </el-drawer>
</template>
<script lang="ts" setup>
import { iwencaiUrl } from '../views/charts/utils/config';
import { isMobile } from '@/core/util';
/**
 * 爱问财 收藏语句
 */
const iwencaiCollect = {
  // 我最喜欢的股票的关键字
  like1: '上升趋势，放量初期，非创业板，非科创板',
  like2: '横盘突破，放量初期，非创业板，非科创板&querytype=stock',
  tupo: '平台突破，筹码集中，非创业板，非科创板&querytype=stock',
  beiliang:
    '跳空高开，成交量倍量，行业概念，非ST，非创业板，非科创板，非京A&querytype=stock',
  xuangu:
    '涨停股价低于20，流通市值低于80亿，筹码集中，行业概念，非ST，非创业板，非科创板，涨停时间正序&querytype=stock',
  // xuangu: '首次涨停股价低于20，流通市值低于80亿高于10亿，行业板块，非ST&querytype=stock',
  // iLikeWord: '箱体突破或横盘突破，流通市值低于80亿，大于10亿，股价低于20元，放量初期&querytype=stock',
  // 市场变化：成交量 变化、风格
  // 资金青睐：资金净流入最大的3家
  // 人气：高度最高、人气最高题材、
  // 新：新板块
  // 1、找出出手时机， 阶段1
  // 2、找到板块，阶段2
  // 3、标的 及 目标买卖点
};

const iwencaiCollectList = Object.values(iwencaiCollect).map(item => {
  if (item.indexOf('&') > -1) {
    return item.split('&')[0];
  }
  return item;
});

let superData = defineProps({
  drawerVisible: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['closeDrawer']);

function onDrawerClose() {
  emit('closeDrawer');
}
</script>

<style scoped lang="less">
.iwencaiCollectList__ul {
  padding-left: 20px;
}
</style>
