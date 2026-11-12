# 三项目协作与 AI 复盘现状

> 最后验证：2026-11-12

本文依据工作区三个项目的源码与配置整理，不代表当前线上部署状态。

## 项目与数据链路

| 项目 | 职责 | 代码入口 |
|---|---|---|
| payback | Vue 看盘前端、NestJS 行情采集及 API、推送与部署服务；行情存入 MySQL | `packages/client`、`packages/server`；详见 [系统全景](系统全景.md) |
| payback-agent | Python 工具调用循环、CLI、HTTP/SSE、每日复盘归档；支持 gateway 和 Codex 后端 | `payback-agent/src/payback_agent/`、`payback-agent/README.md` |
| payback-mcp | Python stdio MCP 服务，读取行情并提供统计、个股和外围行情工具；另有离线指标构建脚本 | `payback-mcp/src/payback_mcp/`、`payback-mcp/README.md` |

本地交互链路：`client /agentApi` → Vite 代理 → Agent HTTP/SSE（默认 `localhost:8300`）→ stdio 子进程 MCP → MySQL 或行情供应商。主服务采集数据写入 MySQL；MCP 在线查询使用只读连接，`scripts/build_metrics.py` 是独立写入派生表的离线操作。生产代理与部署应检查实际配置。

## Agent 接口与行为

思考摘要通过 `reasoning_delta` SSE 事件追加到聊天页。Codex 独立进程显式请求详细摘要，但实际是否返回仍取决于模型；前端始终显示“思考过程”入口，无摘要时展示等待或未提供提示。摘要目前不随服务端历史正文持久化，重新加载历史后可能只显示未提供提示。

`serve.py` 注册 `GET /healthz`、`POST /chat`、`DELETE /sessions/{session_id}` 和 `GET/POST /daily-reports/{trade_date}`。聊天响应使用 SSE；客户端实现见 `packages/client/src/api/agent.ts`。Agent 默认用同级 `payback-mcp` 目录和 `uv` 启动工具服务，可通过 `PAYBACK_MCP_DIR`、`PAYBACK_MCP_COMMAND` 覆盖。两个 Python 项目均要求 Python >= 3.11，使用 uv 管理依赖。

聊天历史使用 `GET /sessions?view=summary&limit=30&cursor=...&q=...` 获取 `{items,nextCursor}`，条目为 `id/title/lastTurnId/snippet`；完整问答通过 `GET /sessions/{session_id}` 按需获取（缺失返回 404）。`q` 搜索全历史问答并返回片段；游标按最后消息递增 ID 降序，字符串传输，无历史日期分组和数据库迁移。旧 `GET /sessions` 的最近 50 条完整会话响应仍兼容。

客户端保留 5 个可重新获取的正文缓存，生成中、失败以及旧本机未同步内容不参与淘汰；localStorage 保存最近摘要、活动入口和未同步内容，不随新增会话截断历史。摘要触底分页、搜索防抖并取消过期请求，详情失败可重试。当前正文搜索扫描文本，尚未接全文索引或列表虚拟化；前端升级须配合 Agent 重启。

四级复盘按市场整体、短线阶段、出手机会、买卖条件组织证据；工具失败、数据日期或时效不足时应按实际返回说明。每日全景复盘使用同日市场与短线数据并生成归档；调度、收盘数据判断和外围行情限制见 `payback-agent/README.md` 与 `daily_report.py`。

## MCP 工具

| 工具 | 作用 |
|---|---|
| `get_market_overview`、`get_limit_up_structure` | 市场总体与涨停结构 |
| `get_even_board_ladder`、`get_market_phase` | 连板梯队与市场阶段 |
| `get_position_outcomes`、`get_similar_days` | 板高历史结果与相似交易日统计 |
| `get_daily_panorama` | 指定交易日的市场、板块、梯队及跌停全景 |
| `get_stock_review`、`get_global_quote` | 个股历史日线观察、全球市场报价 |

工具定义及参数以 `payback-mcp/src/payback_mcp/server.py` 为准。普通相对日期查询可能回退到已有交易日，应引用返回的实际数据日期；每日全景对指定日期和跨表日期有更严格的检查。历史数据缺口、统计样本及供应商行情时效会影响结论，具体口径见 `payback-mcp/README.md`。

## 配置、验证和修改入口

- Agent 的 gateway 配置为 `AGENT_LLM_BASE_URL`、`AGENT_LLM_API_KEY`、`AGENT_LLM_MODEL`；`AGENT_LLM_BACKEND` 可选 gateway 或 codex。密钥只放运行环境，不写入文档和日志。
- MCP 数据库配置使用 `AGENT_MYSQL_HOST`、`AGENT_MYSQL_PORT`、`AGENT_MYSQL_USER`、`AGENT_MYSQL_PASSWORD`、`AGENT_MYSQL_NAME`；外部数据供应商配置和限制见 MCP README。
- 在各 Python 项目目录分别执行 `uv sync`、`uv run pytest`；测试与实库冒烟、外部供应商验证是不同的检查。主项目构建和启动见 [开发工作流](../06-开发规范/开发工作流.md)。
- 修改 MCP 工具注册、数据口径或数据库读取时，同步检查 Agent 工具使用、提示词、测试及本文工具清单；修改 Agent HTTP/SSE 时同步检查前端 API 和代理配置。
- 派生表重建会执行删除并重建操作，执行前核实目标数据库、权限及数据影响，详见 MCP README 和 `metrics/schema.sql`。

## 进一步阅读

- [Agent 线上接入 Codex 方案](../04-技术方案/Agent线上接入Codex方案.md)
- `payback-agent/README.md`、`payback-mcp/README.md`：各仓库运行说明和数据口径。
- [MCP 设计文档](../superpowers/specs/2026-10-13-payback-mcp-design.md)：历史设计，当前行为以源码为准。
