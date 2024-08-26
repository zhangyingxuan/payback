import Aegis from 'aegis-web-sdk';
import { App } from 'vue';

export function initAegis(app: App, permiss: any) {
  if (import.meta.env.MODE === 'development') {
    return;
  }
  // 获取当前用户名，如果没有则不上传
  const aegis = new Aegis({
    id: 'p0vobckgDZ10ebknPP', // 上报 id
    uin: permiss.account || 'Visitors', // 用户唯一 ID（可选）
    reportApiSpeed: true, // 接口测速
    reportAssetSpeed: true, // 静态资源测速
    spa: true, // spa 应用页面跳转的时候开启 pv 计算
    hostUrl: 'https://rumt-zh.com'
    // 测速不抽样，api监控数据的来源，关闭之后才能跟日志数据一致
    // speedSample: false,
    // 上报接口错误详情
    // api: {
    //   apiDetail: true,
    // },
  });
  // vue错误上报
  app.config.errorHandler = function (err: any, vm: any, info: any) {
    console.log(`Error: ${err.toString()}\nInfo: ${info}`);
    aegis.error(`Error: ${err.toString()}\nInfo: ${info}`);
  };
  // 注入全局变量
  app.config.globalProperties['$aegis'] = aegis;
}