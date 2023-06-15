
export function toFixed(num, floatLen = 2) {
  if (!num) return;
  return +(num).toFixed(floatLen)
}

export function fundsToFixed(num, floatLen = 2) {
  if (!num) return;
  return +(num / 100000000).toFixed(floatLen)
}

export default {
  /**
   * 取出 爱问财 返回的有效数据
   * @param responseJson 
   * @returns 
   */
  getIwencaiData(responseJson) {
    let data = [];
    try {
      data = responseJson.data.answer[0].txt[0].content.components[0].data.datas;
    } catch (e) {
      console.log('[error log] getIwencaiData 数据结构错误！')
      // console.log('[error log] getIwencaiData 数据结构错误！' + responseJson)
    }
    return data;
  },
  toFixed,
  fundsToFixed,
}