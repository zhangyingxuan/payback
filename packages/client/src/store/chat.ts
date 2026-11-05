/**
 * 会话列表存储：localStorage 持久化，刷新不丢。
 *
 * 只存"可见"内容（用户问题 + 助手正文 + 工具调用状态摘要），
 * 与 agent 端 append_turn 的口径一致——工具结果原文一律不落盘，
 * 一个四级复盘的 JSON 有 ~2.9 万字符，存下来 localStorage 很快就爆。
 */
import { defineStore } from 'pinia';

const STORAGE_KEY = 'payback-agent-chats';
const MAX_CONVERSATIONS = 50;

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
  toolCalls: ToolCallChip[];
  /** 本轮失败（网关/服务错误），content 可能为空 */
  error?: string;
  truncated?: boolean;
  usage?: Record<string, number>;
  createdAt: number;
}

export interface Conversation {
  id: string;
  /** agent 服务端的会话 id；服务重启后失效，agent 会当新会话处理 */
  sessionId?: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

function uuid(): string {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function load(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
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
    };
  },
  getters: {
    active: (state): Conversation | undefined =>
      state.conversations.find((c) => c.id === state.activeId),
    /** 侧栏按最近更新排序，和 ChatGPT 一致 */
    sorted: (state): Conversation[] =>
      [...state.conversations].sort((a, b) => b.updatedAt - a.updatedAt),
  },
  actions: {
    persist() {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(this.conversations.slice(0, MAX_CONVERSATIONS))
        );
      } catch {
        // localStorage 满/隐私模式：丢会话列表不影响当前对话
      }
    },
    touch(conv: Conversation) {
      conv.updatedAt = Date.now();
      this.persist();
    },
    newConversation(): Conversation {
      const conv: Conversation = {
        id: uuid(),
        title: '新对话',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      this.conversations.unshift(conv);
      if (this.conversations.length > MAX_CONVERSATIONS) {
        this.conversations.length = MAX_CONVERSATIONS;
      }
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
