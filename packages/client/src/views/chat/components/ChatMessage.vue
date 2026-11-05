<template>
  <div :class="['chat-message', message.role]">
    <!-- 用户：右侧气泡，纯文本（保留换行） -->
    <template v-if="message.role === 'user'">
      <div class="user-bubble">{{ message.content }}</div>
    </template>

    <!-- 助手：全宽，markdown 渲染 + 工具调用状态 -->
    <template v-else>
      <div class="assistant-body">
        <div v-if="message.toolCalls.length" class="tool-chips">
          <span
            v-for="(call, index) in message.toolCalls"
            :key="index"
            :class="['tool-chip', call.state]"
            :title="call.error || call.name"
          >
            <el-icon v-if="call.state === 'running'" class="is-loading"><Loading /></el-icon>
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
          <v-md-preview class="md-body" :text="message.content || ' '" />
          <span v-if="streaming" class="cursor" />
        </template>

        <div v-if="message.truncated" class="truncated-hint">
          <el-icon><WarningFilled /></el-icon>
          达到最大迭代数，以上是不完整的推理
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage, ToolCallChip } from '@/store/chat';
import {
  Loading,
  CircleCheck,
  CircleClose,
  RefreshRight,
  WarningFilled,
} from '@element-plus/icons-vue';

defineProps<{
  message: ChatMessage;
  streaming?: boolean;
}>();

defineEmits<{
  (e: 'retry'): void;
}>();

const TOOL_NAMES: Record<string, string> = {
  get_market_overview: '市场总览',
  get_limit_up_structure: '涨停结构',
  get_even_board_ladder: '连板梯队',
  get_market_phase: '生态阶段',
  get_position_outcomes: '位置期望',
  get_similar_days: '相似日检索',
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
  padding: 14px 0;

  &.user {
    display: flex;
    justify-content: flex-end;
  }

  .user-bubble {
    max-width: 78%;
    padding: 10px 16px;
    border-radius: 18px 18px 4px 18px;
    background: #2f6fed;
    color: #fff;
    font-size: 14px;
    line-height: 1.7;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .assistant-body {
    max-width: 100%;
    font-size: 14px;
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

  .md-body {
    :deep(.v-md-textarea) {
      font-size: 14px;
    }

    :deep(pre) {
      font-size: 12.5px;
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
