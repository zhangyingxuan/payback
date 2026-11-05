# payback-mcp M1 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在独立仓库 `D:\workspace\github\payback-mcp` 建成一个 stdio MCP server，提供 3 个只读 A股复盘数据 tools，可在 Qoder CLI 中配置并正确回答行情问题。

**Architecture:** 三层分离——日期解析 / SQL 查询 / tool handler（spec §5）。FastMCP 只做注册与协议，业务代码全部纯函数、可用假 conn 单测。凭据经 `.env` 注入只读账号。

**Tech Stack:** Python ≥3.11、uv、mcp（官方 SDK，含 FastMCP）、pymysql、pytest。

**Spec:** `D:\workspace\github\payback\docs\superpowers\specs\2026-10-13-payback-mcp-design.md`（执行时两库同读）

## Global Constraints

- 全 Python，不引入 ORM/框架层；SQL 一律 pymysql 参数化（`%s` 占位）。
- 所有 tool 只读；连接账号仅 SELECT（账号 provision 是外部前置条件，代码按"连不上就报清晰错误"处理）。
- 每个 tool 返回 dict 必含 `"data_as_of": <命中行 tradeDate>` 与 `"requested": <请求日>`；未命中含 `"found": false`；异常含 `"error"` 键，不向外抛协议层异常。
- 相对日期口径（spec 拍板①）：`today`/`yesterday`/`last_trade_day` 先换算成日历日，再对目标表取 `MAX(trade_date) WHERE trade_date <= 该日`。
- 连板梯队尽量保留原始字段（用户拍板②）：剔除 `codeReverse` 类内部字段与空值，其余透传。
- 表/列名：TypeORM 默认表 snake_case（`short_term_data`/`market_data`）、列沿用实体 camelCase。**Task 2 Step 0 用 live 库 `SHOW COLUMNS` 核实后才写死。**
- 单测不得依赖 live MySQL；live 冒烟单独跑。
- 仓库每任务一 commit，message 前缀 `feat:`/`test:`/`chore:`。

## Review Focus

spec 未明说、但最容易咬人的输入类别，各自钉到归属任务的测试里：

1. 请求日期早于库里最早数据 / 晚于今天 → 应回 `found:false` 且附最近可用日期提示，而非空 dict 或异常（Task 2/4）。
2. 非法日期串（`2026-13-99`、`abc`）→ 回 `error` 说明支持格式（Task 2）。
3. `evenBoardData` 为 NULL/空串/坏 JSON（爬虫历史脏数据）→ `error: "ladder data unreadable"`，不崩（Task 6）。
4. 缺表/缺列（synchronize:true 漂移）→ pymysql OperationalError 捕获后 `error` 带表名（Task 2）。
5. 连板梯队单日 100+ 只股撑爆上下文 → `level` 参数限高 + 超过阈值截断并标注 `truncated:true`（Task 6）。

---

### Task 1: 仓库脚手架 + 配置加载

**Files:**
- Create: `pyproject.toml`, `.gitignore`, `.env.example`, `src/payback_mcp/__init__.py`, `src/payback_mcp/config.py`, `tests/test_config.py`

**Interfaces:**
- Produces:
  - `config.load_env(path: str | None = None) -> None`（默认 `<repo>/.env`；已存在的 os.environ 键不覆盖）
  - `config.get_config() -> DBConfig`；`DBConfig = dataclass(host:str, port:int, user:str, password:str, database:str)`，任一 env 缺失抛 `ConfigError`（env 前缀 `AGENT_MYSQL_`）

- [ ] **Step 1: `uv init --package` 建库骨架，写 `.gitignore`（含 `.env`、`.venv`、`__pycache__`）与 `.env.example`（5 个 `AGENT_MYSQL_*` 键）**
- [ ] **Step 2: 写失败测试 `tests/test_config.py`**

```python
def test_load_env_does_not_override_existing(monkeypatch, tmp_path):
    monkeypatch.setenv("AGENT_MYSQL_HOST", "from-os")
    f = tmp_path / ".env"; f.write_text("AGENT_MYSQL_HOST=from-file\nAGENT_MYSQL_PORT=3307\n", encoding="utf8")
    config.load_env(str(f))
    assert os.environ["AGENT_MYSQL_HOST"] == "from-os"
    assert os.environ["AGENT_MYSQL_PORT"] == "3307"

def test_get_config_requires_all_fields(monkeypatch):
    for k in ["HOST","PORT","USER","PASSWORD","NAME"]: monkeypatch.delenv(f"AGENT_MYSQL_{k}", raising=False)
    monkeypatch.setenv("AGENT_MYSQL_HOST","h"); ... # 其余四项也 set，然后逐个 delenv 断言 ConfigError；全 set 时 DBConfig(port 为 int)
```

- [ ] **Step 3: 跑 `uv run pytest tests/test_config.py -v`，确认 ImportError/FAIL**
- [ ] **Step 4: 实现 `config.py`（纯标准库：读文件、切 KEY=VALUE、跳过注释；get_config 校验并转型）**
- [ ] **Step 5: 跑测试确认 PASS；`git init` + commit `feat: scaffold repo with env config`**

### Task 2: db.py 连接与日期解析 + live 表名核实

**Files:**
- Create: `src/payback_mcp/db.py`, `tests/test_db.py`

**Interfaces:**
- Consumes: `DBConfig`（Task 1）
- Produces:
  - `db.connect(cfg: DBConfig) -> pymysql.connections.Connection`（`cursorclass=DictCursor`，`autocommit=True`，连接超时 5s）
  - `db.query_one(conn, sql: str, params: tuple) -> dict | None`（OperationalError/ProgrammingError → raise `DbQueryError(含 sql 表名线索)`；自定义异常类在本模块定义）
  - `db.resolve_trade_date(conn, table: str, date_str: str) -> tuple[str | None, str | None]`，返回 `(resolved_date_or_None, error_or_None)`；`table` 只允许白名单常量 `TABLES = {"market_data": "marketData", "short_term_data": "shortTermData"}`（值→trade_date 列名映射，防注入），SQL 用 `SELECT MAX(\`{col}\`) AS d FROM \`{table}\` WHERE \`{col}\` <= %s`
  - `db.normalize_date(raw: str, today: date) -> tuple[str | None, str | None]`：处理 `YYYY-MM-DD`/`today`/`yesterday`/`last_trade_day`（last_trade_day 按 yesterday 换算），非法格式返回 `(None, "unsupported date ...")`

- [ ] **Step 0（前置核实，产出写进本步）：拿到 live 库连接后 `SHOW TABLES; SHOW COLUMNS FROM short_term_data; SHOW COLUMNS FROM market_data;`，确认实际表名与 trade_date/shortTermData 等列名拼写；若与 TypeORM 默认推断不符，修正 `TABLES` 映射。无法连库时按默认推断写代码并在 Task 7 冒烟校正。**
- [ ] **Step 1: 写失败测试（全部用 FakeConn，不打真库）**

```python
def test_normalize_relative_dates():
    assert db.normalize_date("today", date(2026,10,13))[0] == "2026-10-13"
    assert db.normalize_date("yesterday", date(2026,10,13))[0] == "2026-10-12"
    assert db.normalize_date("2026-13-99", date(2026,10,13))[1] is not None   # Review Focus 2
    assert db.normalize_date("abc", date(2026,10,13))[1] is not None

def test_resolve_uses_table_column_map():
    conn = FakeConn(rows=[{"d": "2026-10-10"}])
    got, err = db.resolve_trade_date(conn, "market_data", "2026-10-11")
    assert got == "2026-10-10" and err is None
    assert conn.last_params == ("2026-10-11",)          # 参数化，非拼接
    with pytest.raises(ValueError): db.resolve_trade_date(conn, "users", "2026-10-11")  # 白名单外

def test_resolve_empty_returns_found_false_shape():
    conn = FakeConn(rows=[{"d": None}])
    got, err = db.resolve_trade_date(conn, "market_data", "2020-01-01")
    assert got is None and err is None                   # Review Focus 1：调用方组 found:false
```

- [ ] **Step 2: `uv run pytest tests/test_db.py -v` 确认 FAIL**
- [ ] **Step 3: 实现 db.py；FakeConn 放测试文件内（记录 last_sql/last_params、按预设 rows 应答）**
- [ ] **Step 4: 测试 PASS；commit `feat: db connection, table allowlist, relative-date resolution`**

### Task 3: FastMCP 可启动空壳

**Files:**
- Create: `src/payback_mcp/server.py`, `tests/test_server_smoke.py`

**Interfaces:**
- Consumes: config（Task 1）
- Produces: `server.create_server(conn_factory=db.connect) -> FastMCP`；`server.main()`（stdio run）；pyproject 增加 `[project.scripts] payback-mcp = "payback_mcp.server:main"` 与 mcp 依赖

- [ ] **Step 1: `uv add mcp pymysql python-dotenv`（dotenv 若 Task 1 未用标准库实现则去掉——以 Task 1 实际实现为准，保持依赖最小）**
- [ ] **Step 2: 写失败冒烟测试**

```python
def test_server_lists_registered_tools():
    m = server.create_server(conn_factory=lambda: None)   # 冒烟不触库
    tools = anyio.run(_list, m)   # 经 mcp 的 in-memory client 或 FastMCP._tool_manager 拿列表
    assert {"get_market_overview","get_limit_up_structure","get_even_board_ladder"} <= {t.name for t in tools}
```

（Task 3 阶段此测试应 FAIL——还没有三个 tool；本任务先以 `_ping` 占位 + create_server 可实例化 + `uv run payback-mcp` stdio 起停成功为 PASS 标准，上面的三工具断言留到 Task 7 转绿。）
- [ ] **Step 3: 实现 create_server/main：读 env → connect → 注册；连接失败不退出进程，注册降级为返回 error 的 tool（Review Focus 4）**
- [ ] **Step 4: 手工验证 stdio：`echo` 一条 initialize JSON-RPC 或用 `uv run mcp dev src/payback_mcp/server.py`（MCP Inspector）确认可握手；commit `feat: FastMCP stdio skeleton`**

### Task 4: get_market_overview

**Files:**
- Create: `src/payback_mcp/tools/market_overview.py`, `tests/test_market_overview.py`

**Interfaces:**
- Consumes: `db.query_one`, `db.normalize_date`, `db.resolve_trade_date`（Task 2）
- Produces: `fetch_market_overview(conn, raw_date: str, today: date) -> dict`，成功键：`requested, data_as_of, trade_date, shangzheng_point, shangzheng_rise_and_fall, shenzheng_point, chuangye_point, beizheng50_point, rise_amount, fall_amount, market_turnover, daily_limit_income, market_score`（列名→snake 输出键由本函数映射；只输出实体真实存在的列——spec 拍板③，深证/创业板无涨跌幅列）

- [ ] **Step 1: 写失败测试（FakeConn 预置一行 marketData 假数据）**

```python
def test_happy_path_maps_columns_to_output_keys(): ...
def test_date_before_earliest_row_returns_found_false():   # conn rows 使 resolve 得 None
    out = fetch_market_overview(FakeConn(rows=[{"d": None}]), "2020-01-01", date(2026,10,13))
    assert out == {"requested": "2020-01-01", "found": False}
def test_missing_table_returns_error():                      # FakeConn 抛 OperationalError(1146)
    assert "error" in fetch_market_overview(FakeConn(raise_=pymysql.err.OperationalError(1146, "no such table: market_data")), "today", date(2026,10,13))
```

- [ ] **Step 2: 跑测试确认 FAIL**
- [ ] **Step 3: 实现：normalize→resolve→`SELECT ... WHERE trade_date=%s`→映射 dict；`Decimal` 转 float**
- [ ] **Step 4: PASS；把函数注册进 server.py（`@mcp.tool` 包装，docstring 写明日期参数语义）；commit `feat: get_market_overview tool`**

### Task 5: get_limit_up_structure

**Files:**
- Create: `src/payback_mcp/tools/limit_up_structure.py`, `tests/test_limit_up_structure.py`

**Interfaces:**
- Consumes: Task 2 db 层，模式与 Task 4 完全一致
- Produces: `fetch_limit_up_structure(conn, raw_date, today) -> dict`，键：`requested, data_as_of, trade_date, daily_limit_quantity, daily_limit_open_quantity, daily_limit_return_seal_quantity, down_limit_quantity, sealing_rate, market_height, even_board_amount, cycle`

- [ ] **Step 1-2: 测试同 Task 4 三态（happy/found_false/error），断言 `market_height` 等键名 → FAIL**
- [ ] **Step 3: 实现并注册；commit `feat: get_limit_up_structure tool`**

### Task 6: get_even_board_ladder（含 JSON 解析层）

**Files:**
- Create: `src/payback_mcp/tools/ladder_parse.py`, `src/payback_mcp/tools/even_board_ladder.py`, `tests/test_ladder_parse.py`, `tests/test_even_board_ladder.py`

**Interfaces:**
- Consumes: Task 2 db 层
- Produces:
  - `ladder_parse.parse_ladder(raw: str | None) -> dict`（纯函数）：输入原始 JSON 字符串（结构 `{maxHeight:int, yizi:int, gaobiao?:[stock...], "1":[stock...], "2":[...]}`），输出 `{"max_height":..., "yizi":..., "levels":[{"level":int,"stocks":[{name,code,plate_level2,turnover_rate,reason,gainian,turnover,closing_funds,even_days,price,circulation_value,open_times,daily_time}]}]}`；剔除 `codeReverse`/None 值字段；坏 JSON/None → `raise LadderParseError`
  - `fetch_even_board_ladder(conn, raw_date, today, level: int | None = None, max_stocks: int = 60) -> dict`：level 给定则只返回该梯队，否则全部；返回 stock 总数超 max_stocks 时按 level 升序截断并 `"truncated": true`（Review Focus 5）

- [ ] **Step 1: 写 ladder_parse 失败测试**

```python
SAMPLE = '{"maxHeight":3,"yizi":2,"gaobiao":[{"name":"A","code":"600001","codeReverse":"100600001"}],"1":[{"name":"B","code":"600002","openTimes":0,"price":10.5,"dailyTime":null}],"3":[{"name":"C","code":"600003"}]}'
def test_keeps_business_fields_drops_internal():
    out = parse_ladder(SAMPLE)
    assert out["max_height"] == 3 and out["yizi"] == 2
    b = [s for lv in out["levels"] for s in lv["stocks"] if s["code"] == "600002"][0]
    assert "code_reverse" not in b and "daily_time" not in b          # None 值剔除
    assert b["open_times"] == 0                                        # 0 保留（Review Focus：None≠0）
def test_garbage_raises():
    with pytest.raises(LadderParseError): parse_ladder("{oops")
    with pytest.raises(LadderParseError): parse_ladder(None)
```

- [ ] **Step 2: FAIL → 实现 parse_ladder（camel→snake 键转换 + 剔除规则）→ PASS**
- [ ] **Step 3: 写 fetch_even_board_ladder 三态 + 截断测试（100 只股断言 truncated）→ FAIL → 实现（SELECT `evenBoardData` 列 → parse_ladder，LadderParseError 捕获为 `{"error":"ladder data unreadable", "requested":...}`，Review Focus 3）→ 注册 → commit `feat: even board ladder with tolerant parsing`**

### Task 7: 端到端验证 + 接入文档

**Files:**
- Modify: `tests/test_server_smoke.py`（三工具断言转绿）
- Create: `README.md`

**Interfaces:**
- Consumes: 全部前序任务
- Produces: 可交付的 Qoder CLI 配置示例

- [ ] **Step 1: Task 3 留下的三工具命名断言转绿：`uv run pytest -v`（全量单测）**
- [ ] **Step 2: live 冒烟（需 agent_ro 账号就绪；未就绪则此步标记 BLOCKED 交回用户，不得用高权限账号顶替）：用 `uvx mcp` inspector 或最小 JSON-RPC 脚本依次调三工具，问"昨天"，逐字段对照 `SELECT * FROM market_data ORDER BY id DESC LIMIT 1`；核对 Task 2 Step 0 的表名假设，有出入即修 `TABLES` 映射并重跑单测**
- [ ] **Step 3: README 写：uv 安装、.env 配置、只读账号 GRANT 语句（抄 spec §6）、Qoder CLI `mcpServers` 配置片段（command=`uv`, args=`["--directory","D:/workspace/github/payback-mcp","run","payback-mcp"]`）**
- [ ] **Step 4: 用户在 Qoder CLI 实测验收问题"昨天涨停家数和最高连板多少"→ 回答含正确数值与实际数据日期 → commit `docs: README with Qoder CLI setup`; tag v0.1.0**
