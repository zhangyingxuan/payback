const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const Vue = require('vue');
const { parse, compileScript } = require('@vue/compiler-sfc');

// 编译真实页面，验证资金按正负分组，避免左右列因原始排行交叉而混排。
const filename = path.join(__dirname, '../src/views/marketOverview/index.vue');
const { descriptor } = parse(fs.readFileSync(filename, 'utf8'));
const script = compileScript(descriptor, { id: 'funds-test' });
const code = ts.transpileModule(script.content, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
const componentModule = { exports: {} };
const pageRequire = name => name === 'vue' ? { ...Vue, onMounted() {}, onUnmounted() {} }
  : name.startsWith('@/api/') || name.endsWith('.vue') ? {} : require(name);
new Function('require', 'module', 'exports', code)(pageRequire, componentModule, componentModule.exports);

test('外围市场按指定左右列排序，不受接口顺序影响', () => {
  const page = componentModule.exports.default.setup({}, { expose() {} });
  page.globalMarkets.value = ['us.INX', 'N225', 'hkHSTECH', 'KS11', 'us.IXIC', 'hkHSI']
    .map(code => ({ code, name: code, price: null, change: null }));
  assert.deepEqual(page.globalGroups.value.map(group => group.items.map(item => item.code)), [
    ['KS11', 'hkHSI', 'hkHSTECH'], ['N225', 'us.IXIC', 'us.INX'],
  ]);
  page.globalMarkets.value = [];
  assert.ok(page.globalGroups.value.every(group => group.items.length === 0));
});

test('左侧仅净流入、右侧仅净流出，分别按金额强度排序并去重', () => {
  const page = componentModule.exports.default.setup({}, { expose() {} });
  page.funds.value = { hangyeFundsTop: JSON.stringify({
    in: [{ name: '甲', funds: 3 }, { name: '乙', funds: -2 }, { name: '零', funds: 0 }],
    out: [{ name: '丙', funds: -8 }, { name: '甲', funds: 3 }, { name: '缺失' }],
  }) };
  assert.deepEqual(page.capitalGroups.value.map(group => ({ label: group.label, items: group.items })), [
    { label: '净流入', items: [{ name: '甲', value: 3 }] },
    { label: '净流出', items: [{ name: '丙', value: -8 }, { name: '乙', value: -2 }] },
  ]);
  page.funds.value = undefined;
  assert.ok(page.capitalGroups.value.every(group => group.items.length === 0));
});

test('题材按涨幅降序左列第1至10名、右列第11至20名，并保留涨停家数', () => {
  const page = componentModule.exports.default.setup({}, { expose() {} });
  page.market.value = { gainianRiseFloat: JSON.stringify(Array.from({ length: 22 }, (_, index) => ({
    name: '题材' + index, quoteChange: index, limitUpCount: index + 1,
  }))) };
  const groups = page.sectorGroups.value;
  assert.deepEqual(groups.map(group => group.items.length), [10, 10]);
  assert.equal(groups[0].items[0].name, '题材21');
  assert.equal(groups[0].items[0].limitUpCount, 22);
  assert.equal(groups[0].items[9].name, '题材12');
  assert.equal(groups[1].items[0].name, '题材11');
  assert.equal(groups[1].items[9].name, '题材2');
  page.market.value = undefined;
  assert.ok(page.sectorGroups.value.every(group => group.items.length === 0));
});

test('成交额排行左列第1至5名、右列第6至10名，不重复或丢失条目', () => {
  const page = componentModule.exports.default.setup({}, { expose() {} });
  page.topStocks.value = Array.from({ length: 10 }, (_, index) => ({ code: String(index + 1) }));
  assert.deepEqual(page.turnoverGroups.value.map(group => group.items.map(stock => stock.code)), [
    ['1', '2', '3', '4', '5'], ['6', '7', '8', '9', '10'],
  ]);
  page.topStocks.value = [];
  assert.ok(page.turnoverGroups.value.every(group => group.items.length === 0));
});
