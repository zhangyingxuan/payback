# 每日 AI 复盘 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 每日基于已采集行情生成、存储并展示一份包含次日市场方向和板块/个股建议的 AI 复盘。

**Architecture:** 扩展既有 `reviewData` 保存按交易日唯一的 JSON 结果。服务端汇总已有采集表，调用 Gemini 的结构化 JSON API；缺少 Key、请求失败或校验失败时生成确定性的规则结果。收盘调度生成一次，管理员可重生成，现有复盘页读取存档。

**Tech Stack:** NestJS 9、TypeORM、Node `fetch`、Gemini REST API、Vue 3、Element Plus、Jest。

**Spec:** `docs/superpowers/specs/2026-08-30-daily-ai-review-design.md`

## Global Constraints

- API Key 只从服务端 `GEMINI_API_KEY` 读取，绝不下发到浏览器。
- 不添加第三方依赖、队列、模型配置系统或外部数据源。
- Gemini 输出必须通过本地校验；失败时保存 `source: 'rule'`。
- 每个交易日最多一份记录，重生成覆盖原记录。

### Task 1: 复盘结果模型与确定性降级规则

**Files:**
- Create: `packages/server/src/pay-back/utils/dailyReviewUtil.ts`
- Create: `packages/server/src/pay-back/utils/dailyReviewUtil.spec.ts`

**Interfaces:** Produces `DailyReviewContent`、`validateDailyReview(value)`、`createRuleReview(summary)`。

- [ ] 写测试：合法结果返回 true；非法方向或置信度返回 false；规则结果 `source` 为 `rule`。
- [ ] 运行 `pnpm --dir packages/server test -- dailyReviewUtil.spec.ts --runInBand`，确认新测试失败。
- [ ] 实现固定 schema：方向只允许 `bullish|neutral|bearish`，置信度范围 0-100，最多 3 个板块且每板块最多 3 股。
- [ ] 重跑同一测试，确认通过。

### Task 2: 服务端生成、存档与调度

**Files:**
- Modify: `packages/server/src/pay-back/entities/review.entity.ts`
- Modify: `packages/server/src/pay-back/service/review.service.ts`
- Modify: `packages/server/src/pay-back/pay-back.controller.ts`
- Modify: `packages/server/src/scheduler-task/config.ts`
- Test: `packages/server/src/pay-back/service/review.service.spec.ts`

**Interfaces:** Produces `ReviewService.generateDailyReview(date?)` and `ReviewService.findDailyReview(date?)`.

- [ ] 写测试：无 `GEMINI_API_KEY` 时 `generateDailyReview('2026-08-28')` 保存且返回 `source: 'rule'`。
- [ ] 运行 `pnpm --dir packages/server test -- review.service.spec.ts --runInBand`，确认失败。
- [ ] 给实体增加唯一 `tradeDate`、`content` 和 `generatedTime`；汇总目标日期的短线、市场、资金、板块、热榜及特殊个股。
- [ ] 使用 20 秒超时的 `fetch` 调 Gemini 结构化 JSON；本地验证失败或异常时调用规则降级；按交易日更新或插入。
- [ ] 新增管理员 `POST generateDailyReview`、认证 `GET fetchDailyReview`，并注册工作日 16:05 任务。
- [ ] 重跑服务测试，确认通过。

### Task 3: 复盘页展示与手动重生成

**Files:**
- Create: `packages/client/src/views/charts/tabPaneDailyReview.vue`
- Modify: `packages/client/src/views/charts/index.vue`
- Modify: `packages/client/src/api/payBack.ts`

- [ ] 添加两个 API 方法，新增“每日复盘”标签。
- [ ] 渲染日期、来源、方向、置信度、总结、依据、推荐板块/个股和风险提示；复用 `v-isAdmin` 显示重新生成按钮。
- [ ] 运行 `pnpm --dir packages/client build`，确认通过。

### Task 4: 验证

- [ ] 运行 `pnpm --dir packages/server test -- --runInBand --forceExit`。
- [ ] 运行 `pnpm --dir packages/server build` 与 `pnpm --dir packages/client build`。
- [ ] 用 `git status --short` 确认改动仅包含本功能和文档。
