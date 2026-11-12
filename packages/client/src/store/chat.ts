/**
 * 会话摘要与按需获取的正文分别管理；本地只保留摘要及未同步内容。
 */
import { defineStore } from 'pinia';
import { fetchAgentSession, type AgentSessionSummary } from '@/api/agent';

const STORAGE_KEY = 'payback-agent-chats';
const MAX_MESSAGE_CACHE = 5;
const pendingDetails = new Map<string, Promise<void>>();

export interface ToolCallChip {
  name: string;
  iteration: number;
  state: 'running' | 'done' | 'error';
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
  toolCalls: ToolCallChip[];
  /** 本轮失败（网关/服务错误），content 可能为空 */
  error?: string;
  truncated?: boolean;
  usage?: Record<string, number>;
  createdAt: number;
}

export interface Conversation {
  id: string;
  /** agent 服务端的持久化会话 id */
  sessionId?: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  lastTurnId?: string;
  messagesLoaded: boolean;
  loading?: boolean;
  loadError?: string;
  dirty?: boolean;
  localOnly?: boolean;
  cachedAt?: number;
}

function uuid(): string {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function load(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    // 旧版本的正文没有同步标记，迁移时保守保留，不能被远端摘要覆盖。
    return Array.isArray(parsed) ? parsed.filter(item => item && typeof item.id === 'string' &&
      typeof item.title === 'string' && Array.isArray(item.messages)).map(item => ({
      ...item,
      messagesLoaded: item.messagesLoaded ?? true,
      dirty: item.dirty ?? (item.messagesLoaded === undefined),
      localOnly: item.localOnly ?? (item.messagesLoaded === undefined),
      loading: false,
    })) : [];
  } catch {
    return [];
  }
}

function latestId(conversations: Conversation[]): string {
  let best = '';
  let bestTime = -Infinity;
  for (const conv of conversations) {
    if (conv.updatedAt > bestTime) {
      bestTime = conv.updatedAt;
      best = conv.id;
    }
  }
  return best;
}

export const useChatStore = defineStore('agentChat', {
  state: () => {
    const conversations = load() as Conversation[];
    return {
      conversations,
      // 刷新后回到最近一次会话而不是空态：复盘助手的对话是连续工作流
      activeId: latestId(conversations),
      storageError: false,
    };
  },
  getters: {
    active: (state): Conversation | undefined =>
      state.conversations.find((c) => c.id === state.activeId),
    /** 侧栏按最近更新排序，和 ChatGPT 一致 */
    sorted: (state): Conversation[] =>
      [...state.conversations].sort((a, b) => {
        // 本次本机更新优先；远端 ID 用 BigInt 比较，避免超过安全整数后顺序混乱。
        if (a.updatedAt !== b.updatedAt) return b.updatedAt - a.updatedAt;
        const left = BigInt(a.lastTurnId || '0');
        const right = BigInt(b.lastTurnId || '0');
        return left === right ? a.id.localeCompare(b.id) : left > right ? -1 : 1;
      }),
  },
  actions: {
    mergeSummaries(sessions: AgentSessionSummary[]) {
      for (const session of sessions) {
        const existing = this.conversations.find(conv => conv.sessionId === session.id);
        if (existing) {
          // 其他设备追加了消息时丢弃可重取的旧缓存，本地未同步内容不被覆盖。
          if (!existing.dirty && existing.lastTurnId !== session.lastTurnId) {
            existing.messages = [];
            existing.messagesLoaded = false;
          }
          existing.lastTurnId = session.lastTurnId;
          if (!existing.dirty) {
            existing.title = session.title;
            existing.updatedAt = 0;
          }
        } else {
          this.conversations.push({
            id: uuid(), sessionId: session.id, title: session.title,
            lastTurnId: session.lastTurnId, createdAt: 0, updatedAt: 0,
            messages: [], messagesLoaded: false, dirty: false, localOnly: false,
          });
        }
      }
      if (!this.activeId) this.activeId = this.sorted[0]?.id || '';
      this.persist();
    },
    async loadMessages(id: string): Promise<void> {
      const conv = this.conversations.find(item => item.id === id);
      if (!conv || conv.messagesLoaded || !conv.sessionId) return;
      const pending = pendingDetails.get(id);
      if (pending) return pending;
      conv.loading = true;
      conv.loadError = '';
      const request = (async () => {
        try {
          const detail = await fetchAgentSession(conv.sessionId!);
          // 请求返回时会话可能已删除或已写入本地消息，不能覆盖这些变更。
          if (!this.conversations.includes(conv) || conv.dirty) return;
          conv.messages = detail.messages.map(message => ({
            ...message, id: uuid(), toolCalls: [], createdAt: 0,
          }));
          conv.messagesLoaded = true;
          conv.cachedAt = Date.now();
          this.trimCache();
        } catch (error) {
          conv.loadError = error instanceof Error ? error.message : '无法读取会话内容';
          throw error;
        } finally {
          conv.loading = false;
          pendingDetails.delete(id);
        }
      })();
      pendingDetails.set(id, request);
      return request;
    },
    trimCache() {
      // 只有可重新获取的正文参与淘汰，活动会话和未同步数据始终保留。
      const cached = this.conversations.filter(conv => conv.messagesLoaded && conv.sessionId && !conv.dirty)
        .sort((a, b) => (b.cachedAt || 0) - (a.cachedAt || 0));
      let count = cached.length;
      for (const conv of cached.slice().reverse()) {
        if (count <= MAX_MESSAGE_CACHE) break;
        if (conv.id === this.activeId) continue;
        conv.messages = [];
        conv.messagesLoaded = false;
        count--;
      }
    },
    persist() {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(this.sorted.filter((conv, index) => index < 30 || conv.dirty || conv.id === this.activeId)
            .map(conv => ({ ...conv, messages: conv.dirty || !conv.sessionId ? conv.messages : [],
              messagesLoaded: conv.dirty || !conv.sessionId ? conv.messagesLoaded : false,
              dirty: !!conv.dirty, localOnly: !!conv.localOnly, loading: false, loadError: '' })))
        );
        this.storageError = false;
      } catch {
        // 写入失败保留旧快照及当前内存，不清空用户数据。
        this.storageError = true;
      }
    },
    touch(conv: Conversation) {
      conv.updatedAt = Date.now();
    },
    newConversation(): Conversation {
      const conv: Conversation = {
        id: uuid(),
        title: '新对话',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messagesLoaded: true,
        dirty: true,
      };
      this.conversations.unshift(conv);
      this.activeId = conv.id;
      this.persist();
      // 返回数组里的响应式代理而非原始对象：调用方后续直接改它的
      // title/messages，改原始对象不会触发任何重新渲染
      return this.conversations[0];
    },
    deleteConversation(id: string) {
      const index = this.conversations.findIndex((c) => c.id === id);
      if (index >= 0) this.conversations.splice(index, 1);
      if (this.activeId === id) {
        this.activeId = this.sorted[0]?.id ?? '';
      }
      this.persist();
    },
    select(id: string) {
      this.activeId = id;
      const conv = this.active;
      if (conv) conv.cachedAt = Date.now();
    },
    addMessage(conv: Conversation, role: 'user' | 'assistant', content = ''): ChatMessage {
      const message: ChatMessage = {
        id: uuid(),
        role,
        content,
        toolCalls: [],
        createdAt: Date.now(),
      };
      conv.messages.push(message);
      conv.dirty = true;
      this.persist();
      // 同上：必须把 push 进响应式数组后的代理交回给调用方，
      // 流式渲染靠的就是对这个代理做 content += delta
      return conv.messages[conv.messages.length - 1];
    },
    /** 首问即标题：截前 24 个字符，和 ChatGPT 的自动命名行为一致 */
    maybeAutoTitle(conv: Conversation, question: string) {
      if (conv.title === '新对话') {
        conv.title = question.trim().slice(0, 24) || '新对话';
      }
    },
  },
});
