/*!
 * index.js v0.0.1
 * (c) 2018-2023 blowsysun
 * Released under the MIT License.
 */
var t={getCurrentCycle:function(t){const a=["启动","发酵","高潮","退潮","冰点"],e=t.evenBoardData.maxHeight;return e<=4?t.downLimitQuantity>10?a[4]:4===e?a[0]:a[3]:e>=5?t.evenBoardAmount>=10||t.dailyLimitQuantity>=45?a[2]:a[1]:a[0]}},a="./utils";export{a as default,t as utils};
