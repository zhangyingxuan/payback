// 休市区间取自交易所公告，首尾日期均包含；调休周末仍由周末规则处理。
export const calendar2026 = {
  year: 2026,
  sourceUrl: 'https://www.sse.com.cn/disclosure/announcement/general/c/c_20251222_10802507.shtml',
  verifiedAt: '2026-11-12',
  closures: [
    { name: '元旦', startDate: '2026-01-01', endDate: '2026-01-03' },
    { name: '春节', startDate: '2026-02-15', endDate: '2026-02-23' },
    { name: '清明节', startDate: '2026-04-04', endDate: '2026-04-06' },
    { name: '劳动节', startDate: '2026-05-01', endDate: '2026-05-05' },
    { name: '端午节', startDate: '2026-06-19', endDate: '2026-06-21' },
    { name: '中秋节', startDate: '2026-09-25', endDate: '2026-09-27' },
    { name: '国庆节', startDate: '2026-10-01', endDate: '2026-10-07' },
  ],
} as const;
