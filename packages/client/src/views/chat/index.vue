<template>
  <div class="chat-page">
    <!-- 会话侧栏在窄屏下切换为抽屉。 -->
    <aside id="chat-conversations" :class="['conv-panel', { open: panelOpen }]" aria-label="对话列表">
      <div class="panel-brand">
        <span class="brand-mark"><el-icon><DataAnalysis /></el-icon></span>
        <span><strong>智能复盘</strong><small>PAYBACK · MARKET INSIGHTS</small></span>
      </div>
      <div class="panel-head">
        <el-button
          class="new-conv"
          type="primary"
          plain
          @click="onNewConversation"
        >
          <el-icon><Plus /></el-icon><span>新建对话</span>
        </el-button>
        <el-input v-model="searchQuery" class="conv-search" clearable maxlength="200" placeholder="搜索标题和正文" aria-label="搜索全部历史对话">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>
      <div class="list-label">{{ searchQuery.trim() ? '搜索结果' : '最近对话' }} <span>{{ filteredConversations.length }}</span></div>
      <div class="conv-list" :aria-busy="listLoading" @scroll="onListScroll">
        <div
          v-for="conv in filteredConversations"
          :key="conv.id"
          :class="['conv-item', { active: conv.id === store.activeId }]"
        >
          <button type="button" class="conv-select" :aria-current="conv.id === store.activeId ? 'page' : undefined" @click="onSelect(conv.id)">
            <el-icon class="conv-icon"><ChatDotRound /></el-icon>
            <span class="conv-text">
              <span class="conv-title">{{ conv.title }}</span>
              <small v-if="searchQuery.trim() && conv.sessionId && snippets[conv.sessionId]" class="conv-snippet">{{ snippets[conv.sessionId] }}</small>
            </span>
          </button>
          <el-popconfirm
            title="删除这个对话？"
            confirm-button-text="删除"
            cancel-button-text="取消"
            @confirm="onDelete(conv.id)"
          >
            <template #reference>
              <button type="button" class="conv-delete" :aria-label="'删除对话：' + conv.title" @click.stop><el-icon><Delete /></el-icon></button>
            </template>
          </el-popconfirm>
        </div>
        <div v-if="!filteredConversations.length && !listLoading && !listError" class="conv-empty">
          {{ searchQuery.trim() ? '没有找到相关对话' : '还没有对话，开始一个新的复盘吧' }}
        </div>
        <div v-if="listLoading" class="conv-empty" role="status">正在加载对话…</div>
        <div v-else-if="listError" class="conv-empty" role="status">
          {{ listError }}
          <el-button text @click="loadPage(!nextCursor)">重试</el-button>
        </div>
        <el-button v-else-if="nextCursor" class="load-more" text @click="loadPage()">加载更多对话</el-button>
      </div>
      <div class="panel-foot">
        <button type="button" class="memory-button" @click="openMemories"><el-icon><Collection /></el-icon><span>长期记忆</span><el-icon class="memory-arrow"><ArrowRight /></el-icon></button>
        <div class="source-label"><span class="source-dot" />行情数据 · payback-mcp</div>
      </div>
    </aside>
    <div v-if="panelOpen" class="panel-mask" @click="panelOpen = false" />

    <el-dialog v-model="memoriesOpen" title="长期记忆" width="min(90%, 520px)">
      <p>添加希望跨会话保留的偏好；行情数据仍会重新查询。</p>
      <div v-for="item in memories" :key="item.id">
        <span>{{ item.content }}</span>
        <el-button text @click="editMemory(item)">编辑</el-button>
        <el-button text type="danger" @click="removeMemory(item.id)">删除</el-button>
      </div>
      <el-input v-model="memoryDraft" maxlength="500" show-word-limit placeholder="例如：先展示风险，再展开数据" />
      <template #footer>
        <el-button type="primary" :disabled="!memoryDraft.trim()" @click="saveMemory">保存记忆</el-button>
      </template>
    </el-dialog>

    <!-- 主区 -->
    <main :class="['chat-main', { 'is-empty': !messages.length && !detailUnavailable }]" data-page-scroll>
      <header class="chat-head">
        <el-button class="head-menu" text aria-label="打开对话列表" aria-controls="chat-conversations" :aria-expanded="panelOpen" @click="panelOpen = !panelOpen">
          <el-icon><Operation /></el-icon>
        </el-button>
        <div class="head-context"><span class="head-eyebrow">市场研究 / 对话</span><span class="head-title">{{ store.active?.title || '新对话' }}</span></div>
        <span
          v-if="streaming && streamingConvId !== store.activeId"
          class="head-busy"
        >
          <el-icon class="is-loading"><Loading /></el-icon
          >&nbsp;另一对话正在生成…
        </span>
        <el-select v-model="selectedModel" class="model-select" aria-label="选择模型" placeholder="选择模型">
          <el-option label="默认模型" value="" />
          <el-option label="DeepSeek / 网关" value="gateway" />
          <el-option label="Codex CLI" value="codex" />
        </el-select>
      </header>

      <div ref="messagesEl" class="messages" data-page-scroll @scroll="onMessagesScroll">
        <div v-if="store.active?.loading" class="conv-empty" role="status">正在加载会话内容…</div>
        <div v-else-if="store.active?.loadError" class="conv-empty" role="status">
          {{ store.active.loadError }}
          <el-button text @click="loadActiveMessages()">重试</el-button>
        </div>
        <!-- 空状态：建议问题 -->
        <div v-else-if="!messages.length && !detailUnavailable" class="empty-state">
          <div class="empty-kicker"><span /> PAYBACK MARKET ASSISTANT</div>
          <h1>让每一次复盘，<br /><em>都有据可依。</em></h1>
          <p class="empty-sub">从市场环境到短线生态，用数据梳理每一个判断。</p>
        </div>

        <div v-else-if="messages.length" class="message-list">
          <ChatMessage
            v-for="msg in messages"
            :key="msg.id"
            :message="msg"
            :streaming="streaming && msg.id === streamingMessageId"
            :busy="streaming"
            @retry="onRetry"
            @resend="onResend(msg.content)"
          />
        </div>
      </div>

      <!-- 输入区 -->
      <div class="composer">
        <el-alert v-if="store.storageError" title="本机记录保存失败，未同步内容暂留在当前页面，请勿关闭页面。" type="warning" :closable="false" />
        <div class="composer-box" :class="{ focused: inputFocused }">
          <textarea
            ref="inputEl"
            v-model="draft"
            rows="1"
            :disabled="detailUnavailable"
            aria-label="输入复盘问题"
            placeholder="问问今天的市场，或输入你的复盘问题…"
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
            aria-label="停止生成"
            @click="onStop"
          >
            <el-icon><VideoPause /></el-icon>
          </el-button>
          <el-button
            v-else
            class="send-btn"
            type="primary"
            circle
            :disabled="!draft.trim() || detailUnavailable"
            title="发送"
            aria-label="发送消息"
            @click="onSend()"
          >
            <el-icon><Promotion /></el-icon>
          </el-button>
        </div>
        <div v-if="!messages.length && !detailUnavailable" class="suggestions" aria-label="推荐问题">
          <button v-for="prompt in SUGGESTIONS" :key="prompt" type="button" class="suggestion-card" :disabled="streaming" @click="onSend(prompt)">
            <el-icon><TrendCharts /></el-icon><span>{{ prompt }}</span><el-icon class="suggestion-arrow"><ArrowRight /></el-icon>
          </button>
        </div>
        <div class="composer-foot">
          内容由 AI 生成，仅供参考，不构成投资建议
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  Plus,
  Delete,
  ChatDotRound,
  Operation,
  DataAnalysis,
  Promotion,
  VideoPause,
  Loading,
  Search,
  Collection,
  ArrowRight,
  TrendCharts,
} from '@element-plus/icons-vue';
import { chatWithAgent, fetchMemories, addMemory, updateMemory, deleteMemory, deleteAgentSession, type AgentEvent, type AgentMemory } from '@/api/agent';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useChatStore, type Conversation } from '@/store/chat';
import ChatMessage from './components/ChatMessage.vue';
import { useSessionList } from './useSessionList';

const SUGGESTIONS = [
  '生成今日复盘全景图',
  '现在短线生态处于什么阶段？',
  '分析 000001 的次日应对预案',
  '总结今日整体盘面',
];

const store = useChatStore();
const draft = ref('');
const selectedModel = ref<'' | 'gateway' | 'codex'>('');
const {
  query: searchQuery, conversations: filteredConversations, snippets,
  loading: listLoading, error: listError, nextCursor, loadPage, onScroll: onListScroll,
  dispose: disposeSessionList,
} = useSessionList(store);
const memoriesOpen = ref(false);
const memories = ref<AgentMemory[]>([]);
const memoryDraft = ref('');
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
const detailUnavailable = computed(() => !!store.active && !store.active.messagesLoaded);

// 切换时只加载当前正文；晚到的请求不会切换活动会话或拉动其他会话的滚动条。
async function loadActiveMessages() {
  const id = store.activeId;
  if (!id) return;
  try {
    await store.loadMessages(id);
    if (store.activeId === id) scrollToBottom(true);
  } catch {
    // 具体错误保留在会话内，用户可原位重试。
  }
}
watch([() => store.activeId, () => store.active?.messagesLoaded], () => {
  void loadActiveMessages();
}, { immediate: true });

function ensureConversation(): Conversation {
  return store.active ?? store.newConversation();
}

function onNewConversation() {
  // 已有空对话就直接选中，不堆重复的「新对话」
  searchQuery.value = '';
  const empty = store.conversations.find(c => c.messagesLoaded && !c.messages.length && !c.sessionId);
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

async function onDelete(id: string) {
  if (streaming.value && streamingConvId.value === id) {
    ElMessage.warning('请先停止生成，完成后再删除会话');
    return;
  }
  const conv = store.conversations.find(c => c.id === id);
  try {
    if (conv?.sessionId) await deleteAgentSession(conv.sessionId);
    store.deleteConversation(id);
  } catch {
    ElMessage.error('删除失败，请检查 Agent 服务');
  }
}

async function openMemories() {
  try {
    memories.value = await fetchMemories();
    memoriesOpen.value = true;
  } catch { ElMessage.error('无法读取长期记忆'); }
}

async function saveMemory() {
  try {
    memories.value.push(await addMemory(memoryDraft.value.trim()));
    memoryDraft.value = '';
  } catch { ElMessage.error('保存失败，请检查内容和记忆数量'); }
}

async function editMemory(item: AgentMemory) {
  try {
    const result = await ElMessageBox.prompt('修改长期记忆', '编辑记忆', {
      inputValue: item.content,
      inputValidator: value => !!value.trim() && value.trim().length <= 500,
      inputErrorMessage: '请输入 1–500 个字符',
    });
    const updated = await updateMemory(item.id, result.value.trim());
    item.content = updated.content;
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') ElMessage.error('修改记忆失败');
  }
}

async function removeMemory(id: string) {
  try {
    await deleteMemory(id);
    memories.value = memories.value.filter(item => item.id !== id);
  } catch { ElMessage.error('删除记忆失败'); }
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
  const id = store.activeId;
  requestAnimationFrame(() => {
    if (store.activeId !== id) return;
    const el = messagesEl.value;
    // 强制定位需覆盖容器的平滑滚动，避免切换长会话时从顶部滚到底部。
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: force ? 'instant' : 'auto' });
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
  if (!text || streaming.value || detailUnavailable.value) return;
  draft.value = '';
  nextTick(autoGrow);
  const conv = ensureConversation();
  store.maybeAutoTitle(conv, text);
  store.addMessage(conv, 'user', text);
  scrollToBottom(true);
  runTurn(conv, text);
}

// 重新发送历史问题时保留输入框中的草稿和已有对话。
function onResend(text: string) {
  const conv = store.active;
  if (!conv || !text.trim() || streaming.value) return;
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
  const preserveLocal = !!conv.localOnly;
  let saved = false;
  // 后台生成只更新对应会话，不能滚动用户当前正在查看的另一段历史。
  const scrollActiveToBottom = () => {
    if (store.activeId === conv.id) scrollToBottom();
  };
  const assistant = store.addMessage(conv, 'assistant');
  streaming.value = true;
  streamingMessageId.value = assistant.id;
  streamingConvId.value = conv.id;
  stickToBottom = true;
  abortController = new AbortController();

  let pending = '';
  let pendingReasoning = '';
  let flushTimer: ReturnType<typeof setTimeout> | null = null;
  function flushPending() {
    if (flushTimer !== null) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    if (pending) {
      assistant.content += pending;
      pending = '';
      scrollActiveToBottom();
    }
    if (pendingReasoning) {
      assistant.reasoning = (assistant.reasoning || '') + pendingReasoning;
      pendingReasoning = '';
      scrollActiveToBottom();
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
      case 'reasoning_delta':
        pendingReasoning += event.text;
        scheduleFlush();
        break;
      case 'tool_call':
        assistant.toolCalls.push({
          name: event.name,
          iteration: event.iteration,
          state: 'running',
        });
        scrollActiveToBottom();
        break;
      case 'tool_result': {
        const chip = [...assistant.toolCalls]
          .reverse()
          .find(
            c =>
              c.state === 'running' &&
              c.name === event.name &&
              c.iteration === event.iteration,
          );
        if (chip) {
          chip.state = event.error ? 'error' : 'done';
          chip.error = event.error ?? undefined;
        }
        scrollActiveToBottom();
        break;
      }
      case 'done':
        // done.content 是权威正文（最后一轮非空内容），覆盖流式拼接结果
        flushPending();
        assistant.content = event.content;
        assistant.truncated = event.truncated;
        assistant.usage = event.usage;
        saved = !!event.content.trim();
        break;
      case 'error':
        flushPending();
        assistant.error = event.message;
        break;
    }
  };

  try {
    await chatWithAgent(
      { message: question, session_id: conv.sessionId, model: selectedModel.value || undefined },
      onEvent,
      abortController.signal,
    );
  } catch (error: any) {
    saved = false;
    flushPending();
    if (error?.name === 'AbortError') {
      assistant.content += assistant.content
        ? '\n\n（已停止生成）'
        : '（已停止生成）';
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
    // done 在服务端落盘后才发送；失败/停止以及旧本地内容继续保留本地快照。
    conv.localOnly = preserveLocal || !saved || !!assistant.error;
    conv.dirty = conv.localOnly;
    store.persist();
    store.trimCache();
    scrollActiveToBottom();
  }
}

onMounted(() => {
  void loadPage(true);
});

onBeforeUnmount(() => {
  abortController?.abort();
  disposeSessionList();
});
</script>

<style scoped lang="less">
.chat-page {
  --chat-ink: #172338;
  --chat-muted: #6e7d90;
  --chat-line: #e3eaf1;
  --chat-accent: #1e6f78;
  display: flex;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #fff;
  color: var(--chat-ink);
}

.conv-panel {
  display: flex;
  flex: 0 0 264px;
  flex-direction: column;
  min-height: 0;
  background: #f6f8fa;
  border-right: 1px solid var(--chat-line);
}
.panel-brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 24px 18px 20px;
  strong, small { display: block; }
  strong { font-size: 15px; letter-spacing: .04em; }
  small { margin-top: 3px; color: #80909f; font-size: 9px; font-weight: 700; letter-spacing: .075em; }
}
.brand-mark {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  border-radius: 12px;
  color: #fff;
  background: #216f78;
  font-size: 20px;
  box-shadow: 0 6px 14px rgba(30, 111, 120, .17);
}
.panel-head {
  display: grid;
  gap: 9px;
  padding: 0 14px;
  .new-conv {
    justify-content: flex-start;
    gap: 9px;
    width: 100%;
    height: 42px;
    margin: 0;
    border-color: #c8dedd;
    border-radius: 10px;
    color: #17656e;
    background: #eaf5f3;
    font-weight: 600;
  }
  .conv-search :deep(.el-input__wrapper) {
    min-height: 42px;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 0 0 1px #e2e9ee inset;
  }
  .conv-search :deep(.el-input__wrapper.is-focus) { box-shadow: 0 0 0 1px #59999d inset; }
}
.list-label {
  display: flex;
  justify-content: space-between;
  padding: 25px 19px 9px;
  color: #8492a0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
  span { font-variant-numeric: tabular-nums; }
}
.conv-list { flex: 1; min-height: 0; overflow-y: auto; padding: 0 10px; }
.conv-item {
  display: flex;
  align-items: center;
  min-width: 0;
  margin-bottom: 3px;
  border-radius: 10px;
  &:hover, &:focus-within { background: #eaf0f2; }
  &.active { background: #e4f0ef; color: #17656e; }
  &:hover .conv-delete, &:focus-within .conv-delete, &.active .conv-delete { opacity: 1; }
}
.conv-select {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 10px;
  min-width: 0;
  min-height: 44px;
  padding: 0 10px;
  border: 0;
  border-radius: 10px;
  color: inherit;
  background: transparent;
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}
.conv-icon { flex-shrink: 0; color: #82939f; font-size: 16px; }
.active .conv-icon { color: #287d82; }
.conv-text { display: flex; flex: 1; flex-direction: column; min-width: 0; padding: 6px 0; gap: 4px; }
.conv-title, .conv-snippet { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.conv-snippet { color: var(--chat-muted); font-size: 11px; }
.load-more { width: 100%; min-height: 44px; }
.conv-delete {
  display: grid;
  place-items: center;
  width: 38px;
  height: 44px;
  flex: 0 0 auto;
  padding: 0;
  border: 0;
  border-radius: 8px;
  color: #82909d;
  background: transparent;
  opacity: 0;
  cursor: pointer;
  &:hover { color: #c45656; }
}
.conv-select:focus-visible, .conv-delete:focus-visible, .memory-button:focus-visible, .suggestion-card:focus-visible {
  outline: 2px solid #1e6f78;
  outline-offset: -2px;
}
.conv-empty { padding: 18px 10px; color: #8492a0; font-size: 12px; line-height: 1.6; }
.panel-foot { padding: 10px 14px 18px; border-top: 1px solid var(--chat-line); }
.memory-button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 44px;
  padding: 0 8px;
  border: 0;
  border-radius: 9px;
  color: #526477;
  background: transparent;
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  &:hover { background: #eaf0f2; }
  span { flex: 1; }
  .memory-arrow { color: #91a0aa; }
}
.source-label { padding: 8px 8px 0; color: #8b99a6; font-size: 11px; }
.source-dot { display: inline-block; width: 6px; height: 6px; margin-right: 7px; border-radius: 50%; background: #51a592; vertical-align: middle; }
.panel-mask { display: none; }

.chat-main { display: flex; flex: 1; flex-direction: column; min-width: 0; min-height: 0; background: #fff; }
.model-select { width: 160px; flex: 0 0 160px; margin-left: auto; }
.chat-head {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 64px;
  padding: 10px 25px;
  border-bottom: 1px solid #edf1f4;
  .head-menu { display: none; }
  .head-context { display: flex; flex: 1; flex-direction: column; gap: 4px; min-width: 0; }
  .head-eyebrow { color: #94a1ae; font-size: 10px; letter-spacing: .06em; }
  .head-title { overflow: hidden; color: #273549; font-size: 14px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
  .head-busy { color: #277a83; font-size: 12px; white-space: nowrap; }
  .head-hint { color: #82919e; font-size: 12px; white-space: nowrap; }
}
.messages { flex: 1; min-height: 0; overflow-y: auto; scroll-behavior: smooth; }
.message-list { box-sizing: border-box; width: 85%; margin: 0 auto; padding: 24px 28px 28px; }

// 欢迎页与对话页共用输入框，避免切换状态时丢失草稿和焦点。
.is-empty {
  overflow-y: auto;
  background: radial-gradient(ellipse at 50% 28%, #edf7f5 0%, #f8fafb 38%, #fff 72%);
  .chat-head { background: rgba(255, 255, 255, .72); }
  .messages { flex: 0 0 auto; margin-top: auto; overflow: visible; }
  .composer { margin-bottom: auto; }
}
.empty-state {
  max-width: 720px;
  margin: 0 auto;
  padding: 42px 24px 28px;
  text-align: center;
  .empty-kicker { color: #388b87; font-size: 10px; font-weight: 700; letter-spacing: .18em; }
  .empty-kicker span { display: inline-block; width: 22px; height: 1px; margin: 0 7px 3px 0; background: #65aaa2; }
  h1 { margin: 19px 0 14px; color: #20364a; font-family: Georgia, 'Songti SC', 'SimSun', serif; font-size: clamp(30px, 3.2vw, 43px); font-weight: 600; letter-spacing: .035em; line-height: 1.35; }
  h1 em { color: #25837d; font-style: normal; }
  .empty-sub { margin: 0; color: #7a8b97; font-size: 14px; line-height: 1.7; }
}
.composer { flex-shrink: 0; padding: 8px 28px 18px; }
.composer-box {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  max-width: 764px;
  min-height: 76px;
  margin: 0 auto;
  padding: 15px;
  border: 1px solid #dce5e9;
  border-radius: 17px;
  background: #fff;
  box-shadow: 0 9px 30px rgba(34, 67, 77, .06);
  transition: border-color .15s, box-shadow .15s;
  &.focused { border-color: #5fa29d; box-shadow: 0 0 0 3px rgba(42, 134, 128, .1), 0 9px 30px rgba(34, 67, 77, .06); }
  textarea {
    flex: 1;
    min-width: 0;
    max-height: 160px;
    padding: 7px 3px;
    border: 0;
    outline: 0;
    color: #273549;
    background: transparent;
    font: inherit;
    font-size: 14px;
    line-height: 1.6;
    resize: none;
    &::placeholder { color: #9aaab3; }
  }
  .send-btn { width: 42px; height: 42px; flex-shrink: 0; margin: 0; border-color: #237b78; background: #237b78; }
  .send-btn:disabled { border-color: #d8e5e3; background: #d8e5e3; }
  .send-btn.stop { color: #fff; }
}
.suggestions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  max-width: 764px;
  margin: 16px auto 0;
}
.suggestion-card {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  padding: 10px 14px;
  border: 1px solid #e2eae9;
  border-radius: 11px;
  color: #526a75;
  background: rgba(255, 255, 255, .78);
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: border-color .15s, background .15s, transform .15s;
  > .el-icon:first-child { color: #62a29c; font-size: 16px; }
  span { flex: 1; }
  .suggestion-arrow { color: #a6b7b8; }
  &:hover:not(:disabled) { transform: translateY(-1px); border-color: #b8d9d3; background: #fff; }
  &:disabled { cursor: not-allowed; opacity: .6; }
}
.composer-foot { max-width: 764px; margin: 12px auto 0; color: #9aa8b0; font-size: 11px; text-align: center; }

@media (max-width: 768px) {
  .conv-panel { position: fixed; inset: 0 auto 0 0; z-index: 1001; width: 264px; visibility: hidden; transform: translateX(-100%); transition: transform .2s ease, visibility .2s; }
  .conv-panel.open { visibility: visible; transform: translateX(0); }
  .conv-delete { opacity: 1; }
  .panel-mask { display: block; position: fixed; inset: 0; z-index: 1000; background: rgba(18, 35, 48, .38); }
  .chat-head { min-height: 58px; padding: 8px 12px; }
  .chat-head .head-menu { display: inline-flex; width: 44px; height: 44px; }
  .chat-head .head-hint { display: none; }
  .message-list { padding: 14px 18px 20px; }
  .composer { padding: 8px 16px 14px; }
  .empty-state { padding: 30px 20px 22px; }
  .suggestions { gap: 8px; }
  .suggestion-card { min-height: 56px; padding: 8px 10px; font-size: 12px; }
}
@media (max-width: 420px) {
  .suggestions { grid-template-columns: 1fr; }
  .suggestion-card { min-height: 44px; }
  .empty-state h1 { font-size: 29px; }
}
@media (prefers-reduced-motion: reduce) {
  .messages { scroll-behavior: auto; }
  .conv-panel, .suggestion-card, .composer-box { transition: none; }
}
</style>
