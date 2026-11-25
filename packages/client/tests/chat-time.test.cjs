const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const Vue = require('vue');
const { parse, compileScript, compileTemplate } = require('@vue/compiler-sfc');

// 编译真实组件，校验日期计算和两种角色的时间节点，不复制格式化逻辑。
const filename = path.join(__dirname, '../src/views/chat/components/ChatMessage.vue');
const { descriptor } = parse(fs.readFileSync(filename, 'utf8'));
const script = compileScript(descriptor, { id: 'time-test' });
const code = ts.transpileModule(script.content, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
const componentModule = { exports: {} };
new Function('require', 'module', 'exports', code)(
  id => id === '../readVisualFile' ? require('../src/views/chat/readVisualFile.ts') : require(id),
  componentModule, componentModule.exports);
const compiled = compileTemplate({ source: descriptor.template.content, filename, id: 'time-test',
  compilerOptions: { mode: 'function' } });
const render = new Function('Vue', compiled.code)({ ...Vue, resolveComponent: name => name });

test('历史消息在有图片时隐藏附件名称，旧记录保留名称', () => {
  const content = '看看这张图\n\n【附件】图片 · chart.png';
  const message = { role: 'user', content, toolCalls: [], createdAt: 0 };
  const setup = props => componentModule.exports.default.setup({ message: props }, { expose() {} });
  assert.equal(setup({ ...message, image: 'data:image/jpeg;base64,preview' }).userContent.value, '看看这张图');
  assert.equal(setup(message).userContent.value, content);
});

test('用户和助手展示日期及秒，缺失时间不显示 1970 年', () => {
  for (const role of ['user', 'assistant']) {
    for (const createdAt of [new Date(2026, 10, 16, 19, 35, 7).getTime(), 0]) {
      const props = { message: { role, content: '', toolCalls: [], createdAt } };
      const setup = componentModule.exports.default.setup(props, { expose() {} });
      const tree = render({ ...props, userContent: setup.userContent.value, messageTime: setup.messageTime.value,
        messageDateTime: setup.messageDateTime.value, previewImages: [], chartImages: [], visibleContent: '' }, []);
      function findTime(node) {
        if (node?.type === 'time') return node;
        return Array.isArray(node?.children) ? node.children.map(findTime).find(Boolean) : undefined;
      }
      const time = findTime(tree);
      assert.equal(time.children, createdAt ? '2026-11-16 19:35:07' : '时间未知');
      assert.equal(time.props.datetime, createdAt ? new Date(createdAt).toISOString() : undefined);
    }
  }
});
