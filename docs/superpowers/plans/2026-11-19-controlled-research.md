# Agent 受控研究首批实施计划

> 实现方式：当前会话按 executing-plans 内联执行，测试先行；用户未要求提交，不执行 commit/push。

**Goal:** Agent 在现有行情工具不足时，可提交受控联网研究任务并获取可追溯结果。

**Architecture:** Agent 聚合现有 MCP 与可选研究工具源。独立有界线程池执行受控 HTTPS，模型仅提交白名单操作参数；任务结果独立保存，默认关闭，不执行生成代码。

**Tech Stack:** Python >= 3.11、标准库、现有 anyio/MCP/pytest；不新增依赖。

**Spec:** [Agent受控研究与临时工具方案](../../04-技术方案/Agent受控研究与临时工具方案.md)。

## 全局约束

- 中文核心逻辑注释、UTF-8；保留未提交数据和现有运行服务，不部署或提交。
- aiwencai 文档缺失，不推测地址；Podman 未运行，首批不提供宿主代码执行。
- 所有网络响应属于不可信数据，TLS 验证、DNS 公网校验、禁止重定向、大小与超时限制。
- 当前仅可信单用户；不能把随机任务 ID 当多租户授权机制。

## 审查重点

私网/重定向/凭据外送、未知参数和错误类型、响应过大、运行中取消、执行与业务成功混淆、服务退出和任务积压。

## Task 1：知识库归位

- [x] 写方案、审查结论、阶段范围与本计划。
- [x] 更新分类索引、README、三项目协作文档。
- [x] 执行现有索引覆盖及新增链接检查。

## Task 2：受控 HTTPS 与来源策略

Files: `payback-agent/src/payback_agent/research_http.py`、`research.py`；tests: `tests/test_research_http.py`、`tests/test_research.py`。

- [x] 先写失败用例：私网 DNS、TLS 域名、公网固定 IP、重定向、错误响应、超长结果、未知参数、密钥脱敏。
- [x] 实现仅 HTTPS/443 的固定 IP TLS 连接；公开文档与固定来源 API 分权。
- [x] 实现管理员 JSON 来源定义与 Brave 搜索配置；不允许模型指定凭据、HTTP headers、端点或操作方法。
- [x] 运行定向测试并验证未联网。

## Task 3：独立研究任务

Files: `research_jobs.py`；tests: `tests/test_research_jobs.py`。

- [x] 先测试队列满、异步返回、异常脱敏、取消优先、路径穿越、结果分段、留存上限。
- [x] 实现单 worker/最多四个活动任务、原子证据文件、进程内所有权、状态/结果/取消及资源清理。
- [x] 验证任务不占用行情 MCP，不支持任意代码与断点恢复。

## Task 4：Agent 接入与使用说明

Files: `tools_source.py`、`prompts/system.md`、`.env.example`、`.gitignore`、`README.md`；tests: `tests/test_tools_source.py`、`tests/test_prompt.py`。

- [x] 先验证默认工具源不变、启用后工具聚合和关闭清理、不覆盖同名 MCP 工具。
- [x] 接入研究能力：来源 → 提交 → 状态 → 分段结果/取消；任务未完成时明确给任务 ID，不忙轮询耗尽八轮。
- [x] 文档写明配置、失败状态、隐私边界和未实现项，提供无凭据的来源配置示例。
- [x] 全量 pytest、差异审查与知识库验证；不执行真实供应商付费调用。

## 执行记录

- 2026-11-19：确认知识库沿用 7 大分类与手工 `_index.md`，不引入另一套治理脚手架。
- 2026-11-19：当前目录有用户未跟踪 `data/`；主项目有运行产生的 dist 修改，全部保留。
- 2026-11-19：按用户“开始开发”交付首批受控取数；完整代码沙箱与恢复机制列入后续，不假装已完成整个路线图。

- 2026-11-19：首批实现完成，Agent 全量 281 passed / 5 skipped，新增 71 项回归；现有 210 项继续通过。
- 2026-11-19：独立复查修复慢流超时、截断响应、worker 清理异常、字符集和坏来源配置隔离；补物理队列与结果时间/摘要。
- Ruling: 研究队列首批随工具源会话结束，MCP 重建也会使旧 ID 失效；已写入方案、README 和测试边界，跨重连恢复后续实现。
- 2026-11-19：真实公开 HTTPS 冒烟读取 Python 官网 robots.txt 成功；未调用付费供应商、未配置 aiwencai、未启动沙箱或部署。
