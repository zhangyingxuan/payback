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

    <el-tag class="ml-2" type="error">承接力</el-tag>
    <el-tag class="ml-2" type="error">预期</el-tag>

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

    <br />
    <el-descriptions
      class="margin-top"
      title="短线情绪周期"
      :column="isMobile ? 1 : 2"
      :size="isMobile ? 'small' : 'large'"
      border
    >
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">1. 启动（迷茫阶段，冰点转折）</div>
        </template>
        特征：亏钱效应结束后，开始出现4板，连板小于10，
        不会出现15%以上大面，昨涨停开盘无溢价直接闷杀或昨涨停票今跌停，炸板股明显减少，甚至开始出现代表情绪好转的大长腿<br />
        机会：打首板（规避前题材） <br />
        注意：要从全局考虑
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            2.发酵（行情确认，分歧转一致的过程）【赚钱】
          </div>
        </template>
        特征：出现一只打破空间&gt;=5，带动板块，赚钱效应启动，并出现涨停潮（情绪发酵期是龙头股选手大展身手、上仓位的最关键阶段），连板股数量&gt;=10；没有天地板、炸板大面票，昨日断板票今天会有修复，大长腿也经常出现
        <br />
        机会：选市场选出来的空间板，或补涨2板<br />
        注意：要有人气，符合当下热点，新题材
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">3. 高潮期(加速上涨龙头筑顶）【赚钱】</div>
        </template>
        特征：市场总龙头开始震荡筑顶，各种加速缩量板甚至连续一字板个股出现，且出现补涨龙时，指数情绪周期彻底达到高潮。板块出现批量涨停潮，连板股数量&gt;=15；梯队整齐，几乎没有高位炸板、炸板大面、昨日涨停今天跌停、昨日涨停今天闷杀，无-&gt;10%短线大面股<br />
        机会：分支或接力龙头<br />
        注意：炸板风险
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">4. 退潮（总龙头见顶，情绪退潮）【亏钱】</div>
        </template>
        特征：总龙头见顶，高位连板股出现亏钱效应。炸板大面票、昨日涨停今天跌停、昨日涨停今天闷杀的票批量出现，尤其高位炸板股增多，极端的出现天地板等大面。（不是每个情绪周期都是完整的，有高潮-退潮-继续高潮，也有刚刚启动或发酵就夭折）<br />
        机会：低吸反包，新题材首板<br />
        注意：炸板风险和新题材识别度，亏损原因：中高位股和新题材的接力
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            5. 冰点（连板数量骤然降低，连板高度受压制3/4板）【亏钱】
          </div>
        </template>
        特征：竞价低开，瀑布大面，总龙头继续杀跌，无赚钱效应。连板高度受压制
        3/4板高度。虽然还是会有个股走出连板，但连板数量相对于前面的阶段骤然降低，跌停家数比较高，龙头杀跌（回撤20-30%），一些补涨股继续杀跌。打的好板，次日根本没有溢价就直接开始杀跌，短线情绪走到冰点。有的题材周期，情绪冰点后，还有二冰、三冰<br />
        机会：博弈龙回头，新题材首板<br />
        注意：风险极高，尽量回避（亏损原因：中高位股和新题材的接力）
      </el-descriptions-item>
    </el-descriptions>
    <br />
    <el-descriptions
      class="margin-top"
      title="月度时间周期"
      :column="isMobile ? 1 : 2"
      :size="isMobile ? 'small' : 'large'"
      border
    >
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">月度时间周期</div>
        </template>
        短线赚钱效应最好的是前面两个周的交易日，即上旬和中旬，月初效应，上旬赚钱效应最好，下旬（每个月20号以后）赚钱效应最差，月盈则亏，周期循环
      </el-descriptions-item>
    </el-descriptions>
  </el-drawer>
</template>
<script lang="ts" setup>
import DrawerUl from './drawer-ul.vue';
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
