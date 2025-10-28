<template>
  <div class="container">
    <ul class="toc left-toc">
      <li v-for="(t, i) in toc" :key="i" :style="{ paddingLeft: t.indent * 12 + 'px' }"
        :class="{ active: activeIndex === i }" @click="scrollTo(t)">
        {{ t.title }}
      </li>
    </ul>
    <v-md-preview class="right-preview" :text="text" ref="preview" @scroll="onScroll" default-show-toc />
  </div>
</template>
<script setup lang="ts">
import { ref, watch, nextTick, defineProps } from 'vue';
const preview = ref();

let superData = defineProps({
  text: {
    type: String,
    default: '# Hello Vue3 MD\n\n## 目录示例\n\n### 三级标题\n\n正文内容……\n\n## 第二个二级标题\n\n正文内容……'
  },
});
const toc = ref<any[]>([])
const activeIndex = ref(0)

/* 1. 提取目录 */
const buildToc = async () => {
  await nextTick()
  const anchors = preview.value.$el.querySelectorAll('h1,h2,h3,h4,h5,h6')
  const tags = Array.from(new Set(Array.from(anchors).map((e: any) => e.tagName))).sort()
  toc.value = Array.from(anchors).map((el: any) => ({
    title: el.innerText,
    lineIndex: el.getAttribute('data-v-md-line'),
    indent: tags.indexOf(el.tagName)
  }))
}
watch(() => superData.text, buildToc, { immediate: true })

/* 2. 点击目录跳转 */
const scrollTo = async (anchor: any) => {
  await nextTick()
  const el = preview.value.$el.querySelector(`[data-v-md-line="${anchor.lineIndex}"]`)
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}


/* 3. 滚动高亮当前标题 */
const onScroll = (e: any) => {
  const { scrollTop } = e.target;
  const headings = preview.value.$el.querySelectorAll('h1,h2,h3,h4,h5,h6')
  for (let i = headings.length - 1; i >= 0; i--) {
    const top = headings[i].offsetTop
    if (scrollTop >= top - 20) {
      activeIndex.value = toc.value.findIndex(t => t.lineIndex === headings[i].getAttribute('data-v-md-line'))
      break
    }
  }
}
</script>

<style scoped lang="less">
.toc {
  min-width: 220px;
  list-style: none;
  margin: 0;
  padding: 0;
  border-right: 1px solid #e5e5e5;
  /* overflow-y: auto; */
}

.toc li {
  cursor: pointer;
  font-size: 14px;
  line-height: 1.8;
}

.toc li.active {
  color: #409eff;
  font-weight: bold;
}

.container {
  display: flex;
  flex-direction: row;

  .left-toc {
    max-width: 300px;
    flex-basis: 300px;
    position: sticky;
    top: 0;
    left: 0;
  }

  .right-preview {
    overflow: auto;
    flex: 1;
    height: 80vh;
  }
}

/deep/ .vuepress-markdown-body {
  padding: 1rem;
}
</style>