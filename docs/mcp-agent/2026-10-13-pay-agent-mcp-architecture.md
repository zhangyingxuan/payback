# pay-agent-mcp 架构设计

> 状态：待评审 · 日期：2026-10-13 · 定位：学习项目，独立 repo，与 payback 现有服务解耦

## 1. 目标与非目标

**目标**
- 把 payback 沉淀的 A股复盘数据（涨停/连板/大盘/板块/热榜/竞价/复盘）封装为标准 MCP tools。
- 支持 OpenAI function-calling 协议（Chat Completions `tools` 字段），可对接 DeepSeek / Qwen / GLM 等兼容端点。
- 同一套 tools 既能被 Claude Code 等 MCP 客户端直接使用，也能被自写 orchestrator 驱动，还能平滑迁移到 LangGraph。

**非目标**
- 不做生产部署、不做写操作工具（自选股同步/任务开关等一律不进第一版）。
- 不接爬取类接口（问财反爬链路稳定性差，会干扰 agent 逻辑验证）。
- 不做荐股建议，输出只做数据陈述与统计回顾。

## 2. "支持 OpenAI 协议"的两层含义（本设计的核心）

| 层 | 含义 | 实现 |
|---|---|---|
| LLM 调用协议 | agent 大脑走 OpenAI Chat Completions + function calling（DeepSeek 等均兼容） | orchestrator 包内实现 tool-calling 循环 |
| MCP ↔ OpenAI 桥接 | MCP tool 定义（JSON Schema）与 OpenAI `tools` 数组的格式转换 | `src/bridge/openai-tools.ts`：`listTools()` → `{type:"function", function:{name, description, parameters}}`；`tool_call.id` ↔ `CallToolResult` 互转 |

选择桥接层而不是二选一的原因：MCP 管"工具如何暴露与发现"，OpenAI 协议管"模型如何决定调用"，两者正交；学习价值恰好在这层的转换与循环上。

## 3. 总体架构

```
┌─────────────── 入口层（三选一，共用同一内核） ───────────────┐
│ A. Claude Code / 任意 MCP 客户端 ──stdio──▶ MCP Server        │
│ B. 自写 orchestrator（学习期主力）──进程内──▶ ToolRegistry     │
│    └─ OpenAI 兼容 LLM（tool_calls 循环）                      │
│ C. LangGraph（后期迁移目标）──MCP 客户端──▶ MCP Server        │
└──────────────────────────────────────────────────────────────┘
                     │
              ┌──────▼───────┐
              │  tools 层     │  每个 tool = schema + handler，纯函数
              └──────┬───────┘
              ┌──────▼───────┐
              │  data 层      │  mysql2 只读连接池；tradeDate 解析；SQL 白名单
              └──────┬───────┘
                     │
        MySQL（只读账号，现有 payback 库）
```

- **MCP Server**：`@modelcontextprotocol/sdk`，默认 **stdio** transport（零网络配置，MCP 客户端即插即用）；预留 **Streamable HTTP** 模式开关，供远程客户端/后续 Web 入口。
- **orchestrator**：裸写的 OpenAI tool-calling 循环（messages → tool_calls → 执行 → role:"tool" 回填 → 循环，设最大迭代数），不依赖任何 agent 框架。
- ToolRegistry 是唯一事实源：MCP server 和 orchestrator 都从它读取 tool 定义，避免两处维护 schema。

## 4. 目录结构

```
pay-agent-mcp/
├── src/
│   ├── index.ts               # MCP server 入口（stdio / http 双模式）
│   ├── registry.ts            # ToolRegistry：defineTool(schema, handler)
│   ├── bridge/
│   │   └── openai-tools.ts    # MCP ↔ OpenAI function schema/result 转换
│   ├── orchestrator/
│   │   ├── loop.ts            # OpenAI tool-calling 循环
│   │   └── chat.ts            # CLI  REPL 入口（学习期调试用）
│   ├── tools/                 # 每工具一文件
│   │   ├── limit-up.ts  market.ts  plate.ts  hot-list.ts
│   │   ├── auction.ts   review.ts  calendar.ts
│   ├── data/
│   │   ├── db.ts              # 只读连接池（env: AGENT_MYSQL_*）
│   │   ├── tradeDate.ts       # 日期解析："今天/昨天/上周" → 最近交易日
│   │   └── queries.ts         # 参数化 SQL，禁止字符串拼接
│   └── types.ts
├── prompts/system.md          # 系统提示：数据截止时间注入、免责声明、输出格式
├── evals/
│   ├── cases.jsonl            # 20 个标准问题 + 期望要点
│   └── run.ts                 # 回归跑分：准确率/工具调用次数/token 成本
├── .env.example
└── package.json               # Node 22+, TS, pnpm
```

## 5. 工具清单（第一版，全部只读）

| tool | 数据表 | 输入 | 输出要点 |
|---|---|---|---|
| `get_trading_calendar` | （内置算法/表推导） | date 范围 | 最近 N 个交易日，解决"昨天"歧义 |
| `get_market_overview` | marketData | tradeDate | 三大指数、涨跌家数、成交额、板块涨跌 TOP5 |
| `get_limit_up_structure` | shortTermData | tradeDate | 涨停数、封板率、最高连板、连板数、跌停数 |
| `get_even_board_ladder` | shortTermData.evenBoardData | tradeDate | 连板梯队明细（JSON 解析后返回） |
| `get_plate_summary` | plateData | tradeDate | 涨停最多板块及数量 |
| `get_hot_list` | hotList | tradeDate, topN | 同花顺热榜前 N |
| `get_auction_stocks` | specialStock | tradeDate, type | 竞价涨停/新股/强势股列表 |
| `get_review_data` | reviewData | tradeDate | 当日复盘情绪、龙头记录 |
| `get_daily_report` | 多表聚合 | tradeDate | 单轮生成收盘播报用的结构化盘面包 |

约定：
- 所有 tool 返回 `{ content: [{type:"text", text: JSON.stringify(...)}] }`，并带 `data_as_of` 字段（数据截止时间），供模型注入回答。
- 大字段（evenBoardData 等 mediumtext）在 data 层解析成精简结构再返回，控制 token 消耗。
- 每个 handler 纯函数、无状态，方便以后原样迁进 LangGraph。

## 6. OpenAI 协议细节（orchestrator）

```
system prompt（含数据截止、工具使用规范、免责声明）
  ↓
POST /chat/completions  { model, messages, tools: toOpenAITools(registry) }
  ↓ finish_reason == "tool_calls"
逐个执行 tool_calls → 回填 { role:"tool", tool_call_id, content }
  ↓ 循环（max 6 轮），超限强制让模型基于已有信息作答
```

- `tool_choice` 默认 `auto`；不强绑 Responses API，先吃透 Chat Completions（生态兼容性最广）。
- LLM 端点、模型名、apiKey 全部走 env，DeepSeek/Qwen/GLM 可切换对比。
- 每轮记录 JSONL trace：请求 messages 摘要、tool 名、耗时、token 用量 —— 学习期最重要的可观测手段。

## 7. 安全与数据边界

- MySQL 使用**只读账号**，仅 GRANT SELECT；连接串独立于现有服务的 `DDD_*` 配置。
- 所有 SQL 参数化；tool 入参用 zod 校验后才有资格进 data 层。
- MCP server 不监听网络端口（stdio 模式）；HTTP 模式上线前必须加 Bearer token 校验。
- 系统提示中固定注入："只做数据陈述，不构成投资建议"。

## 8. 里程碑

| 阶段 | 交付 | 验证方式 |
|---|---|---|
| M1（1 周） | MCP server + registry + 4 个核心 tools（calendar/market/limit-up/auction），stdio | Claude Code 里配置后问答验证 |
| M2（1 周） | bridge + orchestrator 裸循环 + CLI chat | "上周竞价涨停次日表现"类多步题跑通 |
| M3 | 补齐 tools + get_daily_report 收盘播报单轮生成 | evals 20 题回归 ≥ 80% |
| M4 | 迁移 orchestrator 到 LangGraph（checkpoint/记忆），或接飞书入口 | 与 M2 行为对比 |

## 9. 遗留决策（留给实现阶段）

- evenBoardData 的 JSON 结构需在实现时读爬虫写入代码确认（本文档假设可直接 JSON.parse）。
- 交易日判断第一版用"表里有数据的最近 tradeDate"兜底，不引入节假日库。
- Streamable HTTP 模式 M4 再实现，M1-M3 纯 stdio。
