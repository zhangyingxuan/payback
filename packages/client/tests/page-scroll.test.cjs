const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

// 直接验证组件中的处理函数，避免测试副本与实际按钮逻辑脱节。
const source = fs.readFileSync(path.join(__dirname, '../src/views/home.vue'), 'utf8');
const body = source.match(/const scrollToEdge = \(bottom: boolean\) => \{([\s\S]*?)\n\};/)[1]
  .replace('querySelectorAll<HTMLElement>', 'querySelectorAll');
const scrollToEdge = new Function('contentRef', 'window', 'bottom', body);

test('选择可见的主滚动区，忽略隐藏标签和不可滚动外壳', () => {
  let result;
  const hidden = { clientHeight: 0, scrollHeight: 3000 };
  const shell = { clientHeight: 600, scrollHeight: 2000, overflowY: 'hidden' };
  const pane = {
    clientHeight: 600, scrollHeight: 2400, overflowY: 'auto',
    scrollTo: (options) => { result = options; },
  };
  const content = {
    querySelectorAll: () => [hidden, shell, pane],
    scrollTo: () => assert.fail('不应滚动外层容器'),
  };
  const window = {
    getComputedStyle: (element) => element,
    matchMedia: () => ({ matches: false }),
  };
  scrollToEdge({ value: content }, window, true);
  assert.deepEqual(result, { top: 2400, behavior: 'smooth' });
  scrollToEdge({ value: content }, window, false);
  assert.deepEqual(result, { top: 0, behavior: 'smooth' });
  window.matchMedia = () => ({ matches: true });
  scrollToEdge({ value: content }, window, true);
  assert.equal(result.behavior, 'auto');
});

test('普通页面回退到公共容器，卸载后点击不报错', () => {
  let result;
  const content = {
    scrollHeight: 1800,
    querySelectorAll: () => [],
    scrollTo: (options) => { result = options; },
  };
  scrollToEdge({ value: content }, { matchMedia: () => ({ matches: false }) }, true);
  assert.deepEqual(result, { top: 1800, behavior: 'smooth' });
  assert.doesNotThrow(() => scrollToEdge({ value: null }, {}, true));
});
