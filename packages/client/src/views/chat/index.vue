<template>
  <div class="chat-page">
    <!-- 会话列表（ChatGPT 式左侧栏，移动端抽屉） -->
    <aside :class="['conv-panel', { open: panelOpen }]">
      <div class="panel-head">
        <el-button class="new-conv" type="primary" plain @click="onNewConversation">
          <el-icon><Plus /></el-icon>&nbsp;新对话
        </el-button>
      </div>
      <div class="conv-list">
        <div
          v-for="conv in store.sorted"
          :key="conv.id"
          :class="['conv-item', { active: conv.id === store.activeId }]"
          @click="onSelect(conv.id)"
        >
          <el-icon class="conv-icon"><ChatDotRound /></el-icon>
          <span class="conv-title">{{ conv.title }}</span>
          <el-popconfirm
            title="删除这个对话？"
            confirm-button-text="删除"
            cancel-button-text="取消"
            @confirm="onDelete(conv.id)"
          >
            <template #reference>
              <el-icon class="conv-delete" @click.stop><Delete /></el-icon>
            </template>
          </el-popconfirm>
        </div>
        <div v-if="!store.conversations.length" class="conv-empty">
          还没有对话，点上面「新对话」开始
        </div>
      </div>
      <div class="panel-foot">数据源：payback-mcp（只读）</div>
    </aside>
    <div v-if="panelOpen" class="panel-mask" @click="panelOpen = false" />

    <!-- 主区 -->
    <main class="chat-main">
      <header class="chat-head">
        <el-button class="head-menu" text @click="panelOpen = !panelOpen">
          <el-icon><Operation /></el-icon>
        </el-button>
        <span class="head-title">{{ store.active?.title || '智能复盘' }}</span>
        <span v-if="streaming && streamingConvId !== store.activeId" class="head-busy">
          <el-icon class="is-loading"><Loading /></el-icon>&nbsp;另一对话正在生成…
        </span>
        <span class="head-hint">内容由 AI 生成，不构成投资建议</span>
      </header>

      <div ref="messagesEl" class="messages" @scroll="onMessagesScroll">
        <!-- 空状态：建议问题 -->
        <div v-if="!messages.length" class="empty-state">
          <div class="empty-logo">
            <el-icon :size="42"><DataAnalysis /></el-icon>
          </div>
          <h2>四级短线复盘助手</h2>
          <p class="empty-sub">
            市场环境 → 生态阶段 → 出手机会 → 买卖点结构。每个数字都实时取自数据库，不凭记忆回答。
          </p>
          <div class="suggestions">
            <div
              v-for="prompt in SUGGESTIONS"
              :key="prompt"
              class="suggestion-card"
              @click="onSend(prompt)"
            >
              {{ prompt }}
            </div>
          </div>
        </div>

        <div v-else class="message-list">
          <ChatMessage
            v-for="msg in messages"
            :key="msg.id"
            :message="msg"
            :streaming="streaming && msg.id === streamingMessageId"
            @retry="onRetry"
          />
        </div>
      </div>

      <!-- 输入区 -->
      <div class="composer">
        <div class="composer-box" :class="{ focused: inputFocused }">
          <textarea
            ref="inputEl"
            v-model="draft"
            rows="1"
            placeholder="问点什么，比如：复盘一下昨天的市场（Enter 发送，Shift+Enter 换行）"
            @input="autoGrow"
            @focus="inputFocused = true"
            @blur="inputFocused = false"
            @keydown="onKeydown"
          />
          <el-button
            v-if="streaming"
            class="send-btn stop"
            circle
            title="停止生成"
            @click="onStop"
          >
            <el-icon><VideoPause /></el-icon>
          </el-button>
          <el-button
            v-else
            class="send-btn"
            type="primary"
            circle
            :disabled="!draft.trim()"
            title="发送"
            @click="onSend()"
          >
            <el-icon><Promotion /></el-icon>
          </el-button>
        </div>
        <div class="composer-foot">
          回答基于 payback-mcp 实时查询的行情数据；不推荐个股、不给仓位建议。
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue';
import {
  Plus,
  Delete,
  ChatDotRound,
  Operation,
  DataAnalysis,
  Promotion,
  VideoPause,
  Loading,
} from '@element-plus/icons-vue';
import { chatWithAgent, type AgentEvent } from '@/api/agent';
import { useChatStore, type Conversation } from '@/store/chat';
import ChatMessage from './components/ChatMessage.vue';

const SUGGESTIONS = [
  '复盘一下昨天的市场',
  '现在短线生态处于什么阶段？',
  '昨天的连板梯队和晋级率怎么样？',
  '最近的市场有出手机会吗？',
];

const store = useChatStore();
const draft = ref('');
const streaming = ref(false);
const streamingMessageId = ref('');
const streamingConvId = ref('');
const panelOpen = ref(false);
const inputFocused = ref(false);
const messagesEl = ref<HTMLElement>();
const inputEl = ref<HTMLTextAreaElement>();

let abortController: AbortController | null = null;
let stickToBottom = true;

// delta 攒批间隔：每次 += content 都会让 v-md-preview 全量重解析 markdown，
// 按 token 逐条渲染是 O(n²)；80ms 批量 flush 肉眼仍是打字机，CPU 降到 1/10
const FLUSH_MS = 80;

const messages = computed(() => store.active?.messages ?? []);

function ensureConversation(): Conversation {
  return store.active ?? store.newConversation();
}

function onNewConversation() {
  // 已有空对话就直接选中，不堆重复的「新对话」
  const empty = store.conversations.find((c) => !c.messages.length);
  store.select(empty ? empty.id : store.newConversation().id);
  panelOpen.value = false;
  inputEl.value?.focus();
}

function onSelect(id: string) {
  // 切换不打断生成：runTurn 持有原会话的响应式代理，后台照常写入，
  // 用户随时可以切回去看进度（和 ChatGPT 的行为一致）
  store.select(id);
  panelOpen.value = false;
  scrollToBottom(true);
}

function onDelete(id: string) {
  if (streaming.value && streamingConvId.value === id) onStop();
  store.deleteConversation(id);
}

function autoGrow() {
  const el = inputEl.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
}

function onKeydown(event: KeyboardEvent) {
  // isComposing：中文输入法选词时的回车不是发送
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    onSend();
  }
}

function scrollToBottom(force = false) {
  if (!force && !stickToBottom) return;
  requestAnimationFrame(() => {
    const el = messagesEl.value;
    if (el) el.scrollTop = el.scrollHeight;
  });
}

function onMessagesScroll() {
  const el = messagesEl.value;
  if (!el) return;
  // 距底部 60px 内视为"跟着流"，用户上翻后不再强拉
  stickToBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
}

function onSend(preset?: string) {
  const text = (preset ?? draft.value).trim();
  if (!text || streaming.value) return;
  draft.value = '';
  nextTick(autoGrow);
  const conv = ensureConversation();
  store.maybeAutoTitle(conv, text);
  store.addMessage(conv, 'user', text);
  scrollToBottom(true);
  runTurn(conv, text);
}

function onRetry() {
  const conv = store.active;
  if (!conv || streaming.value) return;
  // 找到最后一条用户消息，丢掉它后面失败的助手消息，用同一个问题重跑
  let lastUserIndex = -1;
  for (let i = conv.messages.length - 1; i >= 0; i--) {
    if (conv.messages[i].role === 'user') {
      lastUserIndex = i;
      break;
    }
  }
  if (lastUserIndex < 0) return;
  const question = conv.messages[lastUserIndex].content;
  conv.messages.splice(lastUserIndex + 1);
  runTurn(conv, question);
}

function onStop() {
  abortController?.abort();
}

async function runTurn(conv: Conversation, question: string) {
  const assistant = store.addMessage(conv, 'assistant');
  streaming.value = true;
  streamingMessageId.value = assistant.id;
  streamingConvId.value = conv.id;
  stickToBottom = true;
  abortController = new AbortController();

  let pending = '';
  let flushTimer: ReturnType<typeof setTimeout> | null = null;
  function flushPending() {
    if (flushTimer !== null) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    if (pending) {
      assistant.content += pending;
      pending = '';
      scrollToBottom();
    }
  }
  function scheduleFlush() {
    if (flushTimer !== null) return;
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flushPending();
    }, FLUSH_MS);
  }

  const onEvent = (event: AgentEvent) => {
    switch (event.type) {
      case 'session':
        conv.sessionId = event.session_id;
        break;
      case 'delta':
        pending += event.text;
        scheduleFlush();
        break;
      case 'tool_call':
        assistant.toolCalls.push({
          name: event.name,
          iteration: event.iteration,
          state: 'running',
        });
        scrollToBottom();
        break;
      case 'tool_result': {
        const chip = [...assistant.toolCalls]
          .reverse()
          .find(
            (c) => c.state === 'running' && c.name === event.name && c.iteration === event.iteration
          );
        if (chip) {
          chip.state = event.error ? 'error' : 'done';
          chip.error = event.error ?? undefined;
        }
        scrollToBottom();
        break;
      }
      case 'done':
        // done.content 是权威正文（最后一轮非空内容），覆盖流式拼接结果
        flushPending();
        assistant.content = event.content;
        assistant.truncated = event.truncated;
        assistant.usage = event.usage;
        break;
      case 'error':
        flushPending();
        assistant.error = event.message;
        break;
    }
  };

  try {
    await chatWithAgent(
      { message: question, session_id: conv.sessionId },
      onEvent,
      abortController.signal
    );
  } catch (error: any) {
    flushPending();
    if (error?.name === 'AbortError') {
      assistant.content += assistant.content ? '\n\n（已停止生成）' : '（已停止生成）';
    } else {
      // fetch 的网络层失败是 TypeError；serve 挂掉/代理不通是 HTTP 5xx
      const raw: string = error?.message || '';
      assistant.error =
        error?.name === 'TypeError' || !raw || /^HTTP 5\d\d/.test(raw)
          ? '无法连接 agent 服务（确认 payback-agent --serve 已启动）'
          : raw;
    }
  } finally {
    flushPending();
    streaming.value = false;
    streamingMessageId.value = '';
    streamingConvId.value = '';
    abortController = null;
    if (!assistant.content && !assistant.error) {
      // 静默消失比空回答更让人困惑：留下一句可理解的兜底
      assistant.content = '（模型没有给出正文）';
    }
    store.touch(conv);
    store.persist();
    scrollToBottom();
  }
}

onBeforeUnmount(() => {
  abortController?.abort();
});
</script>

<style scoped lang="less">
.chat-page {
  display: flex;
  height: 100%;
  overflow: hidden;
  background: #fff;
}

// ---------- 会话列表 ----------
.conv-panel {
  display: flex;
  flex-direction: column;
  width: 240px;
  flex-shrink: 0;
  background: #f7f8fa;
  border-right: 1px solid #e5e7eb;

  .panel-head {
    padding: 12px;

    .new-conv {
      width: 100%;
    }
  }

  .conv-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 8px;
  }

  .conv-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 10px;
    margin-bottom: 2px;
    border-radius: 8px;
    cursor: pointer;
    color: #374151;
    font-size: 13px;

    &:hover {
      background: #eceef1;

      .conv-delete {
        opacity: 1;
      }
    }

    &.active {
      background: #e3e9f7;
      color: #1d4ed8;
    }

    .conv-icon {
      flex-shrink: 0;
      font-size: 15px;
      opacity: 0.6;
    }

    .conv-title {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .conv-delete {
      opacity: 0;
      font-size: 14px;
      color: #9ca3af;
      transition: opacity 0.15s;

      &:hover {
        color: #ef4444;
      }
    }
  }

  .conv-empty {
    padding: 24px 12px;
    text-align: center;
    color: #9ca3af;
    font-size: 12px;
  }

  .panel-foot {
    padding: 10px 14px;
    border-top: 1px solid #e5e7eb;
    color: #9ca3af;
    font-size: 11px;
  }
}

.panel-mask {
  display: none;
}

// ---------- 主区 ----------
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  height: 46px;
  flex-shrink: 0;
  border-bottom: 1px solid #f0f1f3;

  .head-menu {
    display: none;
  }

  .head-title {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .head-busy {
    display: inline-flex;
    align-items: center;
    font-size: 11px;
    color: #2f6fed;
    flex-shrink: 0;
  }

  .head-hint {
    margin-left: auto;
    font-size: 11px;
    color: #9ca3af;
    flex-shrink: 0;
  }
}

.messages {
  flex: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.message-list {
  max-width: 820px;
  margin: 0 auto;
  padding: 16px 24px 24px;
}

// ---------- 空状态 ----------
.empty-state {
  max-width: 720px;
  margin: 0 auto;
  padding: 8vh 24px 24px;
  text-align: center;

  .empty-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    border-radius: 20px;
    background: linear-gradient(135deg, #2f6fed, #7c3aed);
    color: #fff;
    margin-bottom: 18px;
  }

  h2 {
    font-size: 22px;
    color: #111827;
    margin-bottom: 8px;
  }

  .empty-sub {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 28px;
  }

  .suggestions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .suggestion-card {
    padding: 14px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    font-size: 13px;
    color: #374151;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s;

    &:hover {
      border-color: #2f6fed;
      color: #2f6fed;
      background: rgba(47, 111, 237, 0.04);
    }
  }
}

// ---------- 输入区 ----------
.composer {
  flex-shrink: 0;
  padding: 8px 24px 12px;
  background: linear-gradient(transparent, #fff 30%);

  .composer-box {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    max-width: 820px;
    margin: 0 auto;
    padding: 10px 12px;
    border: 1px solid #d8dce3;
    border-radius: 16px;
    background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;

    &.focused {
      border-color: #2f6fed;
      box-shadow: 0 0 0 3px rgba(47, 111, 237, 0.12);
    }

    textarea {
      flex: 1;
      border: none;
      outline: none;
      resize: none;
      font-size: 14px;
      line-height: 1.6;
      font-family: inherit;
      color: #1f2937;
      max-height: 160px;
      background: transparent;

      &::placeholder {
        color: #b0b6bf;
      }
    }

    .send-btn {
      flex-shrink: 0;
      margin-bottom: 1px;
    }
  }

  .composer-foot {
    max-width: 820px;
    margin: 8px auto 0;
    text-align: center;
    font-size: 11px;
    color: #9ca3af;
  }
}

// ---------- 窄屏：会话列表变抽屉 ----------
@media (max-width: 768px) {
  .conv-panel {
    position: fixed;
    left: 0;
    top: 40px;
    bottom: 0;
    z-index: 1001;
    transform: translateX(-100%);
    transition: transform 0.2s ease-in-out;

    &.open {
      transform: translateX(0);
    }
  }

  .panel-mask {
    display: block;
    position: fixed;
    inset: 40px 0 0 0;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.3);
  }

  .chat-head .head-menu {
    display: inline-flex;
  }

  .empty-state .suggestions {
    grid-template-columns: 1fr;
  }

  .message-list {
    padding: 12px 14px 20px;
  }

  .composer {
    padding: 6px 12px 10px;
  }
}
</style>
