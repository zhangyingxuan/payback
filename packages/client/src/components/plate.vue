<template>
  <span class="stock" @click="handleClick" @dblclick="handleDblClick">
    {{ superData.name }}
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
});

const thsUrl = 'http://q.10jqka.com.cn/thshy/detail/code/${code}/';
const iwencaiUrl =
  'https://www.iwencai.com/unifiedwap/result?w=${code}%20&querytype=zhishu';

function handleClick() {
  if (timer) {
    window.clearTimeout(timer);
    timer = null;
  } else {
    timer = window.setTimeout(() => {
      window.open(
        thsUrl.replace(
          '${code}',
          superData.code ? superData.code.split('.')[0] : '',
        ),
        '_blank',
      );
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
