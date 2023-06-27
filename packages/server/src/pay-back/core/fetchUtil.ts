import { createV } from './hexin-v.js';
import fetch from 'node-fetch';
import { getIwencaiData } from '../utils/commonUtil';

export async function fetchIwencaiApi(question, pageSize = 5, isPlate = true) {
  const body = {
    "source": "Ths_iwencai_Xuangu",
    "version": "2.0",
    "question": question,
    "perpage": pageSize,
    "page": 1,
    "secondary_intent": isPlate ? 'zhishu' : "stock",
  }

  let result = await fetch("https://www.iwencai.com/customized/chart/get-robot-data", {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "zh-CN,zh;q=0.9",
      "cache-control": "no-cache",
      "content-type": "application/json",
      "hexin-v": createV(),
      "pragma": "no-cache"
    },
    "body": JSON.stringify(body),
    "method": "POST",
  });

  result = await result.json();

  return getIwencaiData(result);
}