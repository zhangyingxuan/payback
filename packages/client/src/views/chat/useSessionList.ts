import { computed, ref, watch } from 'vue';
import { fetchAgentSessions } from '@/api/agent';
import type { useChatStore } from '@/store/chat';

export function useSessionList(store: ReturnType<typeof useChatStore>) {
  const query = ref('');
  const loading = ref(false);
  const error = ref('');
  const nextCursor = ref<string | null>(null);
  const sessionIds = ref(store.conversations.flatMap(conv => conv.sessionId ? [conv.sessionId] : []));
  const snippets = ref<Record<string, string>>({});
  let controller: AbortController | undefined;
  let generation = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const conversations = computed(() => {
    const needle = query.value.trim().toLocaleLowerCase();
    const ids = new Set(sessionIds.value);
    return store.sorted.filter(conv => {
      // 搜索覆盖全部远端历史，同时保留仅存在本机的失败消息和草稿会话。
      if (needle) return (conv.sessionId && ids.has(conv.sessionId)) ||
        (conv.dirty && (conv.title.toLocaleLowerCase().includes(needle) ||
          conv.messages.some(message => message.content.toLocaleLowerCase().includes(needle))));
      return conv.dirty || conv.id === store.activeId || (conv.sessionId && ids.has(conv.sessionId));
    });
  });

  async function loadPage(reset = false) {
    if (loading.value && !reset) return;
    if (!reset && !nextCursor.value) return;
    controller?.abort();
    const requestController = new AbortController();
    controller = requestController;
    const requestGeneration = ++generation;
    loading.value = true;
    error.value = '';
    try {
      const page = await fetchAgentSessions(query.value.trim(), reset ? undefined : nextCursor.value!, requestController.signal);
      // 取消请求之外再检查序号，防止旧搜索或旧分页结果覆盖新查询。
      if (requestGeneration !== generation) return;
      store.mergeSummaries(page.items);
      sessionIds.value = [...new Set([...(reset ? [] : sessionIds.value), ...page.items.map(item => item.id)])];
      snippets.value = { ...(reset ? {} : snippets.value), ...Object.fromEntries(page.items.map(item => [item.id, item.snippet])) };
      nextCursor.value = page.nextCursor;
    } catch (cause) {
      if (requestGeneration !== generation || requestController.signal.aborted) return;
      error.value = cause instanceof Error ? cause.message : '无法加载会话列表';
    } finally {
      if (requestGeneration === generation) loading.value = false;
    }
  }

  // 输入时立即让旧请求失效，等待用户短暂停顿后再查询。
  const stop = watch(query, () => {
    clearTimeout(timer);
    controller?.abort();
    generation++;
    loading.value = false;
    error.value = '';
    sessionIds.value = [];
    snippets.value = {};
    nextCursor.value = null;
    timer = setTimeout(() => { void loadPage(true); }, 250);
  }, { flush: 'sync' });

  function onScroll(event: Event) {
    const element = event.target as HTMLElement;
    if (!error.value && element.scrollHeight - element.scrollTop - element.clientHeight < 120) {
      void loadPage();
    }
  }

  function dispose() {
    stop();
    clearTimeout(timer);
    generation++;
    controller?.abort();
  }

  return { query, conversations, snippets, loading, error, nextCursor, loadPage, onScroll, dispose };
}
