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
