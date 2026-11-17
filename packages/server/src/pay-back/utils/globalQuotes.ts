// 只解析已验证的行情代码，缺失字段保留为空，避免把空值显示为零。
export function parseGlobalQuotes(text: string) {
  const names = { hkHSI: '恒生指数', hkHSTECH: '恒生科技', 'us.INX': '标普 500', 'us.IXIC': '纳斯达克' };
  return Object.entries(names).map(([code, name]) => {
    const line = text.split(';').find(item => item.trim().startsWith(`v_${code}=`));
    const fields = line?.split('"')[1]?.split('~');
    const price = fields?.[3];
    const change = fields?.[32];
    return {
      code, name,
      price: price && Number.isFinite(Number(price)) ? Number(price) : null,
      change: change && Number.isFinite(Number(change)) ? Number(change) : null,
      quoteTime: fields?.[30] || null,
    };
  });
}

// 日韩指数由东方财富补充，Unix 时间统一显示为交易所当地时间（两地均为 UTC+9）。
export function parseAsiaQuotes(rows: { f12?: string; f2?: unknown; f3?: unknown; f124?: unknown }[]) {
  const names = { KS11: '韩国 KOSPI', N225: '日经 225' };
  return Object.entries(names).map(([code, name]) => {
    const row = rows.find(item => item.f12 === code);
    const stamp = row?.f124;
    return {
      code, name,
      price: typeof row?.f2 === 'number' && Number.isFinite(row.f2) ? row.f2 : null,
      change: typeof row?.f3 === 'number' && Number.isFinite(row.f3) ? row.f3 : null,
      quoteTime: typeof stamp === 'number' && Number.isFinite(stamp) && stamp > 0 && Number.isFinite(new Date(stamp * 1000).getTime())
        ? new Date(stamp * 1000).toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' }).replace(/-/g, '/') : null,
    };
  });
}
