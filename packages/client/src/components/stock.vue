<template>
  <span class="stock" @click="handleClick" @dblclick="handleDblClick">
    {{ superData.name }}
    <template v-if="superData.showCode">&nbsp;{{ superData.code }}</template>
    <el-tag
      v-if="code.startsWith('3') || code.startsWith('688')"
      size="small"
      round
    >
      创
    </el-tag>
    <el-tag v-else-if="code.startsWith('83')" size="small" type="info" round>
      京
    </el-tag>
  </span>
</template>
<script lang="ts" setup>
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
</script>

<style scoped lang="less">
.stock {
  cursor: pointer;
}
</style>
