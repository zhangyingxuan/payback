<template>
  <div :class="['chat-message', message.role]">
    <!-- 用户：右侧气泡，纯文本（保留换行） -->
    <template v-if="message.role === 'user'">
      <div class="user-content">
        <div class="user-bubble">{{ message.content }}</div>
        <div v-if="message.content" class="message-actions">
          <el-button class="copy-button" text title="复制消息" aria-label="复制消息" @click="copyMessage">
            <el-icon><CopyDocument /></el-icon>
          </el-button>
          <el-button class="copy-button" text title="重新发送" aria-label="重新发送消息" :disabled="busy" @click="$emit('resend')">
            <el-icon><RefreshRight /></el-icon>
          </el-button>
        </div>
      </div>
    </template>

    <!-- 助手：全宽，markdown 渲染 + 工具调用状态 -->
    <template v-else>
      <div class="assistant-avatar" aria-hidden="true"><el-icon><DataAnalysis /></el-icon></div>
      <div class="assistant-body">
        <div class="assistant-heading"><strong>智能复盘</strong><span>PAYBACK ASSISTANT</span></div>
        <!-- 模型可能不提供摘要，保留入口并明确空状态，避免误以为页面没有接入。 -->
        <details class="reasoning" :open="streaming">
          <summary>
            {{ streaming ? '思考过程 · 生成中' : '查看思考过程' }}
          </summary>
          <v-md-preview
            v-if="message.reasoning"
            class="md-body reasoning-content"
            :text="message.reasoning"
            @image-click="openPreview"
          />
          <p v-else class="thinking-status" role="status">
            <el-icon v-if="streaming" class="is-loading"><Loading /></el-icon>
            {{ streaming ? '等待模型返回思考摘要…' : '暂无思考摘要（模型未提供思考摘要或历史未保存）' }}
          </p>
        </details>
        <div v-if="message.toolCalls.length" class="tool-chips">
          <span
            v-for="(call, index) in message.toolCalls"
            :key="index"
            :class="['tool-chip', call.state]"
            :title="call.error || call.name"
          >
            <el-icon v-if="call.state === 'running'" class="is-loading"
              ><Loading
            /></el-icon>
            <el-icon v-else-if="call.state === 'done'"><CircleCheck /></el-icon>
            <el-icon v-else><CircleClose /></el-icon>
            <span class="chip-text">
              {{ chipText(call) }}
            </span>
          </span>
        </div>

        <div v-if="message.error" class="turn-error">
          <el-alert type="error" :closable="false" show-icon>
            <template #title>
              <span class="error-text">{{ message.error }}</span>
            </template>
          </el-alert>
          <el-button size="small" text type="primary" @click="$emit('retry')">
            <el-icon><RefreshRight /></el-icon>&nbsp;重试
          </el-button>
        </div>

        <template v-if="message.content || streaming">
          <v-md-preview class="md-body" :text="visibleContent || ' '" @image-click="openPreview" />
          <figure v-for="(image, index) in chartImages" :key="index" class="panorama-figure">
            <div class="panorama-scroll">
              <button class="chart-preview" type="button" :aria-label="`预览${image.title}`" @click="openPreview(chartImages.map(chart => chart.src), index)">
                <img :src="image.src" :alt="image.title" />
              </button>
            </div>
            <figcaption>
              <span>点击图片可放大预览；数据完整性及实时性未核实</span>
              <a :href="image.src" :download="`${image.title}.svg`">下载{{ image.title }}</a>
            </figcaption>
          </figure>
          <span v-if="streaming" class="cursor" />
        </template>

        <div v-if="message.truncated" class="truncated-hint">
          <el-icon><WarningFilled /></el-icon>
          达到最大迭代数，以上是不完整的推理
        </div>
        <el-button v-if="message.content" class="copy-button" text title="复制消息" aria-label="复制消息" @click="copyMessage">
          <el-icon><CopyDocument /></el-icon>
        </el-button>
      </div>
    </template>
    <el-image-viewer v-if="previewImages.length" :url-list="previewImages" :initial-index="previewIndex" teleported @close="previewImages = []" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ChatMessage, ToolCallChip } from '@/store/chat';
import { ElMessage } from 'element-plus';
import {
  CopyDocument,
  Loading,
  CircleCheck,
  CircleClose,
  RefreshRight,
  WarningFilled,
  DataAnalysis,
} from '@element-plus/icons-vue';

const props = defineProps<{
  message: ChatMessage;
  streaming?: boolean;
  busy?: boolean;
}>();

defineEmits<{
  (e: 'retry'): void;
  (e: 'resend'): void;
}>();

// 只识别服务端生成的固定图片格式，避免把长编码交给 Markdown 解析器。
const chartPattern = /!\[(复盘全景图|涨停梯队图)\]\((data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+)\)/g;
const chartImages = computed(() => props.message.role === 'assistant'
  ? Array.from(props.message.content.matchAll(chartPattern), match => ({ title: match[1], src: match[2] })) : []);
const visibleContent = computed(() => props.message.role === 'assistant'
  ? props.message.content.replace(chartPattern, '').trim() : props.message.content);

const previewImages = ref<string[]>([]);
const previewIndex = ref(0);

// 复用同一预览器承接 Markdown 和工具图片，保留点击位置及同组图片切换。
function openPreview(images: string[], index: number) {
  previewIndex.value = index;
  previewImages.value = images;
}

// 复制正文原文，保留 Markdown 和换行，失败时提示用户手动复制。
async function copyMessage() {
  try {
    await navigator.clipboard.writeText(visibleContent.value);
    ElMessage.success('复制成功');
  } catch {
    ElMessage.error('复制失败，请手动选择文本复制');
  }
}

const TOOL_NAMES: Record<string, string> = {
  get_market_overview: '市场总览',
  get_limit_up_structure: '涨停结构',
  get_even_board_ladder: '连板梯队',
  get_market_phase: '生态阶段',
  get_position_outcomes: '位置期望',
  get_similar_days: '相似日检索',
  get_daily_panorama: '市场全景',
  get_stock_review: '个股日线',
};

function chipText(call: ToolCallChip): string {
  const label = TOOL_NAMES[call.name] || call.name;
  if (call.state === 'running') return `正在查询 ${label}…`;
  if (call.state === 'error') return `${label} 失败`;
  return `已查询 ${label}`;
}
</script>

<style scoped lang="less">
.chat-message {
  padding: 20px 0;

  &.user {
    display: flex;
    justify-content: flex-end;
  }

  &.assistant {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .assistant-avatar {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    flex: 0 0 auto;
    border-radius: 11px;
    color: #fff;
    background: #237b78;
    font-size: 17px;
  }

  .assistant-heading {
    display: flex;
    align-items: baseline;
    gap: 9px;
    min-height: 34px;
    padding-top: 6px;
    color: #27394b;
    font-size: 13px;

    span { color: #9aa8b0; font-size: 9px; font-weight: 700; letter-spacing: .08em; }
  }

  .user-content {
    max-width: 78%;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    min-width: 0;
  }

  .user-bubble {
    padding: 11px 18px;
    border-radius: 18px 18px 4px 18px;
    background: #edf4f3;
    color: #1f2937;
    font-size: 15px;
    line-height: 1.7;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .copy-button {
    min-height: 36px;
    color: #6e7d90;
    gap: 4px;
  }

  .message-actions {
    display: flex;
  }

  .assistant-body {
    width: 100%;
    min-width: 0;
    font-size: 15px;
  }

  .panorama-figure {
    margin: 16px 0;
    overflow: hidden;
    border: 1px solid #d8e3df;
    border-radius: 14px;
    background: #102623;
    .panorama-scroll { overflow-x: auto; }
    .chart-preview {
      display: block;
      width: 100%;
      padding: 0;
      border: 0;
      background: transparent;
      cursor: zoom-in;
      &:focus-visible { outline: 3px solid #e9ca97; outline-offset: -3px; }
    }
    img { display: block; width: 100%; min-width: 600px; height: auto; }
    figcaption {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 8px;
      padding: 10px 14px;
      color: #c2d2c9;
      font-size: 12px;
      line-height: 1.5;
      a { color: #e9ca97; text-decoration: underline; text-underline-offset: 2px; }
    }
  }

  .thinking-status {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #667085;
    font-size: 14px;
  }

  .reasoning {
    margin-bottom: 16px;
    color: #667085;

    summary {
      width: fit-content;
      padding: 4px 0;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
    }

    .reasoning-content {
      margin-top: 8px;
      padding-left: 14px;
      border-left: 2px solid #e5e7eb;

      :deep(.vuepress-markdown-body) {
        color: #667085;
        font-size: 14px;
      }
    }
  }

  .tool-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 10px;
  }

  .tool-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 12px;
    line-height: 1.6;
    border: 1px solid transparent;

    &.running {
      color: #2f6fed;
      background: rgba(47, 111, 237, 0.08);
      border-color: rgba(47, 111, 237, 0.25);
    }

    &.done {
      color: #529b2e;
      background: rgba(103, 194, 58, 0.08);
      border-color: rgba(103, 194, 58, 0.25);
    }

    &.error {
      color: #c45656;
      background: rgba(245, 108, 108, 0.08);
      border-color: rgba(245, 108, 108, 0.25);
    }

    .chip-text {
      max-width: 220px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .turn-error {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    :deep(.el-alert) {
      flex: 1;
      padding: 6px 12px;
    }

    .error-text {
      font-size: 12px;
      font-weight: normal;
      word-break: break-all;
    }
  }

  // 仅覆盖聊天正文，避免影响其他页面的 Markdown 主题。
  .md-body {
    min-width: 0;

    :deep(.vuepress-markdown-body) {
      max-width: none;
      padding: 0;
      color: #252a34;
      font-size: 16px;
      line-height: 1.8;
      overflow-wrap: anywhere;
    }

    :deep(.vuepress-markdown-body p),
    :deep(.vuepress-markdown-body ul),
    :deep(.vuepress-markdown-body ol) {
      margin: 0.75em 0;
    }

    :deep(.vuepress-markdown-body h1),
    :deep(.vuepress-markdown-body h2),
    :deep(.vuepress-markdown-body h3),
    :deep(.vuepress-markdown-body h4) {
      margin: 1.5em 0 0.6em;
      padding: 0;
      border: 0;
      color: #111827;
      line-height: 1.4;
    }

    :deep(.vuepress-markdown-body h1) {
      font-size: 1.4em;
    }
    :deep(.vuepress-markdown-body h2) {
      font-size: 1.25em;
    }
    :deep(.vuepress-markdown-body h3) {
      font-size: 1.1em;
    }
    :deep(.vuepress-markdown-body h4) {
      font-size: 1em;
    }

    :deep(.vuepress-markdown-body li + li) {
      margin-top: 0.35em;
    }

    :deep(.vuepress-markdown-body ul),
    :deep(.vuepress-markdown-body ol) {
      padding-left: 1.6em;
    }

    :deep(.vuepress-markdown-body strong) {
      color: #111827;
      font-weight: 600;
    }

    :deep(.vuepress-markdown-body blockquote) {
      margin: 1em 0;
      padding: 0.1em 1em;
      border-left: 3px solid #cbd5e1;
      color: #596273;
    }

    :deep(.vuepress-markdown-body :not(pre) > code) {
      padding: 0.15em 0.35em;
      border-radius: 4px;
      background: #f1f3f5;
      color: #344054;
      font-size: 0.9em;
    }

    :deep(.vuepress-markdown-body pre) {
      max-width: 100%;
      font-size: 13px;
      line-height: 1.6;
      overflow-x: auto;
      overflow-wrap: normal;
    }

    // 宽表格在正文区域内滚动，避免撑宽移动端对话。
    :deep(.vuepress-markdown-body table) {
      display: block;
      max-width: 100%;
      overflow-x: auto;
      border-collapse: collapse;
    }

    :deep(.vuepress-markdown-body th),
    :deep(.vuepress-markdown-body td) {
      padding: 9px 12px;
      border-color: #e5e7eb;
    }

    :deep(.vuepress-markdown-body th) {
      background: #f7f8fa;
      text-align: left;
    }

    :deep(.vuepress-markdown-body hr) {
      height: 1px;
      margin: 1.5em 0;
      border: 0;
      background: #e5e7eb;
    }

    :deep(.vuepress-markdown-body img) {
      max-width: 100%;
      height: auto;
    }

    :deep(.vuepress-markdown-body a) {
      color: #2563eb;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  }

  // 流式光标：打字机尾部的闪烁块
  .cursor {
    display: inline-block;
    width: 8px;
    height: 16px;
    margin-left: 2px;
    vertical-align: text-bottom;
    background: #2f6fed;
    animation: blink 0.9s steps(1) infinite;
  }

  .truncated-hint {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 6px;
    color: #b88230;
    font-size: 12px;
  }
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}
</style>
