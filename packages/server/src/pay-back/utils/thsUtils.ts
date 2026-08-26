import { ThsOprate } from '../core/fetchUtil';

// 投资日历 http://stock.10jqka.com.cn/fincalendar.shtml
// 交易提醒 http://stock.10jqka.com.cn/jyts_list/
// 四大证券 文章精华 http://stock.10jqka.com.cn/bktt_list/
export function atob(a) {
  return Buffer.from(a, 'base64').toString('binary');
}

export function dealResultIsLogin(result, userServiceCtx, account) {
  if (result.errorMsg === '当前用户未登录') {
    console.log('[updateThsSelfStock] 当前用户未登录：https://www.iwencai.com/unifiedwap/result');
    userServiceCtx.clearUserInfoCache && userServiceCtx.clearUserInfoCache(account);
    return false;
  }

  return true;
}
export function dealStockResult(result, userServiceCtx, account) {
  let msg = '';
  if (result.errorCode !== 0) {
    if (result.errorMsg === '当前用户未登录') {
      console.log('[updateThsSelfStock] 当前用户未登录：https://www.iwencai.com/unifiedwap/result');
      userServiceCtx.clearUserInfoCache && userServiceCtx.clearUserInfoCache(account);
    }
    msg = result.errorMsg;
  }

  return msg;
}

export function dealPlateResult(result, type = ThsOprate.add, userServiceCtx, account) {
  let msg = '';
  if (result.status_code !== 0) {
    if (result.status_msg === '用户ID缺失') {
      console.log('[updateThsSelfStock] 当前用户未登录：https://www.iwencai.com/unifiedwap/result');
      userServiceCtx.clearUserInfoCache && userServiceCtx.clearUserInfoCache(account);
    }
    msg = result.status_msg;
  } else {
    const resultData = result.result;
    if (type === ThsOprate.add) {
      // 判断是删除还是添加
      resultData.existNum !== 0 && (msg = '已存在该自选');
    } else {
      // 判断是删除还是添加
      resultData.removeNum === 0 && (msg = '未找到该自选');
    }
  }

  return msg;
}
// 删除自选的正常返回
// {
//   "status_code": 0,
//     "status_msg": "OK",
//       "cost_time": 17,
//         "result": {
//     "outFlag": false,
//       "removeNum": 1,
//         "nonExistNum": 0
//   },
//   "debug_info": null
// }
// 正常返回
// {
//   "status_code": 0,
//     "status_msg": "OK",
//       "cost_time": 16,
//         "result": {
//     "addedNum": 1,
//       "existNum": 0,
//         "totalNum": 1,
//           "outFlag": false
//   },
//   "debug_info": null
// }
// 异常返回
// {
//   "status_code": -1,
//     "status_msg": "用户ID缺失",
//       "cost_time": 0,
//         "result": null,
//           "debug_info": null
// }
