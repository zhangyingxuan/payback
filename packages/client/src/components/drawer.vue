<template>
  <el-drawer
    v-model="superData.drawerVisible"
    title="我的收藏语句"
    :with-header="false"
    :size="isMobile ? '90%' : '50%'"
    @close="onDrawerClose"
  >
    <DrawerUl
      title="爱问财收藏 - 个股（短线）"
      :urlList="iwencaiCollectShortStockList"
    />
    <br />
    <DrawerUl
      title="爱问财收藏 - 个股（波段）"
      :urlList="iwencaiCollectMiddleStockList"
    />
    <br />
    <DrawerUl
      type="plate"
      title="爱问财收藏 - 行业板块"
      :urlList="iwencaiCollectPlateList"
    />
    <br />

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
    <br />
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
import DrawerUl from './drawer-ul.vue';
import { iwencaiUrl } from '../views/charts/utils/config';
import { isMobile } from '@/core/util';

const iwencaiStockBaseWord =
  '，行业概念，筹码集中，流通市值大于40亿，非创业板，非科创板，非ST&querytype=stock';
/**
 * 爱问财 收藏语句
 */
const iwencaiCollectShortStockList = [
  '跳空高开，成交量倍量，股价在5日均线附近',
  '涨停股价低于20，流通市值低于80亿，涨停时间正序',
  '3板以上，断板个股，涨停时间正序',
  '断板反包涨停板，涨停时间正序',
];
const iwencaiCollectMiddleStockList = [
  '上升趋势，放量初期，股价在5日均线附近',
  '横盘突破，放量初期，股价在5日均线附近',
  '今年涨幅最大的个股20只&querytype=stock',
  '今年跌幅最大的个股20只&querytype=stock',
  // 市场变化：成交量 变化、风格
  // 资金青睐：资金净流入最大的3家
  // 人气：高度最高、人气最高题材、
  // 新：新板块
  // 1、找出出手时机， 阶段1
  // 2、找到板块，阶段2
  // 3、标的 及 目标买卖点
];

const iwencaiCollectPlateList = [
  '5日涨幅最大的行业板块，所属同花顺行业级别是二级行业',
  '5日涨幅最大的概念板块',
  '行业板块',
  '概念板块',
];

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
