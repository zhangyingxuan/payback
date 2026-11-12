# 收盘双图推送 Implementation Plan

> **For agentic workers:** 使用 executing-plans 在当前会话逐项实施，不提交代码。

**Goal:** 交易日北京时间 15:38 将复盘全景图、短线涨停梯队图同时推送飞书和企微。

**Architecture:** server 复用交易日任务注册；Agent 经现有串行 MCP worker 读取同日收盘数据并复用 SVG 绘图；push-server 将 SVG 转成 PNG，通过现有机器人发图。新增原生 SVG 渲染依赖，避免部署整套浏览器。长图分段，失败通道独立重试，已成功图片在当前进程内去重。

**Tech Stack:** NestJS 9、Python/Starlette、pnpm、@resvg/resvg-js。

**Spec:** 用户确认双通道推送，时间改为 15:38；休市不推送。

## Global Constraints

- 资金晚盘采集提前至 15:32，短线保留 15:35；必须验证当日收盘记录，不能回退昨日或午盘。
- 不改数据库、不提交、不部署、不在验证过程中实际发群消息；凭据只从环境读取。
- 飞书上传需要 FEISHU_APP_ID、FEISHU_APP_SECRET，沿用现有 webhook 接收群。
- 企微单张 PNG 不超过 2 MiB；长梯队按原始尺寸分段。

## Review Focus

- 旧日、午盘、缺失和错误数据拒绝推送。
- MCP 调用仍由 worker 独占，不调用 LLM、不写聊天会话。
- 任一通道失败不阻塞另一通道；业务错误码不可当作成功。
- 重试不重复发送已成功的分图；去重限于进程生命周期。
- 飞书凭据缺失须明确失败，不能影响企微发送；不记录凭据。

### Task 1: Agent 双图生成

- [x] 新建 `payback-agent/src/payback_agent/review_charts.py` 和 `tests/test_review_charts.py`：校验日期、三类收盘时间及数据质量，读取全景、完整梯队和周期，复用绘图函数。
- [x] 在 `serve.py` 新增串行 charts job 和 `POST /review-charts/{trade_date}`，测试无模型配置也能生成、非法日期和失败响应。

### Task 2: 机器人图片发送

- [x] push-server 添加 resvg 依赖；新建 `review-charts.service.ts` 和测试，SVG 分段渲染、PNG 大小校验、飞书鉴权上传、两通道独立发送、进程内成功去重。
- [x] 注册 provider 和 `MessagePattern('pushReviewCharts')`，对所有外部 HTTP 设置超时并验证错误码。

### Task 3: 调度和交付

- [x] server 新增 `ReviewChartsService.pushDailyCharts()`，有限重试 Agent/推送失败；配置 `0 38 15 * * 1-5` 和交易日过滤，资金改为 15:32，测试任务、时间与失败重试。
- [x] 补齐 README/推送文档中的配置、字体要求、部署边界及去重限制。
- [x] 运行 Python/Jest 针对性测试、两服务类型检查和真实 PNG 渲染自检；清理本任务临时产物。

## 实施记录

- 使用 resvg `renderAsync`，字体排版不占用 push-server 主线程。
- 独立审查发现派生指标可能仍为午盘：已增加阶段记录收盘时间校验；周期、封板率、涨跌停数取本次收盘原始快照，未重建的晋级率显示“未提供”。审查复核无新增发现。
- 真实 SVG 验图覆盖 990 像素全景和 1200 像素、100 条股票梯队；中文可读、分图大小合规。
- 未部署或实际发群消息，部署需配置飞书应用凭据和中文字体。
- 验证：81 项 Python 测试、8 项 server 测试、6 项 push-server 测试通过；两个 NestJS 服务 `tsc --noEmit --incremental false` 通过；6 个验图临时文件已清理。
