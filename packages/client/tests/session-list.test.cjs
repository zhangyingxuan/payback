const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const vue = require('vue');

// 让接口响应可乱序返回，验证真实 composable 的取消与结果隔离。
function setup() {
  const requests = [];
  const store = vue.reactive({ conversations: [], sorted: [], activeId: '', mergeSummaries(items) {
    for (const item of items) {
      if (!this.sorted.some(conv => conv.sessionId === item.id)) {
        this.sorted.push({ id: item.id, sessionId: item.id, title: item.title, messages: [] });
      }
    }
  } });
  const filename = path.join(__dirname, '../src/views/chat/useSessionList.ts');
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => name === '@/api/agent' ? {
    fetchAgentSessions: (query, cursor, signal) => new Promise((resolve, reject) => {
      requests.push({ query, cursor, signal, resolve, reject });
    }),
  } : require(name), module, module.exports);
  return { list: module.exports.useSessionList(store), requests };
}

const page = (id, nextCursor = null) => ({ items: [{ id, title: id, lastTurnId: '1', snippet: id }], nextCursor });

test('旧查询即使晚返回也不会覆盖新搜索，分页去重且沿用查询', async () => {
  const { list, requests } = setup();
  try {
    const old = list.loadPage(true);
    list.query.value = '关键词';
    const current = list.loadPage(true);
    assert.equal(requests[0].signal.aborted, true);
    requests[1].resolve(page('匹配结果', '10'));
    await current;
    requests[0].resolve(page('旧结果'));
    await old;
    assert.deepEqual(list.conversations.value.map(conv => conv.id), ['匹配结果']);
    const more = list.loadPage();
    assert.equal(requests[2].query, '关键词');
    assert.equal(requests[2].cursor, '10');
    requests[2].resolve(page('匹配结果'));
    await more;
    assert.equal(list.conversations.value.length, 1);
  } finally { list.dispose(); }
});

test('失败保留当前结果和游标，允许原位重试，销毁时取消请求', async () => {
  const { list, requests } = setup();
  try {
    const first = list.loadPage(true);
    requests[0].resolve(page('a', '9'));
    await first;
    const more = list.loadPage();
    requests[1].reject(new Error('暂时离线'));
    await more;
    assert.equal(list.error.value, '暂时离线');
    assert.equal(list.nextCursor.value, '9');
    assert.equal(list.conversations.value[0].id, 'a');
    const retry = list.loadPage();
    requests[2].resolve(page('b'));
    await retry;
    assert.deepEqual(list.conversations.value.map(conv => conv.id), ['a', 'b']);
    void list.loadPage(true);
    list.dispose();
    assert.equal(requests[3].signal.aborted, true);
  } finally { list.dispose(); }
});
