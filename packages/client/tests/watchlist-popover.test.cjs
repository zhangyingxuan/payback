const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const readSource = (file) => fs.readFileSync(path.join(__dirname, '../src', file), 'utf8');
const home = readSource('views/home.vue');
const popover = readSource('components/stockPopover.vue');

test('切换悬浮目标后使用当前个股或板块的自选接口', async () => {
  const data = {};
  const calls = [];
  const apiNames = ['addThsSelfStock', 'delThsSelfStock', 'addThsSelfPlate',
    'delThsSelfPlate', 'addThsSelfPlateByNameCn', 'delThsSelfPlateByNameCn'];
  // 执行布局和浮层中的实际处理函数，覆盖个股与板块来回切换。
  const hoverHandlers = home.slice(home.indexOf('const showPoper ='), home.indexOf('const showTooltip ='))
    .replaceAll(': any', '');
  const { showPoper, showPlatePoper } = new Function('data',
    hoverHandlers + 'return { showPoper, showPlatePoper };')(data);
  const actionHandlers = popover.slice(popover.indexOf('async function handleAdd'), popover.indexOf('</script>'))
    .replace(': boolean', '');
  const { handleAdd, handleDel } = new Function('superData', 'ElMessage', ...apiNames,
    actionHandlers + 'return { handleAdd, handleDel };')(
    { get virtualRefData() { return data.popoverVirtualRefData; } },
    () => {},
    ...apiNames.map((name) => (payload) => { calls.push([name, payload.code ?? payload.plateNameCn]); }),
  );

  showPoper({}, { code: '000001' });
  await handleAdd();
  showPlatePoper({}, { code: '885123.TI', name: '概念板块' });
  await handleAdd();
  showPlatePoper({}, { name: '行业板块' });
  await handleAdd();
  await handleDel();
  showPoper({}, { code: '600000' });
  await handleAdd();

  assert.deepEqual(calls, [
    ['addThsSelfStock', '000001'],
    ['addThsSelfPlate', '885123'],
    ['addThsSelfPlateByNameCn', '行业板块'],
    ['delThsSelfPlateByNameCn', '行业板块'],
    ['addThsSelfStock', '600000'],
  ]);
});
