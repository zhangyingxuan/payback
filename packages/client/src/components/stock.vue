<template>
  <span
    class="stock"
    :class="superData.class"
    @click="handleClick"
    @dblclick="handleDblClick"
    @mouseover="(e: Event) => handleShowMoreInfo(e)"
  >
    {{ superData.name }}
    <template v-if="superData.showCode">&nbsp;{{ superData.code }}</template>
    <el-tag v-if="code.startsWith('30')" size="small" round>创</el-tag>
    <el-tag v-else-if="code.startsWith('68')" size="small" type="warning" round>
      科
    </el-tag>
    <!-- 北交所的股票代码开头一般为4和8。具体来说，以82、83、87和88开头的股票代码分别表示优先股、普通股票、公开发行股票和公开发行以外的股票。 -->
    <!-- 以400开头的股票代码表示从沪深两市退出到三板的A股股票，以420开头的股票代码表示从沪深两市退出到三板的B股股票，以430开头的股票代码表示做市商改革前的股票，相当于老的新三板股票。 -->
    <el-tag
      v-else-if="code.startsWith('8') || code.startsWith('4')"
      size="small"
      type="info"
      round
    >
      京
    </el-tag>
  </span>
</template>
<script lang="ts" setup>
import { inject } from 'vue';

const showPoper: any = inject('showPoper');
const showTooltip: any = inject('showTooltip');

let timer: any = null;
let superData = defineProps({
  code: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  showCode: {
    type: Boolean,
    default: false,
  },
  class: {
    type: String,
    default: '',
  },
  showOp: {
    type: Boolean,
    default: true,
  },
  showTooltip: {
    type: Boolean,
    default: false,
  },
  toolTipContent: {
    type: String,
    default: '',
  },
});

const thsUrl = 'http://stockpage.10jqka.com.cn/${code}/';
const iwencaiUrl =
  'https://www.iwencai.com/unifiedwap/result?w=${code}%20&querytype=stock';

function handleClick() {
  if (timer) {
    window.clearTimeout(timer);
    timer = null;
  } else {
    timer = window.setTimeout(() => {
      window.open(thsUrl.replace('${code}', superData.code), '_blank');
    }, 300);
  }
}
function handleDblClick() {
  if (timer) {
    window.clearTimeout(timer);
    timer = null;
  }
  window.open(iwencaiUrl.replace('${code}', superData.code), '_blank');
}

function handleShowMoreInfo(e: Event) {
  superData.showOp && showPoper(e.target, superData);
  superData.showTooltip && showTooltip(e.target, superData);
}
</script>

<style lang="less">
.stockOp__popperClass {
  padding: 0 !important;
  width: 93px !important;
  min-width: 93px !important;
  background-color: #409eff;
}
</style>
<style scoped lang="less">
.stock {
  cursor: pointer;
}
.op__btnGroup {
  margin: 0;
}
</style>
