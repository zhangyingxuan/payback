/**
 * payback-agent 的 SSE 客户端。
 *
 * 不走 axios：EventSource 只支持 GET，axios 的浏览器适配拿不到流式 body，
 * 所以用 fetch + ReadableStream 手动解析 `data: {...}` 帧。
 * 经 vite 代理 /agentApi -> http://localhost:8300（见 vite.config.ts）。
 */

export interface AgentSessionEvent {
  type: 'session';
  session_id: string;
}

export interface AgentDeltaEvent {
  type: 'delta';
  iteration: number;
  text: string;
}

export interface AgentReasoningDeltaEvent {
  type: 'reasoning_delta';
  iteration: number;
  text: string;
}

export interface AgentToolCallEvent {
  type: 'tool_call';
  iteration: number;
  name: string;
  arguments: string;
}

export interface AgentToolResultEvent {
  type: 'tool_result';
  iteration: number;
  name: string;
  arguments: unknown;
  /** 工具原始返回（可达数万字符）留在服务端，SSE 不下发 */
  error: string | null;
  tool_call_id: string;
}

export interface AgentDoneEvent {
  type: 'done';
  content: string;
  iterations: number;
  truncated: boolean;
  usage: Record<string, number>;
}

export interface AgentErrorEvent {
  type: 'error';
  message: string;
}

export type AgentEvent =
  | AgentSessionEvent
  | AgentDeltaEvent
  | AgentReasoningDeltaEvent
  | AgentToolCallEvent
  | AgentToolResultEvent
  | AgentDoneEvent
  | AgentErrorEvent;

/**
 * 发起一次对话并流式回调事件；resolve 表示流正常结束（包括收到 error 事件）。
 * 网络层失败（代理未启动、502 等）以 reject 抛出，调用方应展示为可重试错误。
 */
export async function chatWithAgent(
  params: { message: string; session_id?: string },
  onEvent: (event: AgentEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch('/agentApi/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    signal,
  });
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok || !contentType.includes('text/event-stream')) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      if (body?.error) detail = body.error;
    } catch {
      /* 非 JSON 响应体，保留状态码 */
    }
    throw new Error(detail);
  }
  if (!response.body) throw new Error('浏览器不支持流式响应');

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // SSE 帧以空行分隔；最后一段可能不完整，留在 buffer 里等下一个 chunk
    const frames = buffer.split('\n\n');
    buffer = frames.pop() ?? '';
    for (const frame of frames) {
      for (const line of frame.split('\n')) {
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload) continue;
        try {
          onEvent(JSON.parse(payload) as AgentEvent);
        } catch {
          // 坏帧跳过：与 llm.chat_stream 对 keep-alive/损坏行的容忍一致
        }
      }
    }
  }
}

export interface AgentMemory {
  id: string;
  content: string;
}

export async function fetchMemories(): Promise<AgentMemory[]> {
  const response = await fetch('/agentApi/memories');
  if (!response.ok) throw new Error('无法读取记忆');
  return response.json();
}

export async function addMemory(content: string): Promise<AgentMemory> {
  const response = await fetch('/agentApi/memories', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error('保存失败，请检查内容和记忆数量');
  return response.json();
}

export async function deleteMemory(id: string): Promise<void> {
  const response = await fetch('/agentApi/memories/' + encodeURIComponent(id), { method: 'DELETE' });
  if (!response.ok) throw new Error('无法删除记忆');
}

export async function deleteAgentSession(id: string): Promise<void> {
  const response = await fetch('/agentApi/sessions/' + encodeURIComponent(id), { method: 'DELETE' });
  if (!response.ok) throw new Error('无法删除服务端会话');
}

export interface AgentStoredSession {
  id: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
}

export async function fetchAgentSessions(): Promise<AgentStoredSession[]> {
  const response = await fetch('/agentApi/sessions');
  if (!response.ok) throw new Error('无法读取服务端会话');
  return response.json();
}

export async function updateMemory(id: string, content: string): Promise<AgentMemory> {
  const response = await fetch('/agentApi/memories/' + encodeURIComponent(id), {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error('无法修改记忆');
  return response.json();
}
