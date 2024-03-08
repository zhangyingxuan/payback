/**
 * 获取板块 个股 开票预期情况（超预期 / 符合预期 / 不及预期）
 */
function getPlateExpectCondition(stocks: Array<any>) {
  let exceededNum = 0,
    conformToNum = 0,
    incompatibleNum = 0;
  stocks &&
    stocks.forEach((stock: any) => {
      const biddingData = stock.biddingData;
      // // 符合预期
      // conformTo = 1,
      // // 超预期
      // exceed = 2,
      // // 不及预期
      // incompatible = 0,
      if (biddingData && biddingData.expected == 1) {
        conformToNum++;
      } else if (biddingData && biddingData.expected == 2) {
        exceededNum++;
      } else {
        incompatibleNum++;
      }
    });
  return { incompatibleNum, conformToNum, exceededNum };
}

/**
 * 计算板块 不及预期率
 * @param stocks 
 * @returns 
 */
export function calcIncompatibleRate(stocks: Array<any>, showBidding: boolean) {
  if (!showBidding) {
    return {};
  }
  const { incompatibleNum, conformToNum, exceededNum } =
    getPlateExpectCondition(stocks);
  // 没有不及预期，则不是 紫色 就是 红色
  const rate = +(
    incompatibleNum /
    (incompatibleNum + conformToNum + exceededNum)
  ).toFixed(2);
  return {
    incompatibleNum,
    conformToNum,
    exceededNum,
    rate,
  };
}