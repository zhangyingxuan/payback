const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// 直接运行生产代码，覆盖浏览器读取的 File 对象。
const filename = path.join(__dirname, '../src/views/chat/readTextFile.ts');
const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const source = { exports: {} };
new Function('exports', code)(source.exports);
const { readTextFile } = source.exports;

test('导入时保留 Markdown 和中文内容', async () => {
  const content = '# 复盘\r\n\r\n- **重点**\r\n';
  assert.equal(await readTextFile(new File([content], 'notes.MD')), content);
});

test('拒绝不支持的类型、超限文件、无效 UTF-8 和空白文件', async () => {
  await assert.rejects(readTextFile(new File(['文本'], 'notes.docx')), /支持/);
  await assert.rejects(readTextFile(new File(['a'.repeat(65537)], 'notes.txt')), /64 KiB/);
  await assert.rejects(readTextFile(new File([new Uint8Array([0xff])], 'notes.txt')), /UTF-8/);
  await assert.rejects(readTextFile(new File(['\n  '], 'notes.md')), /为空/);
});
