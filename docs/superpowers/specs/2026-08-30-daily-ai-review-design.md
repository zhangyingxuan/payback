# 每日 AI 复盘设计

## 目标

在每日收盘数据采集完成后，基于现有市场、短线、资金、板块和热榜数据生成并存档一份次日行情复盘，包含大盘方向、推荐板块及板块内个股、依据和风险提示。

## 范围

- 后端仅从已有数据库读取数据；不向 Gemini 发送用户账号、同花顺凭证或其他敏感信息。
- Gemini API Key 仅由服务端环境变量 `GEMINI_API_KEY` 提供。
- 每个交易日 16:05 自动生成一次；管理员可以手动重新生成。
- 页面展示已存档的当日结果，不在页面打开时调用 Gemini。
- Gemini 调用或 JSON 校验失败时，以同一份市场摘要生成规则化降级结果并保存。

## 数据与接口

复用 `reviewData` 表，新增唯一 `tradeDate` 和 `content`（JSON 文本）字段。`content` 固定包含：

- `marketOutlook`：`bullish`、`neutral` 或 `bearish`
- `confidence`：0 到 100 的整数
- `summary`、`rationale`、`riskWarning`
- `recommendations`：最多三个板块；每个板块最多三个个股，均需有推荐理由
- `source`：`gemini` 或 `rule`

新增接口：

- `POST /blowsysun/pay-back/generateDailyReview`：管理员手动生成指定日期或当日复盘。
- `GET /blowsysun/pay-back/fetchDailyReview?date=YYYY-MM-DD`：读取指定日期；未传日期时读取最新一份。

## 生成流程

1. 读取目标交易日对应的短线、市场、资金、板块、热榜及特殊个股数据。
2. 将必要字段压缩为市场摘要，要求 Gemini 通过 JSON Schema 返回固定结构。
3. 验证必填字段、枚举值、数值范围和推荐数量后保存；同一交易日覆盖更新。
4. 调用失败、超时或校验失败时，依据涨跌家数、涨停/跌停、市场评分、资金净流向和板块涨停数产生保守结论，并标记 `source: rule`。

## 界面

在现有“复盘”页新增“每日复盘”标签：展示日期、来源、方向、置信度、总结、依据、推荐板块与个股、风险提示。管理员显示“重新生成”按钮；普通用户只读。

## 非目标

- 不做个性化持仓建议、自动交易、外部新闻检索或历史胜率回测。
- 不新增模型切换、提示词后台管理、队列或缓存系统。

## 验收

- 无 Gemini Key 或 Gemini 失败时，仍能生成并读取一份 `source: rule` 的有效复盘。
- Gemini 返回不符合约束的 JSON 时不入库为 AI 结果，自动降级。
- 同一 `tradeDate` 始终只有一份可读取的复盘。
- 每日复盘页在不访问 Gemini 的条件下展示已存档内容。
