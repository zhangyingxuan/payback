const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');

// 执行组件真实函数，验证切换定位、流式跟随及快速切换的隔离。
const source = fs.readFileSync(path.join(__dirname, '../src/views/chat/index.vue'), 'utf8');
const body = source.match(/function scrollToBottom\(force = false\) \{([\s\S]*?)\n\}/)[1];
const scroll = new Function('store', 'messagesEl', 'requestAnimationFrame', 'stickToBottom', 'force', body);

test('强制定位直接到长会话底部，普通跟随沿用容器滚动行为', () => {
  const calls = [];
  const element = { scrollHeight: 50000, scrollTo: options => calls.push(options) };
  const store = { activeId: 'a' };
  scroll(store, { value: element }, callback => callback(), false, true);
  assert.deepEqual(calls, [{ top: 50000, behavior: 'instant' }]);
  scroll(store, { value: element }, callback => callback(), true, false);
  assert.deepEqual(calls[1], { top: 50000, behavior: 'auto' });
  scroll(store, { value: element }, callback => callback(), false, false);
  assert.equal(calls.length, 2);
});

test('快速切换后旧定位回调不滚动新会话', () => {
  const store = { activeId: 'a' };
  let frame;
  scroll(store, { value: { scrollTo: () => assert.fail('旧回调不应滚动新会话') } }, callback => { frame = callback; }, true, true);
  store.activeId = 'b';
  frame();
});
