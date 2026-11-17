const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { parse, compileScript } = require('@vue/compiler-sfc');

// 编译真实日期组件并固定时钟，覆盖交易日、假期和年度日历边界。
const filename = path.join(__dirname, '../src/components/calendar/index.vue');
const { descriptor } = parse(fs.readFileSync(filename, 'utf8'));
const script = compileScript(descriptor, { id: 'calendar-test' });
const code = ts.transpileModule(script.content, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
function calendarText(date) {
  const componentModule = { exports: {} };
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : [date + 'T04:00:00Z'])); }
  }
  const componentRequire = name => name === 'vue'
    ? { ...require('vue'), onUnmounted() {} } : require(name);
  new Function('require', 'module', 'exports', 'Date', 'setInterval', code)(
    componentRequire, componentModule, componentModule.exports, FixedDate, () => 0,
  );
  return componentModule.exports.default.setup({}, { expose() {} }).calendarText.value;
}

test('交易日同时展示今日状态、下个交易日和节假日倒计时', () => {
  assert.equal(calendarText('2026-09-24'), '今日交易日，下一交易日 2026-09-28，距中秋节休市 1 天');
});
test('假期和周末均展示休市原因与下一交易日', () => {
  assert.equal(calendarText('2026-10-01'), '今日国庆节休市，下一交易日 2026-10-08');
  assert.equal(calendarText('2026-11-21'), '今日周末休市，下一交易日 2026-11-23');
});
test('年内无后续节日时仍展示下一交易日，未知年份不推测状态', () => {
  assert.equal(calendarText('2026-11-17'), '今日交易日，下一交易日 2026-11-18，节假日安排待更新');
  assert.equal(calendarText('2027-01-04'), '交易日历待更新');
});
