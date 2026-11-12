const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const Vue = require('vue');
const { parse, compileTemplate } = require('@vue/compiler-sfc');

// 编译真实模板，检查模型未发摘要时的等待和结束状态，避免模拟事件掩盖空状态。
const filename = path.join(__dirname, '../src/views/chat/components/ChatMessage.vue');
const { descriptor } = parse(fs.readFileSync(filename, 'utf8'));
const compiled = compileTemplate({ source: descriptor.template.content, filename, id: 'test', compilerOptions: { mode: 'function' } });
const render = new Function('Vue', compiled.code)({ ...Vue, resolveComponent: name => name });

function reasoningNode(streaming, reasoning) {
  const context = {
    message: { role: 'assistant', content: '', toolCalls: [], reasoning },
    streaming, previewImages: [], chartImages: [], visibleContent: '',
    openPreview() {}, copyMessage() {},
  };
  // 直接检查渲染树，不引入浏览器或新的测试依赖。
  const tree = render(context, []);
  function find(node) {
    if (node?.type === 'details') return node;
    return Array.isArray(node?.children) ? node.children.map(find).find(Boolean) : undefined;
  }
  return find(tree);
}

test('未收到摘要也显示思考过程，结束后明确提示未提供', () => {
  for (const streaming of [true, false]) {
    const node = reasoningNode(streaming);
    assert.ok(node, '思考过程不能因没有事件而隐藏');
    assert.equal(node.props.open, streaming);
    const text = JSON.stringify(node.children);
    assert.match(text, /思考过程/);
    assert.match(text, streaming ? /等待模型返回思考摘要/ : /模型未提供思考摘要/);
  }
});

test('收到思考增量后交给 Markdown 渲染', () => {
  const node = reasoningNode(true, '先核对数据');
  assert.ok(node.children.some(child => child.props?.text === '先核对数据'));
});
