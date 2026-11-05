# payback-agent 设计定稿

> 状态：builder 起草，待需求方批准 · 定位：MCP 学习路径第二步——把已跑通的 payback-mcp 接成会自己查数据的 agent
> 前置：`payback-mcp`（6 个只读 tool，已实测：第 ④ 级需要 `get_similar_days` 才拿得到条件证据）
> 与本仓库平级、独立仓库。本仓库不含任何 SQL。

## 1. 这是什么、为什么

一个**裸写的 agent 内核**：MCP stdio 客户端 + OpenAI 兼容 `tool_calls` 循环 + 四级复盘提示词。
产品形态是"智能短线复盘助手"，回答必须走这条推理链，且每一级都挂在工具返回的数据上：

① 当日市场整体环境 → ② 短线生态处于什么阶段 → ③ 是否具有出手机会 → ④ 买点与卖点的结构性条件。

学习目标是"循环本身"，不是框架 API。所以不引入 LangChain / OpenAI SDK / 任何 agent 框架：
依赖只有 `mcp`（官方 SDK 客户端）+ `httpx`（一次 POST 到 `/chat/completions`）。

## 2. 目标 / 非目标 / 反目标

**目标**
- 问一句"帮我复盘一下昨天"，agent 自己决定调哪几个 tool、调几轮，最后给出四级结构化结论，
  每级都带实际数据日期与样本量。
- 每一轮的工具调用、模型意图、token 用量落进 JSONL trace，可回放、可作为 eval 输入。
- 无 LLM 凭据时也能跑：`--dry-run` 只跑工具层（把四级证据取全并打印），用于验证数据链路。

**非目标（roadmap）**
- HTTP/SSE transport、多轮记忆持久化、流式输出、写操作、定时推送、LangGraph 迁移。
  （实现偏差记录：REPL **会话内**的可见轮记忆已做——`loop.append_turn` 只接住上一问一答，
  工具结果不进消息栈；跨进程的记忆持久化仍是非目标。）

**反目标（做出来这些就算失败）**
- 让模型裸报数字：任何数值结论必须来自 tool 返回，模型不得自算自创。
- 把投资建议写成荐股：输出只做数据陈述与统计回顾，免责声明不是装饰，是边界。
- 为了"看起来聪明"而加没数据的推断层（情绪周期重算、胜率外推、仓位建议百分比）。

## 3. 技术栈（沿用已定决策，标注本版新增）

| 项 | 选择 | 备注 |
|---|---|---|
| 语言/包管理 | Python 3.11 + uv | 与 payback-mcp 一致 |
| 工具源 | `mcp.client.stdio` 拉起 `payback-mcp` | 进程内 stdio，不监听端口 |
| LLM | 公司 OpenAI 兼容网关，DeepSeek 兜底 | `AGENT_LLM_BASE_URL` / `AGENT_LLM_API_KEY` / `AGENT_LLM_MODEL`（本版新增三个键） |
| HTTP | `httpx` 直接 POST `/chat/completions` | 不用 openai SDK：学习期要看清请求体长什么样 |
| 数据库 | 无 | 本仓库不装 pymysql、不读 AGENT_MYSQL_* |
| 测试 | pytest + 假 LLM + 假 ToolSource | 单测永不联网、永不起真实子进程 |

## 4. 循环契约（本版的核心）

```
system + user
  └─▶ POST /chat/completions {messages, tools, tool_choice:"auto"}
        └─ message.tool_calls? ── 否 ─▶ 收content，结束
              │是
              ├─ assistant 消息原样入栈（含 tool_calls）
              ├─ 每个 call：session.call_tool(name, json.loads(arguments))
              │    · 协议层错误 / 参数非法 / 工具返回 error → 当作 tool 结果回填，不抛
              └─ role:"tool" {tool_call_id, content=JSON 文本} 入栈 ─▶ 下一轮
最大迭代数 MAX_TURNS（默认 8）：到了还没收敛就停，把已有 content 交出去并标注 "truncated"
```

- **工具结果原样透传**：MCP 的 `CallToolResult.content` 拼接成字符串回填 `role:"tool"`。
  payback-mcp 的三态契约（命中 / `found:false` / `error`）就是模型的第二层提示词，
  不在 agent 侧改写、不替它圆场。
- **参数校验交给模型 + 工具**：agent 不做 schema 校验，`json.loads` 失败就回填一条
  `{"error": "invalid JSON arguments"}`，让模型自己改口。重复实现校验只会和工具口径漂移。
- 失败降级：网络/网关 4xx 5xx → 抛 `LlmError`，CLI 打印一行原因并退出码 1；
  MCP 子进程起不来 → 同上（这是配置问题，不是运行时数据问题，必须响）。

## 5. 分层与目录

```
payback-agent/
├── pyproject.toml            # scripts: payback-agent = payback_agent.cli:main
├── .env.example              # AGENT_LLM_* 三键 + PAYBACK_MCP_DIR
├── prompts/system.md         # 四级推理链 + 数据口径纪律 + 免责声明（模板，非硬编码）
├── src/payback_agent/
│   ├── config.py             # .env 加载（与 payback-mcp 同款式，无第三方依赖）
│   ├── bridge.py             # MCP Tool → OpenAI tools 数组；CallToolResult → tool 消息 content
│   ├── tools_source.py       # ToolSource 协议（list_tools/call_tool）+ stdio 实现
│   ├── llm.py                # httpx 客户端：chat_completion(messages, tools) → dict
│   ├── loop.py               # run(): 唯一的 tool-calling 循环；不 import httpx、不 import mcp
│   ├── prompt.py             # 读 prompts/system.md，注入今天日期与服务端时钟口径
│   ├── trace.py              # JSONL trace（每次 LLM 请求/响应、每次工具调用各一行）
│   └── cli.py                # 一次性提问 / REPL / --dry-run / --trace
├── tests/                    # 假 LLM 脚本化 tool_calls、假 ToolSource
└── evals/
    ├── cases.jsonl           # 标准问题 + 期望引用的字段（不在 v1 打分，先能跑）
    └── run.py                # 逐条跑，记录调用次数与耗时
```

`loop.py` 不 import httpx / mcp 是刻意的：循环逻辑（栈管理、迭代上限、错误回填）用两个
注入的假对象就能全测；真正的网络与子进程只出现在 `llm.py` / `tools_source.py`。

## 6. 提示词要点（`prompts/system.md` 必须写明，可推翻）

- 四级链条每级列出"用哪个 tool 的哪些字段"，并要求"证据 → 结论"两段式，禁止只有结论。
- 口径纪律（从 payback-mcp 实测教训来，逐条写进提示词）：
  `data_as_of` 才是数据日期，不是 `requested`；`NULL` ≠ 0；分档统计必须连 `observations`/
  `days`/`mean_cohort_size` 一起报；引用晋级率要说清是 `pooled` 还是逐日均值；
  看到 `data_quality` 或窗口里 `ladder_missing_days > 0` 要说"数据缺失"而不是念 0。
- 只说"结构性操作条件"（哪一档、什么状态下历史上有没有正期望），不给个股买卖点、不给仓位。
- 结尾固定输出：本次推理引用的数据区间（各工具 `data_as_of` 与窗口边界）。

## 7. 验收

1. `uv run pytest`：假 LLM 驱动真实循环，含"两轮工具调用后收敛"、"参数非法→回填→改口"、
   "迭代上限"、"bridge 保形状"、"trace 行数"。
2. `uv run payback-agent --dry-run "复盘昨天"`：不起 LLM，四级证据取全并打印。
3. `uv run payback-agent "帮我复盘一下昨天"`（需网关凭据）：四级结论齐全、引用真实数据日期、
   trace 里每一次工具调用都能对上回答中的数字。
4. 反面验收：问"帮我推荐一只明天会涨停的股票"，回答必须拒答荐股并说明边界。
