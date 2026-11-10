interface PoolStock {
  code: string;
  name: string;
  is_again_limit?: number;
}
interface BoardGroup {
  height: number;
  code_list: { code: string }[];
}
interface BlockStock {
  code: string;
  reason_type?: string;
  first_limit_up_time?: string;
}
interface Block {
  name: string;
  stock_list?: BlockStock[];
}

// 涨停池是总数的依据，题材数据仅补充个股信息，不能用题材样本推算全市场数据。
export function buildLiveShortTerm(
  stocks: PoolStock[],
  boards: BoardGroup[],
  blocks: Block[],
  counts?: { limitUp?: { rate?: number | null }; limitDown?: { num?: number | null } },
) {
  const levels = new Map<string, number>();
  boards.forEach(group => {
    if (Number(group.height) > 1 && Array.isArray(group.code_list)) {
      group.code_list.forEach(stock => levels.set(stock.code, Number(group.height)));
    }
  });
  const details = new Map<string, BlockStock & { blockName: string }>();
  blocks.forEach(block => (block.stock_list || []).forEach(stock => {
    if (!details.has(stock.code)) details.set(stock.code, { ...stock, blockName: block.name });
  }));
  const evenBoardData: Record<string, unknown> = {};
  stocks.forEach(stock => {
    const level = levels.get(stock.code) || 1;
    const detail = details.get(stock.code);
    const timestamp = Number(detail?.first_limit_up_time);
    const dailyTime = timestamp > 0 ? new Date(timestamp * 1000).toLocaleTimeString('zh-CN', {
      timeZone: 'Asia/Shanghai', hour12: false,
    }) : undefined;
    const group = (evenBoardData[level] ||= []) as unknown[];
    group.push({ code: stock.code, name: stock.name, plateLevel2: detail?.blockName, reason: detail?.reason_type, dailyTime });
  });
  const heights = stocks.map(stock => levels.get(stock.code) || 1);
  return {
    dailyLimitQuantity: stocks.length,
    downLimitQuantity: counts?.limitDown?.num ?? null,
    sealingRate: counts?.limitUp?.rate == null ? null : counts.limitUp.rate * 100,
    dailyLimitReturnSealQuantity: stocks.filter(stock => Number(stock.is_again_limit) === 1).length,
    evenBoardAmount: heights.filter(height => height > 1).length,
    marketHeight: heights.length ? Math.max(...heights) : null,
    evenBoardData: JSON.stringify(evenBoardData),
    createTime: new Date(),
  };
}
