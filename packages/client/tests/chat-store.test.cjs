const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { createPinia, setActivePinia } = require('pinia');

// 执行真实 TS store，使用内存存储和可控接口验证竞态，不复制业务逻辑。
function setup(initial = [], fetchDetail = async id => ({ id, messages: [{ role: 'user', content: id }] })) {
  const storage = new Map([['payback-agent-chats', JSON.stringify(initial)]]);
  global.localStorage = { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) };
  setActivePinia(createPinia());
  const filename = path.join(__dirname, '../src/store/chat.ts');
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(
    name => name === '@/api/agent' ? { fetchAgentSession: fetchDetail } : require(name), module, module.exports,
  );
  return { store: module.exports.useChatStore(), storage };
}

test('摘要去重且不加载正文，BIGINT 排序不丢精度', () => {
  const { store } = setup();
  store.mergeSummaries([
    { id: 'a', title: 'A', lastTurnId: '9007199254740992', snippet: '' },
    { id: 'b', title: 'B', lastTurnId: '9007199254740993', snippet: '' },
  ]);
  store.mergeSummaries([{ id: 'a', title: 'A', lastTurnId: '9007199254740992', snippet: '' }]);
  assert.equal(store.conversations.length, 2);
  assert.deepEqual(store.sorted.map(c => c.sessionId), ['b', 'a']);
  assert.equal(store.conversations[0].messagesLoaded, false);
});

test('切换后详情回到对应会话，正常远端正文不落本地存储', async () => {
  let resolve;
  const { store, storage } = setup([], () => new Promise(done => { resolve = done; }));
  store.mergeSummaries([{ id: 'a', title: 'A', lastTurnId: '1', snippet: '' }]);
  const a = store.conversations[0];
  const loading = store.loadMessages(a.id);
  const b = store.newConversation();
  resolve({ id: 'a', messages: [{ role: 'assistant', content: '远端正文' }] });
  await loading;
  assert.equal(store.activeId, b.id);
  assert.equal(a.messages[0].content, '远端正文');
  store.persist();
  assert.ok(!storage.get('payback-agent-chats').includes('远端正文'));
});

test('旧本地正文、失败状态和超过 50 条的未同步会话不被截断', () => {
  const legacy = { id: 'legacy', sessionId: 'old', title: '旧记录', createdAt: 1, updatedAt: 1,
    messages: [{ id: 'm', role: 'assistant', content: '失败时的正文', toolCalls: [], error: '失败', createdAt: 1 }] };
  const { store, storage } = setup([legacy]);
  store.mergeSummaries([{ id: 'old', title: '远端标题', lastTurnId: '1', snippet: '' }]);
  for (let i = 0; i < 55; i++) store.newConversation();
  store.persist();
  assert.equal(store.conversations.length, 56);
  assert.ok(storage.get('payback-agent-chats').includes('失败时的正文'));
});

test('正文缓存淘汰保留活动会话和未同步数据，详情失败可重试', async () => {
  let calls = 0;
  const { store } = setup([], async id => {
    if (calls++ === 0) throw new Error('离线');
    return { id, messages: [{ role: 'user', content: id }] };
  });
  store.mergeSummaries(Array.from({ length: 8 }, (_, i) => ({ id: String(i), title: String(i), lastTurnId: String(i + 1), snippet: '' })));
  const id = store.conversations[0].id;
  await assert.rejects(store.loadMessages(id));
  await store.loadMessages(id);
  for (const conv of store.conversations.slice(1)) await store.loadMessages(conv.id);
  assert.ok(store.conversations.filter(c => c.messagesLoaded && !c.dirty).length <= 5);
  const local = store.newConversation();
  store.addMessage(local, 'user', '未同步');
  store.trimCache();
  assert.equal(local.messages[0].content, '未同步');
});

test('摘要快照刷新后仍能按需加载，存储失败不覆盖旧快照', async () => {
  const { store, storage } = setup();
  store.mergeSummaries([{ id: 'a', title: 'A', lastTurnId: '1', snippet: '' }]);
  const snapshot = JSON.parse(storage.get('payback-agent-chats'));
  const restored = setup(snapshot).store;
  await restored.loadMessages(restored.conversations[0].id);
  assert.equal(restored.conversations[0].messages[0].content, 'a');
  const previous = storage.get('payback-agent-chats');
  global.localStorage.setItem = () => { throw new Error('quota'); };
  store.persist();
  assert.equal(store.storageError, true);
  assert.equal(storage.get('payback-agent-chats'), previous);
});

test('远端更新使旧正文缓存失效，生成中和本地失败内容不受影响', async () => {
  const { store } = setup();
  store.mergeSummaries([{ id: 'a', title: 'A', lastTurnId: '1', snippet: '' }]);
  const conv = store.conversations[0];
  await store.loadMessages(conv.id);
  store.mergeSummaries([{ id: 'a', title: 'A', lastTurnId: '2', snippet: '' }]);
  assert.equal(conv.messagesLoaded, false);
  await store.loadMessages(conv.id);
  store.addMessage(conv, 'assistant', '正在生成');
  store.mergeSummaries([{ id: 'a', title: 'A', lastTurnId: '3', snippet: '' }]);
  assert.equal(conv.messagesLoaded, true);
  assert.equal(conv.messages.at(-1).content, '正在生成');
});
