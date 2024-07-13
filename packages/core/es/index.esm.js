/*!
 * index.js v0.0.15
 * (c) 2018-2024 blowsysun
 * Released under the MIT License.
 */
import dayjs from 'dayjs';

const config = {
    // 启动连板高度 要求
    startUpHeight: 4,
    // 连板数量
    evenBoardNum: 10,
    dailyLimitNum: 45,
    downLimitNum: 10,
};
/**
 * 需要参考昨日数据 结合两天数据比较 高度变化
 * 高度下降(退潮、冰点)、高度上升（启动、发酵、高潮）
 * @param currentTradingDayData
 * @returns  调整策略 风险 > 机会 2024-04-07 18:18:08
 */
function getCurrentCycle(currentTradingDayData, lastTradingDayData) {
    // 1、启动；犹豫中复苏，亏钱效应结束后，开始出现4板，连板小于10，不会出现15%以上大面；做首板
    // 2、发酵；带动板块，赚钱效应启动，并出现涨停潮（情绪发酵期是龙头股选手大展身手、上仓位的最关键阶段），连板股数量>=10；没有天地板、炸板大面票，昨日断板票今天会有修复，大长腿也经常出现
    // 3、高潮 板块出现批量涨停潮，涨停数>=45；连板股数量&gt;=15；（梯队整齐）几乎没有高位炸板、炸板大面、昨日涨停今天跌停、昨日涨停今天闷杀，无-&gt;10%短线大面股
    // 4、衰退：总龙头见顶，高位连板股出现亏钱效应，炸板大面票、昨日涨停今天跌停、昨日涨停今天闷杀的票批量出现，尤其高位炸板股增多，极端的出现天地板等大面
    // 5、冰点：竞价低开，瀑布大面，总龙头继续杀跌，无赚钱效应。连板高度受压制 3/4板高度。虽然还是会有个股走出连板，但连板数量相对于前面的阶段骤然降低，跌停家数比较高，龙头杀跌（回撤20-30%），一些补涨股继续杀跌。打的好板，次日根本没有溢价就直接开始杀跌，短线情绪走到冰点。有的题材周期，情绪冰点后，还有二冰、三冰
    // 6、混沌
    // 周期定义
    const cycles = ['启动', '发酵', '高潮', '退潮', '冰点', '混沌'];
    // 最大高度 currentTradingDayData.evenBoardData
    const maxHeightCurrent = currentTradingDayData.marketHeight;
    // 昨日高度
    const maxHeightLast = lastTradingDayData.marketHeight;
    // 用赚钱效应、亏钱效应判断 还是 高度？高度资金可以硬怼出来
    // 跌幅大于15的个股
    const hugeFallNum = currentTradingDayData.hugeFallData ? currentTradingDayData.hugeFallData.length : 0;
    if (!lastTradingDayData) {
        return compatible(currentTradingDayData, cycles, maxHeightCurrent, hugeFallNum);
    }
    // A. 主升 【赚钱效应打开】高度增加，无负反馈 大面，情绪转好
    if (maxHeightCurrent >= config.startUpHeight
        && maxHeightCurrent > maxHeightLast
        && hugeFallNum == 0) {
        // 1. 启动 (开始出现4板，连板小于10，不会出现15%以上大面；)
        if (maxHeightCurrent == config.startUpHeight) {
            return cycles[0];
        }
        // 比昨天连板数量多
        if (currentTradingDayData.evenBoardAmount >= lastTradingDayData.evenBoardAmount) {
            // 3. 高潮（前提，不能有连板负反馈）
            if (currentTradingDayData.evenBoardAmount >= config.evenBoardNum
                && currentTradingDayData.dailyLimitQuantity >= config.dailyLimitNum) {
                return cycles[2];
            }
            // 2. 发酵
            return cycles[1];
        }
        // 4. 连板数量不足，甚至降低，退潮
        return cycles[3];
    }
    // B. 主跌 【亏钱效应出现】龙头倒下/高度降低，负反馈出现，天地板、大面，高位持续A杀，接力情绪差
    if (maxHeightCurrent <= maxHeightLast) {
        // 高度下降(退潮、冰点)
        if (currentTradingDayData.downLimitQuantity > config.downLimitNum
            && hugeFallNum > 0) {
            return cycles[4];
        }
        // 退潮
        return cycles[3];
    }
    // C. 震荡 龙头横盘，等待新周期 或 次高穿越龙
    return cycles[5];
}
function compatible(currentTradingDayData, cycles, maxHeightCurrent, hugeFallNum) {
    // 高度低于5板
    if (maxHeightCurrent <= config.startUpHeight) {
        if (currentTradingDayData.downLimitQuantity > 10) {
            return cycles[4];
        }
        // 今天的最高板没有昨天高，昨天是高潮
        if (maxHeightCurrent === config.startUpHeight && hugeFallNum == 0) {
            return cycles[0];
        }
        return cycles[3];
    }
    // 高潮前提，不能有连板负反馈
    if (currentTradingDayData.evenBoardAmount >= config.evenBoardNum
        && currentTradingDayData.dailyLimitQuantity >= config.dailyLimitNum
        && hugeFallNum == 0) {
        return cycles[2];
    }
    return cycles[1];
}
const dailyLimitOptionalStrategyStr = '流通市值大于等于20亿，小于等于120亿，主板个股，股价低于30';
/**
 * 涨停自选策略
 * 连板全部加入
 * 策略备注：参考 dailyLimitOptionalStrategyStr
 */
function dailyLimitOptionalStrategy(stock, currentLevel) {
    // 创业板、科创板 30*、68*、83* 不自选
    if (!isMainPlate(stock.code))
        return false;
    // 连板全部加入
    if (currentLevel != 1)
        return true;
    return stock.price <= 30 && (stock.circulationValue >= 20 && stock.circulationValue <= 120);
}
// 星火集合竞价成交量放大到和首板涨停爆量相同最佳，如果放大到2/3也可以，最差也要放量到一半，如果缩量就没有参与价值。
const currentDate = '2018-08-08'; // dayjs().format('YYYY-MM-DD');
// 9.31
const date931 = dayjs(currentDate + ' 09:31:00');
// 10:01
const date1000 = dayjs(currentDate + ' 10:00:00');
// 13:00
const date1300 = dayjs(currentDate + ' 13:00:00');
const date1400 = dayjs(currentDate + ' 14:00:00');
const expectedArr = ['5', '4', '3', '0,2', '-2,2', '-2'];
/**
 * 根据开板次数，最终涨停时间 给出次日开盘预期
 * @param stock {openTimes: string, dailyTime: string, }
 * @returns
 */
function getExpected(stock) {
    let currentTime = stock.openTimes ? stock.dailyTime.split(',')[1] : stock.dailyTime;
    // console.log(stock.name, stock.openTimes, stock.dailyTime, currentTime);
    currentTime = dayjs(currentDate + ' ' + currentTime);
    // 文心一言
    // 1、昨日一字板或开盘秒板的。第二天正常预期高开5%以上。
    // 2、昨日10点前涨停的，第二天正常预期高开4%左右。
    // 3、昨日11点半前涨停的，第二天正常预期高开3%左右。
    // 4、昨日午后13-14涨停的，第二天预期微高开（0—2%）
    // 5、昨日午后14之后涨停的，第二天预期平开（-2%—2%）
    // 6、昨日烂板（开板5次），第二天预计低开（0--2%）
    if (stock.openTimes >= 5) {
        // 最终封板时间，在早盘则按正常预期，否则低开
        if (currentTime.isBefore(date1300)) {
            return expectedArr[2];
        }
        return expectedArr[5];
    }
    if (currentTime.isBefore(date931)) {
        return expectedArr[0];
    }
    if (currentTime.isBefore(date1000)) {
        return expectedArr[1];
    }
    if (currentTime.isBefore(date1300)) {
        return expectedArr[2];
    }
    if (currentTime.isBefore(date1400) && currentTime.isAfter(date1300)) {
        return expectedArr[3];
    }
    return expectedArr[4];
}
/**
 * 是否 主板个股
 * @param stockCode  个股代码
 * @param increaseDecline  涨跌幅
 */
function isMainPlate(stockCode) {
    if (stockCode.startsWith('68') ||
        stockCode.startsWith('30') || stockCode.startsWith('4') ||
        stockCode.startsWith('8')) {
        return false;
    }
    return true;
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * 顺序执行异步任务队列（适用于批量生成的异步任务，比如：批量执行接口调用，避免高并发）
 * 1、创建AsynTaskIterator类
 * let app = new AsynTaskIterator();
 * 2、加入待执行异步任务
 * app.add(task1/2/3）
 * 注意：异步任务中需手动加入 next();方法以提示任务队列接着往下走
 * 3、执行任务队列，传入当前执行上下文
 * app.run(this);
 */
class AsynTaskIterator {
    constructor() {
        this.middlewares = [];
    }
    add(fn) {
        this.middlewares.push(fn); //存入任务
        return this;
    }
    run(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            function createNext(middleware, oldNext) {
                return () => __awaiter(this, void 0, void 0, function* () {
                    yield middleware(ctx, oldNext);
                });
            }
            let len = this.middlewares.length;
            let next = () => __awaiter(this, void 0, void 0, function* () {
                return Promise.resolve();
            });
            for (let i = len - 1; i >= 0; i--) {
                let currentMiddleware = this.middlewares[i];
                next = createNext(currentMiddleware, next);
            }
            yield next();
        });
    }
}
// 顺序执行函数
// 使用方法
// 1、创建一个数组，存放任务
// const funcs = [];
// 2、将异步任务（promise）存入数组中
// funcs.push(task1/2/3);
// 3、执行函数
// this.nextRegister(funcs);
function nextRegister(args) {
    var count = 0;
    var comm = {};
    function nextTime() {
        count++;
        if (count < args.length) {
            if (args[count] && Object.prototype.toString.call(args[count]) == '[object AsyncFunction]') {
                args[count](comm, nextTime);
            }
        }
    }
    if (args[count] && Object.prototype.toString.call(args[count]) == '[object AsyncFunction]') {
        args[count](comm, nextTime);
    }
}

// @ts-nocheck
const TOKEN_SERVER_TIME = '1667085000.423';
const document = {};
const window = {};
const second = [
    1,
    '',
    0,
    'he',
    'ad',
    29,
    '\x180G\x1f',
    '?>=<;:\\\\/,+',
    'ng',
    'to',
    'ff',
    Number,
    Error,
    '11',
    '6',
    'er',
    'ro',
    'code',
    'co',
    '_?L',
    'ed',
    '@S\x15D*',
    Object,
    'len',
    'gth',
    'on',
    'lo',
    RegExp,
    'ySta',
    13,
    'eel',
    'ee',
    'ouse',
    'll',
    '\u2544\u2530\u2555\u2531',
    'FCm-',
    'isTru',
    'getC',
    'Pos',
    've',
    'or',
    'ae',
    '^',
    'On',
    'Sho',
    'can',
    'ont',
    'roid',
    'anguage',
    '\u2502',
    'ta',
    'tna',
    Date,
    '3',
    'am',
    'e',
    'n+',
    'f80',
    '\x1dD',
    6,
    '\u255f\u253a\u2542\u252b\u2545\u2568\u251e',
    'KCABLLAC_NOELEMAHC',
    'X-Antispider-Message',
    3,
    '.baidu.',
    Function,
    document,
    !0,
    'cookie',
    '; ',
    '=',
    96,
    '\u255b\u253e\u2550\u2537\u2543\u252b',
    '\u250c\u252c\u255c\u253d\u2549\u2521\u251c',
    ';O',
    '; expires=',
    'getCookie',
    'Thu, 01 Jan 1970 00:00:00 GMT',
    'setCookie',
    'Z\x18|',
    'i',
    '\u255b\u2534\u2557\u2536\u255a\u2509\u257d\u2512\u2560\u2501\u2566\u2503',
    52,
    window,
    10,
    'Init',
    !1,
    'set',
    'v',
    'eliflmth',
    '<script>document.w=window</script><iframe src="/favicon.icon"></iframe>',
    'iS.p',
    'head',
    '#default#userData',
    'get',
    '[!"#$%&\'()*',
    'g',
    '^d',
    '$D',
    '\u2568\u2537\u2568\u254c\u256a',
    ']\\P',
    '___',
    'le',
    'th',
    'prototype',
    'base_f',
    8,
    '\\R5Z\\R\x14@^Q3G',
    'ZV%PgQ?Y]S%',
    67,
    'r',
    'length',
    '0',
    16,
    '12',
    '\u2576\u095f\u0979\u09d5\u0995\u091b\u09a9\u09f9\u09bd\u09f7\u0989\u09fd\u09f5\u09f3\u09f9\u0a41\u0a4d\u098f\u0999\u0905\u0975\u09cb\u09a9\u09a9\u099d\u0927\u0933\u0913\u0a6b\u0999\u09a3\u0937\u098b\u09f5\u0933\u0a7b\u091b\u09b1\u0a63\u095f\u09fb\u094d\u0993\u0943\u092b\u0949\u09a3\u09e7\u09cb\u0925\u0993\u09ab\u09f0\u092c\u092c\u0942\u0950\u09c8\u0944\u09c6\u0990\u0944\u09cb\u098e',
    'i,',
    '\u2505\u092f',
    12,
    56,
    '20',
    '1000',
    2,
    5,
    '11111111',
    'encode',
    '\u255b\u0972\u0959',
    '\u2519',
    's',
    'WY$PYS',
    'ystate',
    '1111101000',
    / /g,
    ',',
    '\u250d',
    '^".*"$',
    'edoc_sutats',
    'status_code',
    'location',
    'redirect_url',
    'href',
    '4294967295',
    'j',
    '1200000',
    'script',
    'src',
    'onreadystatechange',
    'read',
    'loaded',
    'readyState',
    'complete',
    'interactive',
    'onload',
    'undefined',
    '\\.com\\.cn$|\\.com\\.hk$',
    '.',
    'getServerTime',
    'YY7YAD?FjD"',
    'strhash',
    'random',
    'getRootDomain',
    'booleanToDecimal',
    'timeNow',
    '\u2559\u253e',
    'eventBind',
    'onwh',
    '\u255b',
    46,
    'DOMM',
    'cl',
    'T^5^',
    'div',
    'onmousewheel',
    'mousewheel',
    51,
    'keydown',
    'clientY',
    'getKeyDown',
    'ch',
    'plu',
    '\u2543\u252b',
    'ouc',
    'art',
    '^i',
    'Po',
    'callPhantom',
    'max',
    'Hei',
    'ActiveXObject',
    'nd',
    'yG&Y]\x17\x15ZUG#A]Ez\x15qY5\x1b',
    '\u2576\u097e\u094e\u09f8\u09a6\u0938\u09b6\u09fe\u0996\u09d7\u09a7\u09d2\u09cc',
    'Maxthon',
    'Q',
    'opr',
    'chrome',
    'BIDUBrowser',
    'QQBro',
    '[_$ZUR',
    'UBrowser',
    'MSGesture',
    'plugins',
    'doNotTrack',
    'ShockwaveFlash.ShockwaveFlash',
    ']C|\x18',
    'webgl2',
    'platform',
    'name',
    '^Win32',
    '^MacIntel',
    '^Linux [ix]\\d+',
    '^BlackBerry',
    'language',
    'getPlatform',
    'getBrowserIndex',
    '1',
    '10',
    4,
    9,
    '1100',
    '\t\0',
    '3c',
    256,
    'w',
    'TTP',
    'et',
    'c',
    'al',
    '\u255e',
    'base',
    '\u2569\u0975\u094e\u09e5\u09a0\u092e\u09d1\u09ed\u09ce',
    'target',
    'fh%PTQr',
    '#',
    '\u255f\u097c\u0949\u09f9',
    97,
    'rg',
    'tnemelEcrs',
    'fn_Ws',
    'parentNode',
    'tagName',
    'A',
    'submit',
    'PX%',
    'me',
    'host',
    '\\.?',
    'd\x19',
    'Fri, 01 Feb 2050 00:00:00 GMT',
    ']E%',
    'toString',
    '[object Request]',
    'headers',
    83,
    '&',
    encodeURIComponent,
    'open',
    'getAllResponseHeaders',
    '4',
    'tseuqeRpttHLMX',
    'Window',
    '\u2564\u095e',
    'RI',
    '\u2550\u0953',
    '(YaZ',
    '_',
    '_str',
    'V587',
];
const first = [
    '',
    9527,
    String,
    Boolean,
    'eh',
    'ad',
    'Bu',
    'ileds',
    '1',
    '\b',
    Array,
    '7',
    'base',
    '64De',
    '\u2543\u252b',
    'etatS',
    'pa',
    'e',
    'FromUrl',
    'getOrigi',
    'nFromUrl',
    '\u255b\u253e',
    'b?\x18q)',
    'ic',
    'k',
    'sted',
    'he',
    'wser',
    'oNo',
    'ckw',
    'ent',
    'hst',
    '^And',
    'RM',
    'systemL',
    5,
    '\u255f\u0978\u095b\u09f5',
    'TR8',
    "!'",
    'gth',
    'er',
    'TP',
    83,
    'r',
    !0,
    'v',
    'v-nixeh',
    RegExp,
    'thsi.cn',
    'K\x19"]K^xVV',
    'KXxAPD?\x1b[Y',
    document,
    0,
    'allow',
    1,
    '; ',
    'length',
    'Init',
    '=',
    '; domain=',
    'checkcookie',
    !1,
    'eikooCled',
    'tnemucod',
    'd',
    window,
    '\u2553\u0972\u0959\u09e4\u09bd\u0938\u0980\u09c5\u09b1\u09d1\u09a7\u09dc\u09dd\u09d3\u09c2',
    '\u2556\u0979\u095e\u09d3\u09b5\u0935\u098f\u09c7\u099d\u09d2\u09b0',
    23,
    'l$P$~',
    'frames',
    'ducument',
    'ydob',
    'documentElement',
    'del',
    '@[\\]^`{|}~]',
    'base_fileds',
    '255',
    10,
    '10',
    39,
    '\u2547\u2535\u255a\u252e\u2541\u2535\u254c\u253c\u2559',
    8,
    '4',
    '3',
    'de',
    3,
    '11',
    2,
    '203',
    '22',
    '111111',
    '3f',
    16,
    '\x0f',
    '\u2506\u2537\u2507\u2537',
    '11111111',
    'base64Encode',
    'v\x1d',
    'ati',
    'WY',
    'te',
    'bo',
    'rs',
    'getHost',
    Date,
    '{DF',
    ':',
    '^{.*}$',
    'WU<P[C',
    52,
    '1001',
    'href',
    '1111101010',
    'redirect_url',
    '^\\s*(?:https?:)?\\/{2,}([^\\/\\?\\#\\\\]+)',
    'i',
    '\u256c\u252c\u2516\u254b',
    '@',
    'ready',
    'change',
    'dy',
    7,
    'protocol',
    '//s.thsi.cn/js/chameleon/time.1',
    'onerror',
    '2000',
    'readyState',
    null,
    '^(\\d+\\.)+\\d+$',
    '^\\s*(?:(https?:))?\\/{2,}([^\\/\\?\\#\\\\]+)',
    '.',
    'strToBytes',
    'isIPAddr',
    'serverTimeNow',
    'addEventListener',
    'th',
    'wh',
    'Scro',
    'mousemove',
    55,
    'evomhcuot',
    '[[?PVC\x0e',
    'getMouseMove',
    '_R"xWB%Po_3YT',
    'getMouseClick',
    'ght',
    'gin',
    'msD',
    'ack',
    '\u2556\u096b\u095f',
    'Nativ',
    '^A',
    'MozSettingsEvent',
    'safari',
    'ActiveXObject',
    'postMessage',
    'Uint8Array',
    'WeakMap',
    'Google Inc.',
    'vendor',
    'chrome',
    'python',
    'sgAppName',
    'JX',
    6,
    'me',
    'LBBROWSER',
    'w4',
    '2345Explorer',
    'TheWorld',
    '\u2544',
    40,
    'tTr',
    '\u2506',
    'navigator',
    'webdriver',
    'languages',
    'taborcA|FDP',
    '\u2541\u097c\u0949',
    95,
    '1e0',
    'e Cli',
    'iso-8859-1',
    'defaultCharset',
    'localStorage',
    '^Win64',
    '^Linux armv|Android',
    '^iPhone',
    '^iPad',
    'B_{VV',
    'getPluginNum',
    'getBrowserFeature',
    '12',
    '16',
    'sE',
    '10000',
    '17',
    '\u2542\u2532\u2556\u2537\u2543\u2526',
    '\x1cx`R',
    2333,
    'XMLH',
    'ers',
    '0',
    'lo',
    57,
    'ylppa',
    'error',
    'target',
    'click',
    'unload',
    'HE9AWT9Y',
    '\\.',
    'c?',
    '$',
    '/',
    'fetch',
    'prototype',
    'url',
    '\u2556\u0971\u0956\u09fe\u09a7',
    'headers',
    '\u256b\u2554',
    79,
    '?',
    '^(.*?):[ \\t]*([^\\r\\n]*)\\r?$',
    'gm',
    's',
    'src',
    'analysisRst',
    '\u255e\u0973\u0949\u09f4\u09a2\u0929\u09ac\u09d4\u0992\u09d2\u09b0\u09d4',
    'appendChild',
    'Y',
    'jsonp_ignore',
    '^',
    70,
    '421',
    'XH>a',
    '\u2574\u253c\u257d\u2530\u2575\u2539\u257c\u2533\u257d\u2522\u256e\u2521\u2560\u2524\u2561\u2525',
    'CHAMELEON_LOADED',
];
let r, e, a;
r = e = a = first;
let u, c, s;
u = c = s = second;
function serverTimeNow() {
    return parseInt(TOKEN_SERVER_TIME);
}
function v() {
    const n = arguments[s[0]];
    if (!n)
        return r[0];
    for (var t = u[1], o = a[1], i = c[2]; i < n.length; i++) {
        const v = n.charCodeAt(i), f = v ^ o;
        (o = v), (t += e[2].fromCharCode(f));
    }
    return t;
}
function ot() {
    let n, t;
    n = t = second;
    let a, o, i;
    a = o = i = first;
    const u = arguments[a[52]];
    if (!u)
        return o[0];
    for (var s = a[0], v = n[267], f = o[200], l = t[2]; l < u.length; l++) {
        let p = u.charCodeAt(l);
        (f = (f + t[0]) % v.length), (p ^= v.charCodeAt(f)), (s += i[2].fromCharCode(p));
    }
    return s;
}
const qn = (function () {
    let n, t, r;
    n = t = r = first;
    let e, o, i;
    e = o = i = second;
    o[15]; const c = o[102], f = e[103];
    function l(r) {
        o[102]; e[103];
        this[n[76]] = r;
        for (let u = t[52], c = r['length']; u < c; u++)
            this[u] = t[52];
    }
    l.prototype.toBuffer = function () {
        for (var a = 'base_f', u = this['base_fileds'], c = [], s = -e[0], v = o[2], f = u[r[56]]; v < f; v++)
            for (let l = this[v], p = u[v], d = (s += p); (c[d] = l & parseInt(t[77], n[78])), --p != r[52];)
                --d, (l >>= parseInt(n[79], i[106]));
        return c;
    };
    l.prototype.decodeBuffer = function (n) {
        for (let r = e[8], a = this[ot(e[108], e[109])], o = t[52], u = e[2], s = a[c + r + f]; u < s; u++) {
            let v = a[u], l = i[2];
            do {
                l = (l << t[82]) + n[o++];
            } while (--v > t[52]);
            this[u] = l >>> i[2];
        }
    };
    return l;
})();
function at() {
    let n, t;
    n = t = u;
    let a, o, i;
    a = o = i = e;
    const c = arguments[o[52]];
    if (!c)
        return t[1];
    for (var s = o[0], v = o[1], f = a[52]; f < c.length; f++) {
        const l = c.charCodeAt(f), p = l ^ v;
        (v = ((v * f) % n[222]) + o[200]), (s += i[2].fromCharCode(p));
    }
    return s;
}
let zn;
!(function (n) {
    const t = s[13], o = c[53], i = r[83], f = r[84], l = s[110]; r[85]; const h = r[86];
    function g(n, a, o, i, u) {
        for (let c = s[13], v = r[87], f = n[s[111]]; a < f;)
            (o[i++] = n[a++] ^ (u & parseInt(c + v + t + '11', r[88]))), (u = ~(u * parseInt(e[89], e[82])));
    }
    function w(n) {
        for (var t = c[112], i = r[52], v = n[s[111]], f = []; i < v;) {
            const l = (n[i++] << parseInt('1' + t, c[113])) | (n[i++] << e[82]) | n[i++];
            f.push(m.charAt(l >> parseInt(e[90], e[82])), m.charAt((l >> parseInt(s[114], e[78])) & parseInt(a[91], r[88])), m.charAt((l >> u[59]) & parseInt('6' + o, a[78])), m.charAt(l & parseInt(a[92], u[113])));
        }
        return f.join(e[0]);
    }
    for (var m = at(u[115], s[116]), I = {}, y = u[2]; y < parseInt(i + '0', e[93]); y++)
        I[m.charAt(y)] = y;
    function O(n) {
        let t, r, e;
        t = r = e = s;
        let o, i, u;
        o = i = u = a;
        for (var c = ot(i[94]), l = e[2], p = n[o[56]], d = []; l < p;) {
            const h = (I[n.charAt(l++)] << parseInt(at(t[117]), u[82])) |
                (I[n.charAt(l++)] << parseInt(v(t[118], u[95], e[119]), o[88])) |
                (I[n.charAt(l++)] << t[59]) |
                I[n.charAt(l++)];
            d.push(h >> parseInt(e[120], t[106]), (h >> parseInt(t[121], r[122])) & parseInt(f + b + c, t[106]), h & parseInt(o[96], u[88]));
        }
        return d;
    }
    function D(n) {
        const t = O(n);
        if ((rn, p, t[r[52]] != h))
            return (error = T + B + l), void 0;
        const a = t[c[0]], o = [];
        return g(t, +parseInt(e[79], c[122]), o, +u[2], a), x(o) == a ? o : void 0;
    }
    function x(n) {
        for (var e = c[2], i = a[52], u = n[c[111]]; i < u; i++)
            e = (e << s[123]) - e + n[i];
        return e & parseInt(s[124], r[88]);
    }
    function N(n) {
        const r = x(n), e = [h, r];
        return (g(n, +a[52], e, +a[88], r),
            //t = "co", 出问题
            w(e));
    }
    (n['base64Encode'] = w), (n['base64Decode'] = O), (n['encode'] = N), (n['decode'] = D);
})(zn || (zn = {}));
// var Qn,Wn,N      因为cookie新浏览器一开始可以没有，所以偷懒不设置也可以
// !function(n) {
//     n[e[53]] = s[67];
//     function t(n) {
//         var t = r[51][u[68]]
//           , o = u[69] + n + s[70]
//           , i = t.indexOf(o);
//         if (i == -e[54]) {
//             if (o = n + c[70],
//             t.substr(r[52], o.length) != o)
//                 return;
//             i = a[52]
//         }
//         var f = i + o[v(u[71], s[72])]
//           , l = t.indexOf(r[55], f);
//         return l == -a[54] && (l = t[a[56]]),
//         t.substring(f, l)
//     }
//     n[a[57]] = f;
//     function o(n, t, a, o, i) {
//         var c = n + r[58] + t;
//         o && (c += e[59] + o),
//         i && (c += v(Jn, u[73], s[74]) + i),
//         a && (c += u[75] + a),
//         u[66][u[68]] = c
//     }
//     n[s[76]] = t;
//     function i(n, t, r) {
//         this.setCookie(n, u[1], u[77], t, r)
//     }
//     n[s[78]] = o;
//     function f() {
//         var t = a[60];
//         this.setCookie(t, u[67]),
//         this.getCookie(t) || (n[r[53]] = e[61]),
//         this.delCookie(t)
//     }
//     n[Wn(N, r[62], c[79])] = i
// }(Qn || (Qn = {}));
function strhash(n) {
    let a;
    a = s = second;
    let o, u;
    o = u = r = first;
    n =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36';
    for (var c = u[52], v = a[2], f = n[o[56]]; v < f; v++)
        (c = (c << a[123]) - c + n.charCodeAt(v)), (c >>>= o[52]);
    return c;
}
function getBrowserFeature() {
    return 3812;
}
function getPlatform() {
    return 7;
}
function getBrowserIndex() {
    return 10;
}
function getPluginNum() {
    return 5;
}
function timeNow() {
    let time;
    return (time = s[52].now()), (time / parseInt(c[131], a[88])) >>> c[2];
}
const En = a[8];
const An = v(a[35], s[49]);
var Vn = 0;
const Un = s[63];
const rt = {};
!(function (n) {
    let t = e[87], o = a[8], i = e[8], f = s[215], l = r[52], p = s[0], d = parseInt(c[216], u[122]), h = e[86], g = u[217], w = u[123], m = e[165], I = parseInt(t + En, c[122]), y = parseInt(a[79], a[82]), _ = c[218], C = parseInt(a[193], e[82]), E = parseInt(o + i, r[78]), A = parseInt(u[219], s[122]), b = parseInt(f + An, s[106]); parseInt(r[194], s[106]); let B = parseInt(ot(s[220], e[195]), r[82]), R = parseInt(e[196], u[122]), k = parseInt(e[197], a[78]), S;
    function P() {
        const n = s[0], t = r[88], e = parseInt(u[13], c[122]), a = s[217];
        S = new qn([a, a, a, a, n, n, n, e, t, t, t, t, t, t, t, a, t, n]);
        S[p] = serverTimeNow();
        M(), (S[B] = Vn);
        S[k] = Un;
        S[R] = c[2];
        S[h] = strhash();
        S[b] = getBrowserFeature();
        S[g] = getPlatform();
        S[w] = getBrowserIndex();
        S[m] = getPluginNum();
    }
    function M() {
        //阅读后发现可以偷懒没直接使用random返回
        S[l] = (Math.random() * parseInt(u[141], r[78])) >>> r[52];
    }
    function O() {
        S[R]++,
            (S[p] = serverTimeNow()),
            (S[d] = timeNow()),
            (S[B] = Vn),
            (S[I] = 0),
            (S[y] = 0),
            (S[_] = 0),
            (S[C] = 0),
            (S[E] = 0),
            (S[A] = 0);
        const n = S.toBuffer();
        // console.log(n);
        return zn.encode(n);
    }
    //n[e[57]] = P;
    P();
    function D() {
        return O();
    }
    n['update'] = D;
})(rt);
// result = rt.update();
// console.log(result);
function createV() {
    return rt.update();
}

const iWencaiDateFormat = 'YYYYMMDD';
const stockBaseCondition = '非st；非退市；行业';
// export const personalPreferenceCondition = '行业；股价低于30元；流通市值<=120亿；流通市值>=20亿；非创业板；非科创板；非ST';
// 2024-06-18 17:36:19 个人偏好条件 可以做创业板，尝试绩优股
const personalPreferenceCondition = '市盈率>0；股价低于50元；流通市值<=500亿；流通市值>=20亿；非科创板；非ST；非退市' + stockBaseCondition;
const params = {
    downLimit: '跌停；' + stockBaseCondition,
    downLimitByDate: '${date}跌停；' + stockBaseCondition,
    // 炸板个股；涨停未遂
    dailyLimitOpen: '涨停打开；成交额；' + stockBaseCondition,
    dailyLimitOpenByDate: '${date}涨停打开；成交额；' + stockBaseCondition,
    hugeFall: '跌幅大于等于15的个股；' + stockBaseCondition,
    hugeFallByDate: '${date}跌幅大于等于15的个股；' + stockBaseCondition,
    dailyLimitMoreThan1: '涨停；几天几板；涨停原因；涨停类型；涨停开板次数；封板金额；成交额；换手率；流通市值；' + stockBaseCondition,
    dailyLimitMoreThan1ByDate: '${date}涨停；几天几板；涨停原因；涨停类型；涨停开板次数；封板金额；成交额；换手率；流通市值；' + stockBaseCondition,
    // 竞价涨停
    binddingDailyLimitMoreThan1: '涨停；几天几板；涨停原因；涨停类型；封板金额；成交额；换手率；流通市值；' + stockBaseCondition,
    binddingDailyLimitMoreThan1ByDate: '${date}涨停；几天几板；涨停原因；涨停类型；封板金额；成交额；换手率；流通市值；' + stockBaseCondition,
    // 获取昨日涨停的数据（客观数据）
    dailyLimitYesterday: '昨日涨停；涨停开板次数；首次涨停时间；最终涨停时间；几天几板；昨日竞价量情况；今日竞价量情况；集合竞价评级；竞价涨幅；竞价异动类型；' + stockBaseCondition,
    // =============== =============== 选股 start  =============== ===============
    // 获取昨日涨停的数据（主观数据） 昨日涨停换手率>=5%；（去除庄股或利好一字） 防止炸板
    chooseStock1to2: '昨日首板涨停；涨停开板次数；首次涨停时间；最终涨停时间；昨日竞价量情况；今日竞价量情况；今日竞价看多；昨日涨停换手率>=5%；' + personalPreferenceCondition,
    // 首板预期个股，竞价抢筹，小幅高开 性价比高
    chooseStock1Expected: '竞价看多；竞价抢筹；竞价涨幅>0；10个交易日内有涨停；昨日未涨停；集中度70<=11；昨日收盘获利>=50%；' + personalPreferenceCondition,
    // 新股
    chooseStockNewStock: '今日新股上市；行业；竞价涨幅；流通市值；',
    // =============== =============== 选股 end  =============== ===============
    // 近三日资金流向
    capitalFlows3: '近三日资金流向降序',
    // 概念板块 主力资金 流入排序
    gainianFundsInflow: '概念板块主力资金；主力资金流向金额正序',
    // 概念板块 主力资金 流出排序
    gainianFundsOutflow: '概念板块主力资金；主力资金流向金额倒序',
    // 行业板块 主力资金 流入排序
    hangyeFundsInflow: '行业板块主力资金流向金额正序；所属同花顺行业级别是二级行业；',
    // 行业板块 主力资金 流出排序
    hangyeFundsOutflow: '行业板块主力资金流向金额倒序；所属同花顺行业级别是二级行业；',
    // 概念板块 涨幅排行
    gainianRiseFloat: '概念板块涨跌幅正序',
    // 概念板块 跌幅排行
    gainianFallFloat: '概念板块涨跌幅倒序',
    // 行业板块 涨幅排行
    hangyeRiseFloat: '行业板块涨跌幅正序；所属同花顺行业级别是二级行业；',
    // 行业板块 跌幅排行
    hangyeFallFloat: '行业板块涨跌幅倒序；所属同花顺行业级别是二级行业；',
    // 概念板块
    gainianPlate: '概念板块',
    // 行业板块，按涨停个数排序
    hangyePlateOrderByDailyLimitNum: '涨停家数>=1的行业板块；按涨停个数降序；成交额；',
    // 概念板块，按涨停个数排序
    gainianPlateOrderByDailyLimitNum: '涨停家数>=1的概念板块；按涨停个数降序；成交额；',
    // =============== ===============  个股相关 =============== =============== 
    // 2024-06-14 22:47:13
    // 容量核心
    rlCoreStock: '成交额降序；流通市值；市值；换手率',
    // 资金流入降序
    fundsInflowStock: '资金流入降序',
    // 资金流出降序
    fundsOutflowStock: '资金流出降序',
    // 区间 涨幅居前
    increaseCoreStock: '资金流入降序',
    // 区间 跌幅居前
    declineCoreStock: '资金流出降序',
};

export { AsynTaskIterator, createV, dailyLimitOptionalStrategy, dailyLimitOptionalStrategyStr, getCurrentCycle, getExpected, iWencaiDateFormat, isMainPlate, nextRegister, params, personalPreferenceCondition, stockBaseCondition };
