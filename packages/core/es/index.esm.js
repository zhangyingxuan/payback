/*!
 * index.js v0.0.7
 * (c) 2018-2024 blowsysun
 * Released under the MIT License.
 */
import dayjs from 'dayjs';

function getCurrentCycle(item) {
    // 1、启动；犹豫中复苏，亏钱效应结束后，开始出现4板，连板小于10，不会出现15%以上大面；做首板
    // 2、发酵；3、分歧转一致；4、加速；5、分歧转一致；6、加速；7、见顶；8、调整；9、反包；
    // 高度>=5；连板股数量&gt;=10；没有天地板、炸板大面票，昨日断板票今天会有修复，大长腿也经常出现
    // 3、高潮 板块出现批量涨停潮，涨停数>=45；连板股数量&gt;=15；（梯队整齐）几乎没有高位炸板、炸板大面、昨日涨停今天跌停、昨日涨停今天闷杀，无-&gt;10%短线大面股
    // 4、衰退：总龙头见顶，高位连板股出现亏钱效应
    // 5、冰点：
    // 周期定义
    const cycles = ['启动', '发酵', '高潮', '退潮', '冰点'];
    // 最大高度 item.evenBoardData
    const maxHeight = item.marketHeight;
    // 跌幅大于15的个股
    const hugeFallNum = item.hugeFallData ? item.hugeFallData.length : 0;
    // 跌停数量
    if (maxHeight <= 4) {
        if (item.downLimitQuantity > 10) {
            return cycles[4];
        }
        // 今天的最高板没有昨天高，昨天是高潮
        if (maxHeight === 4 && hugeFallNum == 0) {
            return cycles[0];
        }
        return cycles[3];
    }
    if (maxHeight >= 5) {
        // 高潮前提，不能有连板负反馈
        if (item.evenBoardAmount >= 10 || item.dailyLimitQuantity >= 45) {
            return cycles[2];
        }
        return cycles[1];
    }
}
const dailyLimitOptionalStrategyStr = '流通市值大于等于20亿，小于等于120亿，主板个股，股价低于30';
/**
 * 涨停自选策略
 * 连板全部加入
 * 策略备注：参考 dailyLimitOptionalStrategyStr
 */
function dailyLimitOptionalStrategy(stock, currentLevel) {
    // 创业板、科创板 30*、688、83* 不自选
    if (stock.code.startsWith('3') || stock.code.startsWith('688') || stock.code.startsWith('8') || stock.code.startsWith('4'))
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

const iWencaiDateFormat = 'YYYYMMDD';
const chooseStockBaseCondition = '行业；股价低于30元；流通市值<=120亿；流通市值>=20亿；非创业板；非科创板；非ST';
const params = {
    downLimit: '跌停；非st；行业',
    downLimitByDate: '${date}跌停；非st；行业',
    // 炸板个股；涨停未遂
    dailyLimitOpen: '涨停打开；非ST；成交额；行业',
    dailyLimitOpenByDate: '${date}涨停打开；非ST；成交额；行业',
    hugeFall: '跌幅大于等于15的个股；行业',
    hugeFallByDate: '${date}跌幅大于等于15的个股；行业',
    dailyLimitMoreThan1: '涨停；非ST；几天几板；涨停原因；涨停类型；涨停开板次数；封板金额；成交额；换手率；流通市值；行业',
    dailyLimitMoreThan1ByDate: '${date}涨停；非ST；几天几板；涨停原因；涨停类型；涨停开板次数；封板金额；成交额；换手率；流通市值；行业',
    // 获取昨日涨停的数据（客观数据）
    dailyLimitYesterday: '昨日涨停；涨停开板次数；首次涨停时间；最终涨停时间；几天几板；昨日竞价量情况；今日竞价量情况；集合竞价评级；竞价涨幅；竞价异动类型；非ST；行业',
    // =============== =============== 选股 start  =============== ===============
    // 获取昨日涨停的数据（主观数据） 昨日涨停换手率>=5%；（去除庄股或利好一字） 防止炸板
    chooseStock1to2: '昨日首板涨停；涨停开板次数；首次涨停时间；最终涨停时间；昨日竞价量情况；今日竞价量情况；今日竞价看多；昨日涨停换手率>=5%；' + chooseStockBaseCondition,
    // 首板预期个股，竞价抢筹，小幅高开 性价比高
    chooseStock1Expected: '竞价看多；竞价抢筹；竞价涨幅>0；10个交易日内有涨停；昨日未涨停；集中度70<=11；昨日收盘获利>=50%；' + chooseStockBaseCondition,
    // 新股
    chooseStockNewStock: '今日新股上市；行业；竞价涨幅；流通市值；',
    // =============== =============== 选股 end  =============== ===============
    // 近三日资金流向
    capitalFlows3: '近三日资金流向降序',
    // 数据中心地址
    dataCenterUrl: 'http://data.10jqka.com.cn/',
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
    hangyePlateOrderByDailyLimitNum: '涨停家数大于1的行业板块，按涨停个数降序',
    // 概念板块，按涨停个数排序
    gainianPlateOrderByDailyLimitNum: '涨停家数大于1的概念板块，按涨停个数降序',
};

export { AsynTaskIterator, chooseStockBaseCondition, dailyLimitOptionalStrategy, dailyLimitOptionalStrategyStr, getCurrentCycle, getExpected, iWencaiDateFormat, nextRegister, params };
