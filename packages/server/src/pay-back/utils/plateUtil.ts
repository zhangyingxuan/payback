import { CreatePlateDataDto } from '../dto/create-plate-data.dto';
import { fetchIwencai } from '../core/fetchUtil';
import { params } from '../core/config';
import commonUtil from './commonUtil';

function readNumber(value: unknown): number {
  return typeof value === 'number' || (typeof value === 'string' && value.trim()) ? Number(value) : NaN;
}

function parsePlateTop(response, dateStr: string, isConcept: boolean) {
  const content = response?.data?.answer?.[0]?.txt?.[0]?.content;
  if (content === '没有找到符合条件的结果！') return [];
  const table = content?.components?.[0]?.data;
  const rows = table?.datas;
  const total = table?.meta?.extra?.row_count;
  if (!Array.isArray(rows) || !Number.isInteger(total) || total < rows.length || (!rows.length && total > 0)) {
    throw new Error(`问财板块榜单响应异常（${dateStr}）`);
  }

  // 校验目标日期字段，避免把错日期或缺字段的响应写成零涨停。
  const candidates = rows.map(row => {
    const name = row?.['指数简称'];
    const code = row?.code;
    const num = readNumber(row?.[`指数@涨停家数[${dateStr}]`]);
    const turnover = readNumber(row?.[`指数@成交额[${dateStr}]`]);
    const quoteChange = readNumber(row?.[`指数@涨跌幅:前复权[${dateStr}]`]);
    if (
      typeof name !== 'string' ||
      !name ||
      typeof code !== 'string' ||
      !code ||
      !Number.isInteger(num) ||
      num < 1 ||
      !Number.isFinite(turnover) ||
      turnover < 0
    ) {
      throw new Error(`问财板块榜单缺少有效的 ${dateStr} 数据`);
    }
    return { name, code, num, turnover, quoteChange };
  });
  const top = candidates
    .filter(({ name }) => !isConcept || !commonUtil.ignoreGainianPlates.some(keyword => name.includes(keyword)))
    .sort((a, b) => b.num - a.num || b.turnover - a.turnover || a.code.localeCompare(b.code))
    .slice(0, 5);

  // shortcut: 只读取首屏，若首屏末位家数达到第五名则拒绝更新，出现该情况时接入板块分页。
  if (
    total > candidates.length &&
    (top.length < 5 ||
      candidates.some(({ num }, index) => index > 0 && num > candidates[index - 1].num) ||
      candidates[candidates.length - 1].num >= top[4].num)
  ) {
    throw new Error(`问财板块榜单候选范围不足（${dateStr}）`);
  }

  return top.map(({ turnover, quoteChange, ...plate }) => ({
    ...plate,
    turnover: commonUtil.fundsToFixed(String(turnover)),
    quoteChange: Number.isFinite(quoteChange) ? commonUtil.toFixed(String(quoteChange)) : null,
  }));
}

async function getPlateTop(question: string, dateStr: string, isConcept = false) {
  let best: ReturnType<typeof parsePlateTop> | undefined;
  let lastError: Error;
  // 问财偶尔返回空结果或遗漏涨跌幅，复查后优先采用非空、字段更完整的榜单。
  for (let attempt = 0; attempt < 3; attempt++) {
    // 扩大候选范围，才能处理第五名的并列板块。
    const response = await fetchIwencai(question, 100, true);
    try {
      const top = parsePlateTop(response, dateStr, isConcept);
      if (top.length && top.every(plate => plate.quoteChange !== null)) return top;
      if (
        !best ||
        top.length > best.length ||
        (top.length === best.length &&
          top.filter(plate => plate.quoteChange !== null).length >
            best.filter(plate => plate.quoteChange !== null).length)
      ) {
        best = top;
      }
    } catch (error) {
      lastError = error;
    }
  }
  if (best?.length || (best && !lastError)) return best;
  throw lastError;
}

export default {
  /**
   * 获取 板块数据
   */
  async getPlateData(dateStr): Promise<CreatePlateDataDto> {
    const createPlateDataDto: CreatePlateDataDto = new CreatePlateDataDto();

    const [gainianDailyLimitDataTop, hangyeDailyLimitDataTop] = await Promise.all([
      getPlateTop(params.gainianPlateOrderByDailyLimitNum, dateStr, true),
      getPlateTop(params.hangyePlateOrderByDailyLimitNum, dateStr),
    ]);
    createPlateDataDto.gainianDailyLimitData = JSON.stringify(gainianDailyLimitDataTop);
    createPlateDataDto.gainianDailyLimitNum =
      gainianDailyLimitDataTop && gainianDailyLimitDataTop[0] ? gainianDailyLimitDataTop[0].num : 0;
    createPlateDataDto.hangyeDailyLimitData = JSON.stringify(hangyeDailyLimitDataTop);
    createPlateDataDto.hangyeDailyLimitNum =
      hangyeDailyLimitDataTop && hangyeDailyLimitDataTop[0] ? hangyeDailyLimitDataTop[0].num : 0;
    createPlateDataDto.createTime = new Date();
    return createPlateDataDto;
  },
};
