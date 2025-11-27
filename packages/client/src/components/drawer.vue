<template>
  <el-drawer
    v-model="superData.drawerVisible"
    title="我的收藏语句"
    :with-header="false"
    :size="isMobile ? '90%' : '68%'"
    @close="onDrawerClose"
  >
    <pre>
      【早盘工作】<br />
      1. 9点前，外围美股昨日涨跌情况；今日题材梳理 <a href="https://stock.10jqka.com.cn/zaopan/" target="_blank">早盘必读</a>  <a href="http://stock.10jqka.com.cn/fincalendar.shtml" target="_blank">投资日历</a>  <a href="http://stock.10jqka.com.cn/jyts_list/" target="_blank">交易提醒</a> <a href="http://stock.10jqka.com.cn/bktt_list/" target="_blank">四大证券文章精华</a> 
      2. 大盘趋势（高开0.5以上，个股冲高离场；低开0.5以上，个股低吸进场），保本？进攻？全天策略基调，注意变盘
      3. 看集合竞价
          2.1 9.20-9.25，<span style="color: red">一字板方向</span>与前日对比封单多少变化，为资金追随方向，对应 <span style="color: red">板块分支</span>加关注
          2.2 9.24 - 9.25，看9.25一分钟核心标的匹配量，可暴露主力意图（看价格走势，判断出货还是抢筹）
          2.3 9.25 - 9.30，竞价比对昨日功课中，预期差；<span style="color: red">去弱留强</span>，直接删除低开2个点以上的自选股，快速反应强势弱势，使用什么模式，盘面题材整理！！！
          2.4 9.30 后，按昨日计划处理持仓，优先处理不及预期个股。
      4. 选股：留意超预期，筹码，位置，价格，公告业绩，大单；临盘自选低位强势首板，或大资金加持小票
      5. 接力玩法：高开3%以下，最好打板介入； 3-7%适合低吸，7%以上竞价直接上；一字板不打
      
      【盘中消息】
      1. <a href="https://news.10jqka.com.cn/realtimenews.html" target="_blank">同花顺全球财经</a> <a href="https://www.cls.cn/telegraph" target="_blank">财联社电报</a>
    </pre>
    <pre>
      【打板套利操作】<br />
      1. -2-2，10分钟如果快速拉伸，立即在高点清仓
      2. 2-6个点，5分钟未封板，先出一半，上涨继续持有，下跌出局
      3. 高开6个点以上，10-30分钟不冲击涨停，离场
    </pre>
    <pre>
      【午盘工作】<br />
      1. 同花顺午评；
      2. 今日题材梳理
      3. 涨跌停整理；封板率，连板
    </pre>
    <pre>
      【复盘工作】<br />
      1. 市场情绪预判：敬畏市场，预测指数，及板块次日走势，判断次日是否参与，需与市场共振。
      2. 短线情绪预判：高位抱团还是低位补涨？人气股/<a target="_blank" href="http://www.iwencai.com/unifiedwap/result?w=%E6%88%90%E4%BA%A4%E9%A2%9D%E9%99%8D%E5%BA%8F%EF%BC%9B%E6%B5%81%E9%80%9A%E5%B8%82%E5%80%BC%EF%BC%9B%E5%B8%82%E5%80%BC%EF%BC%9B%E6%8D%A2%E6%89%8B%E7%8E%87&querytype=stock">容量核心</a>/龙头 当前阶段，预测明日走势 给出操作预案
      3. 涨停自选，保留所有连板，涨停最早5只股，封单最大5只保留，留意一字板板块及一字原因；炸板、开盘啦/<a target="_blank" href="https://yuanchuang.10jqka.com.cn/mrnxgg_list">同花顺获</a>涨停个股分析。
      4. 跌停自选，作为次日接力多空参考之一
      5. 龙虎榜游资参与情况（哪些在参与资金量如何），方向确定
      6. 消息收集，睡前少爷 + 股道风 + 龙头司令
      7. 制定交易计划（选股/仓位/买卖点/止盈止损位）
    </pre>
    <pre>
      【交易计划】 <br />
      1、首先判断市场此时属于强周期还是弱周期
      2、强周期是因为有新题材或者大题材。选新题材或大题材最强分支板块来做。市场情绪是亢奋的。
      3、强周期做龙头是最好的，如果空间龙倒下就选补涨龙。强周期更关注收益，不考虑风险。
      4、如果是弱周期，弱周期更关注风险，保本是第一位的。
      5、弱周期，市场没有明显利好题材或者市场热点很多，你方唱罢我登场，这是市场资金在试错。
      6、弱周期，市场情绪会逐渐降低到冰点，市场高度板会压缩的很厉害。
      7、弱周期打低位板要比打高度板好，因为更关注风险，保本是第一位的。高度板随时吃面也不是不可能。
      8、强弱转换只在一瞬间，情绪逆转也在一瞬间。所谓领先身位龙、穿越龙也是在弱周期中走出来突然碰上强周期，成了高度龙。
      9、强势追涨，弱势超跌；强周期翻倍，弱周期保本
    </pre>
    <pre>
      【交易模式】<br />
      - 短线
      1. 1+n模式：低位首板断板放量收阳（十字最好），要筹码更集中，波峰中地位好（强势股储备）题材很重要
      2. 炸板弱转强：炸板次日大资金抢筹，高开（昨日情绪影响）；首板烂板，日次高开2个点以内；
      3. 半路首板：板块前排大资金介入，结合板块走势及大环境；买点5/10/20日线附近
      4. 龙头战法
      - 趋势
      1. 埋伏欲突破，创业板
      2. 超跌反弹，放量破下跌趋势
    </pre>
    <pre>
      【超短操盘手法】<br /> 
      如果当日开盘一字涨停或开盘秒板的，坚定持股。（明日关小黑屋除外）
      如当日开盘一字涨停或开盘秒板的，但是盘中突遇大卖单砸盘，则以昨日分时均线为支撑，股价有效跌破则卖出。
      如果当日开盘符合预期，但是开盘后下杀，则观察半个小时，如果分时均线能水平或者往上，并且股价能稳定在分均价线附近，
        则持股到午后14点以后，如收盘前能涨停，则可以选择卖出或继续持股；如分时均线继续往下，股价下跌无突破迹象，则选择卖出。
      如果开盘低于预期，则开盘后观察15分钟左右，如分时均线掉头向下并且股价低于分时均价直接往下，那么立即走人。如能分时均线能
        水平或者往上，并且股价可稳定在分时均线附近，则可格局到14点以后，如封板则可以继续持股，如未封板，可收盘前冲高就跑。
    </pre>
    <!-- 周期：前、中、后 -->
    <!-- 连板预期参考（低于预期则弱）<a href="https://zhuanlan.zhihu.com/p/553621420"></a>
    1、昨日一字板或开盘秒板的。第二天正常预期高开5%以上。
    2、昨日10点前涨停的，第二天正常预期高开4%左右。
    3、昨日11点半前涨停的，第二天正常预期高开3%左右。
    4、昨日午后涨停的，第二天预期平开（-2%—2%）
    5、昨日烂板（开板5次），第二天预计低开（0--2%） -->
    <!-- 关键字： 超卖、超买、预期差、承接、变盘、盘感、情绪、节奏、弱转强 -->
    <el-descriptions
      class="margin-top"
      title="短线情绪周期（龙头、补涨、高低切）"
      :column="isMobile ? 1 : 2"
      :size="isMobile ? 'small' : 'large'"
      border
    >
      <el-descriptions-item label="周期细分">
        1、启动；2、发酵；3、分歧转一致；4、加速；5、分歧转一致；6、加速；7、见顶；8、调整；9、反包；10、衰退。
      </el-descriptions-item>
      <el-descriptions-item label="1. 启动（迷茫阶段，冰点转折）">
        特征：犹豫中复苏，亏钱效应结束后，开始出现4板，连板小于10，
        不会出现15%以上大面，昨涨停开盘无溢价直接闷杀或昨涨停票今跌停，炸板股明显减少，甚至开始出现代表情绪好转的大长腿<br />
        机会：打首板（规避前题材） <br />
        注意：要从全局考虑
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            2.发酵（行情确认，分歧转一致的过程）
            <el-tag size="small" type="danger">【赚钱】</el-tag>
          </div>
        </template>
        特征：出现一只打破空间&gt;=5，带动板块，赚钱效应启动，并出现涨停潮（情绪发酵期是龙头股选手大展身手、上仓位的最关键阶段），连板股数量&gt;=10；没有天地板、炸板大面票，昨日断板票今天会有修复，大长腿也经常出现<br />
        机会：选市场选出来的空间板，或打代表性2板<br />
        注意：要有人气，符合当下热点，新题材
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            3. 高潮期(加速上涨，龙头筑顶）
            <el-tag size="small" type="danger">【赚钱】</el-tag>
          </div>
        </template>
        特征：市场总龙头开始震荡筑顶，各种加速缩量板甚至连续一字板个股出现，且出现补涨龙时，指数情绪周期彻底达到高潮。板块出现批量涨停潮，连板股数量&gt;=15；梯队整齐，几乎没有高位炸板、炸板大面、昨日涨停今天跌停、昨日涨停今天闷杀，无-&gt;10%短线大面股<br />
        机会：分支或接力龙头<br />
        注意：炸板风险
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            4. 退潮（总龙头见顶，情绪退潮）
            <el-tag size="small" type="success">【亏钱】</el-tag>
          </div>
        </template>
        特征：总龙头见顶，高位连板股出现亏钱效应。炸板大面票、昨日涨停今天跌停、昨日涨停今天闷杀的票批量出现，尤其高位炸板股增多，极端的出现天地板等大面。（不是每个情绪周期都是完整的，有高潮-退潮-继续高潮，也有刚刚启动或发酵就夭折）<br />
        机会：低吸反包，新题材首板<br />
        注意：炸板风险和新题材识别度，亏损原因：中高位股和新题材的接力
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            5. 冰点（连板数量骤然降低，连板高度受压制3/4板）
            <el-tag size="small" type="success">【亏钱】</el-tag>
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

    <br />
    <DrawerUl
      tagType="success"
      title="爱问财收藏 - 个股（套利） - 超跌反弹，转势买"
      :urlList="iwencaiCollectChaodieList"
    />
    <DrawerUl
      tagType="success"
      title="爱问财收藏 - 个股（套利） - 欲突破，转势买"
      :urlList="iwencaiCollectYutupoList"
    />
    <br />
    <DrawerUl
      tagType="error"
      title="爱问财收藏 - 个股（短线）- 突破形态"
      :urlList="iwencaiCollectShortStockList"
    />
    <br />
    <DrawerUl
      tagType="success"
      title="爱问财收藏 - 个股（波段）"
      :urlList="iwencaiCollectMiddleStockList"
    />
    <br />
    <DrawerUl
      type="plate"
      tagType="warning"
      title="爱问财收藏 - 行业板块"
      :urlList="iwencaiCollectPlateList"
    />
  </el-drawer>
</template>
<script lang="ts" setup>
import DrawerUl from './drawer-ul.vue';
import { isMobile } from '@/core/util';

// 个股短线后缀
const stockBaseWord =
  '，流通市值<=120亿，流通市值>=20亿，行业概念，筹码集中，非创业板，非科创板，非ST';

// 绩优股，价优股活跃股
const stockSuffix =
  '市盈率大于0；流通市值大于30亿；股价低于50；换手率大于1；非ST；非退市;';
/**
 * 爱问财 超跌反弹
 */
const iwencaiCollectChaodieList = ['wr超卖下跌趋势；今日放量收阳；'];
/**
 * 爱问财 欲突破
 */
const iwencaiCollectYutupoList = ['近5个工作日突破收大阳线；${StockSuffix}'];

/**
 * 爱问财 收藏语句，竞价选股
 */
const iwencaiCollectShortStockList = [
  '昨日首板涨停；昨日竞价量情况；今日竞价量情况',
  '昨日首板涨停；昨日竞价量情况；今日竞价量情况；竞价评级看多',
  '竞价抢筹；竞价情况；竞价看多；10日内有涨停；小幅高开个股；集中度70<=11；',
  '大幅高开；竞价情况；竞价看多；10日内有涨停；按竞价金额排序',
  '跳空高开；竞价情况；竞价看多；股价在5日均线附近',
];
const iwencaiCollectMiddleStockList = [
  '上升趋势，放量初期，股价在5日均线附近',
  '横盘突破，放量初期，股价在5日均线附近',
  '今年涨幅最大的个股20只',
  '今年跌幅最大的个股20只',
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
/*  清除a标签下划线 */
a,
a:visited {
  text-decoration: none;
  color: rgb(64, 66, 185);
}
a:focus,
a:active,
a:hover {
  outline: none;
  color: rgb(64, 66, 185);
}
</style>
