# payback-mcp 设计定稿

> 状态：评审回签完成，待最终批准 · 定位：MCP 学习项目第一步，独立仓库
> 早期曾有一版重架构草稿（`2026-10-13-pay-agent-mcp-architecture.md`，TS + bridge + evals 全家桶），已被本版**取代**，那份仅作 roadmap 参考。
>
> **本轮评审后新增的拍板**（供快速核对）：① 相对日期=各表取 ≤请求日的最近一条并附实际日期（你选 a）；② 连板梯队尽量保留原始字段（你定）；③ 指数涨跌幅只输出表里真实存在的列，深证/创业板不做现算（builder 定，可推翻）；④ data_as_of 取 tradeDate、各表独立取新鲜度（builder 定）；⑤ 只读账号是外部前置条件，GRANT 语句已写入第 6 节（builder 定）。

## 1. 这是什么、为什么

一个独立 MCP server 仓库，把 payback 项目沉淀的 A股复盘数据做成只读 tools。它是需求方 MCP 学习路径的第一步：先跑通"自然语言问自己的行情库"，第二步（Python + LangChain agent）把这批 tools 原样接为工具源。

需求方背景：TS/Node 熟手，Python 接近零基础（已知情选择全 Python，把语言成本投给第二步必用的语言）。"支持 OpenAI 协议"的真实含义 = 对话模型走公司提供的 OpenAI 兼容网关（DeepSeek 兜底），由 MCP 客户端使用，与本 server 代码无关。

## 2. 目标 / 非目标 / 反目标

**目标**
- 3 个只读 tools 通过 stdio 跑通，在 Qoder CLI 中配置后能正确回答"昨天涨停家数和最高连板多少"。
- 每个协议环节（schema、handler、客户端配置）需求方亲手碰过一遍。

**非目标（roadmap，不在本版）**
- 手写 orchestrator / tool-calling 循环、HTTP/Streamable transport、evals、写操作工具、LangChain 部分。

**反目标（做出来这些就算失败）**
- 把项目做成"通用模板/脚手架"——通用性的兑现方式是"这条路走通后我自己就是模板"。
- 触碰 DDL 或写权限（防御上次 MySQL 磁盘满 + synchronize:true 的事故模式）。

## 3. 技术栈（均为双方确认的决策）

| 项 | 选择 | 备注 |
|---|---|---|
| 语言/包管理 | Python + uv | 需求方拍板全 Python |
| MCP 框架 | 官方 SDK 的 FastMCP | |
| 数据库 | pymysql，参数化 SQL | 与 mysql2 心智一致，无框架层 |
| Transport | stdio | HTTP 留 roadmap |
| 对话入口 | Qoder CLI（配 MCP），模型走公司 OpenAI 兼容网关，DeepSeek 兜底 | 网关具体配置由需求方自理 |

## 4. 第一批 Tools（全部只读）

| tool | 输入 | 数据来源（payback 库） | 输出 |
|---|---|---|---|
| `get_market_overview` | trade_date | marketData | 三大指数点数/涨跌幅、涨跌家数、成交额 |
| `get_limit_up_structure` | trade_date | shortTermData | 涨停数、封板率、最高连板、连板数、跌停数 |
| `get_even_board_ladder` | trade_date | shortTermData.evenBoardData | 连板梯队明细（JSON 解析后精简结构） |

约定：
- **相对日期口径（需求方确认，方案 a）**：不引入节假日表。tool 入参接受两种形式：明确日期 `YYYY-MM-DD`，或相对词（`yesterday`/`last_trade_day` 等）。解析规则 = 各表取 `MAX(trade_date) WHERE trade_date <= 请求日`。回答永远附带**实际数据日期**，非交易日问"昨天"则答最近交易日并标明。"今天"由服务端 `date.today()` 判定，不依赖模型自报日期。
- `data_as_of` 取命中行的 `tradeDate`（采集时间 `createTime` 一并返回作参考）。
- **各表独立取最近交易日**（marketData 与 shortTermData 由不同任务写入，新鲜度可能不一致，不做强行对齐）。
- evenBoardData 的解析在 data 层完成，**尽量保留原始字段**（需求方确认）：按连板高度分组透传，仅剔除明显无用字段（链接、内部 id 类）；具体保留清单由 builder 阅读爬虫写入代码后确定。
- 输出契约修正（builder 决策，可推翻）：marketData 表只有上证有涨跌幅列，`get_market_overview` 输出 = 上证点数+涨跌幅，深证/创业板/北证仅点数（不做跨日现算）。

## 5. 仓库与分层

```
D:\workspace\github\payback-mcp\        # 与 payback 平级、独立仓库
├── pyproject.toml                      # uv 管理
├── .env.example                        # AGENT_MYSQL_HOST/PORT/USER/PASS/DB
├── src/payback_mcp/
│   ├── server.py                       # FastMCP 入口 + 工具注册（新增 tool = 一文件 + 一行注册）
│   ├── db.py                           # 只读连接
│   ├── dates.py                        # 相对日期 → 最近交易日
│   └── tools/                          # 三个工具，一文件一个；schema/handler 分离
└── README.md                           # 含 Qoder CLI 接入配置示例
```

三层不混写：日期解析 / SQL 查询 / tool handler。第二步的 `agent/` 未来加在同一仓库（uv workspace 多包）。

## 6. 数据边界与安全

- MySQL 建**独立只读账号**（仅 GRANT SELECT 于相关表），不共用现有服务的 `DDD_*` 凭据；连接串走本仓库 `.env`。
- 只读账号为**外部前置条件**（需 payback 库管理员执行，非 builder 自行创建）：
  `CREATE USER 'agent_ro'@'%' IDENTIFIED BY '…'; GRANT SELECT ON <db>.market_data, <db>.short_term_data TO 'agent_ro'@'%';`
  （实际表名以 payback 库中 TypeORM 生成的为准，builder 第一步先连库确认。）
- 所有 SQL 参数化；tool 入参经 FastMCP schema 校验后才进 data 层。
- stdio 模式不监听任何端口。

## 7. 验收

1. `uv run payback-mcp` 正常拉起 server（stdio 握手成功）。
2. Qoder CLI 配置该 MCP server 后，提问"昨天涨停家数和最高连板多少"，回答数值与库中数据一致，且包含 tool 调用过程。
3. 需求方能说出新增第 4 个 tool 需要动哪几个文件。

## 8. 已知风险

- Python 零基础 + MCP 新概念双线作战，前两周会慢于纯 TS 路径——需求方知情接受。
- payback 库表结构由现有服务 `synchronize:true` 自动维护，存在漂移风险：tools 层对缺表/缺列要报清晰错误而非崩溃。
