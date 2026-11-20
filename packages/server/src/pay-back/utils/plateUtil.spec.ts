import { fetchIwencai } from '../core/fetchUtil';
import plateUtil from './plateUtil';

jest.mock('../core/fetchUtil', () => ({ fetchIwencai: jest.fn() }));

const date = '20261120';
const row = (name: string, code: string, num: number, turnover: number) => ({
  指数简称: name,
  code,
  [`指数@涨停家数[${date}]`]: num,
  [`指数@成交额[${date}]`]: turnover,
});
const response = (datas: unknown[], rowCount = datas.length) => ({
  data: {
    answer: [{ txt: [{ content: { components: [{ data: { datas, meta: { extra: { row_count: rowCount } } } }] } }] }],
  },
});

it('两张榜单在截取前按涨停家数、成交额和代码排序，并过滤通用概念', async () => {
  const rows = [
    row('融资融券', '99', 20, 90),
    row('板块一', '01', 8, 10),
    row('板块二', '02', 7, 10),
    row('板块三', '03', 6, 10),
    row('板块四', '04', 5, 10),
    row('板块六', '06', 5, 30),
    row('板块五', '05', 5, 30),
  ];
  jest.mocked(fetchIwencai).mockImplementation(async question => {
    const candidates = question.includes('概念板块') ? rows : rows.filter(item => item.code !== '99');
    return response(candidates);
  });

  const first = await plateUtil.getPlateData(date);
  rows.reverse();
  const second = await plateUtil.getPlateData(date);
  expect(JSON.parse(first.gainianDailyLimitData).map(item => item.code)).toEqual(['01', '02', '03', '05', '06']);
  expect(first.hangyeDailyLimitData).toEqual(first.gainianDailyLimitData);
  expect(second.gainianDailyLimitData).toEqual(first.gainianDailyLimitData);
  expect(second.hangyeDailyLimitData).toEqual(first.hangyeDailyLimitData);
  expect(first.gainianDailyLimitNum).toBe(8);
  expect(first.hangyeDailyLimitNum).toBe(8);
  expect(JSON.parse(first.gainianDailyLimitData)[0].quoteChange).toBeNull();
});

it('拒绝缺少目标日期涨停家数字段的板块数据', async () => {
  jest.mocked(fetchIwencai).mockResolvedValue(response([row('旧板块', '01', 8, 10)]));
  await expect(plateUtil.getPlateData('20261119')).rejects.toThrow(/20261119/);
});

it('首屏末位与第五名并列时拒绝写入不完整榜单', async () => {
  const rows = Array.from({ length: 6 }, (_, index) => row('板块', String(index), 3, 10));
  jest.mocked(fetchIwencai).mockResolvedValue(response(rows, 8));
  await expect(plateUtil.getPlateData(date)).rejects.toThrow(/候选范围不足/);
});

it('复查偶发的空结果和缺失涨跌幅，保留完整响应', async () => {
  const attempts = new Map<string, number>();
  jest.mocked(fetchIwencai).mockImplementation(async question => {
    const attempt = (attempts.get(question) ?? 0) + 1;
    attempts.set(question, attempt);
    if (attempt === 1) return response([]);
    const item = row('板块', '01', 5, 10);
    return response([attempt === 2 ? item : { ...item, [`指数@涨跌幅:前复权[${date}]`]: 0 }]);
  });
  const result = await plateUtil.getPlateData(date);
  expect(JSON.parse(result.gainianDailyLimitData)[0]).toMatchObject({ num: 5, quoteChange: 0 });
  expect(JSON.parse(result.hangyeDailyLimitData)[0]).toMatchObject({ num: 5, quoteChange: 0 });
});
