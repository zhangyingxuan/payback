# 受控研究剩余能力实施计划

> 按 executing-plans 内联实施，测试先行；保留工作区变更，不提交、不部署。

**Goal:** 研究任务跨 MCP 重连和进程重启可查询/显式恢复；模型生成的 Python 仅在真实隔离容器执行，可导出待审工具草案。

**Architecture:** AgentService 持有研究 runtime，CLI context 自主管理生命周期；任务请求和证据原子持久化；独立 worker 调用固定 Podman 容器，无宿主目录/凭据挂载，输入通过 stdin 传递，输出有界并重新校验。

**Tech Stack:** Python 标准库与现有 anyio/pytest、Podman rootless、管理员指定的固定摘要 Python 镜像。

**Spec:** [受控研究方案](../../04-技术方案/Agent受控研究与临时工具方案.md)。本轮明确扩展首批边界，不修改历史首批验证记录。

## 约束及待外部输入

- 不自动购买数据、安装 MCP、发布代码或扩大数据源授权。
- aiwencai 仍缺用户确认的接口文档和鉴权位置；完成通用对接能力，不猜其端点、分页或响应字段。
- 容器缺失或安全选项失败必须关闭代码执行，禁止降级为宿主 Python。
- 中断任务不自动重发网络请求；显式恢复创建新任务，执行时重查来源策略。
- 仅可信单用户；多租户认证仍非本次范围。

## Task 1：队列持久化与恢复

Files: `research_jobs.py`、`tests/test_research_jobs.py`。
- [x] 测试重启读取成功结果、中断状态、显式恢复、新权限生效、损坏记录和输入摘要。
- [x] 原子保存请求并恢复已存在的合法任务；中断状态不自动执行，结果仍校验摘要。
- [x] 任务关闭等待 worker 停止后再释放目录所有权，避免恢复时双写。

## Task 2：独立 runtime 生命周期

Files: `research_runtime.py`、`tools_source.py`、`serve.py`、相关测试。
- [x] 测试 MCP 重建不会取消研究任务、退出才关闭 runtime、默认关闭不变。
- [x] AgentService 持有 runtime，MCP context 借用；CLI context 仍拥有自己的 runtime。

## Task 3：无网络 Python 隔离执行

Files: `research_sandbox.py`、`research_jobs.py`、`tests/test_research_sandbox.py`。
- [x] 测试固定镜像、只读/无网络/非 root/资源限制、无宿主挂载/凭据、超时/取消/输出上限、无宿主回退。
- [x] 输入仅来自成功证据任务，校验 hash 后通过 stdin 传入；代码与输出大小有界。
- [x] 真实容器验证计算、网络阻断、只读目录、超时和取消，清理所有测试容器。

## Task 4：工具接入、候选导出与知识库同步

Files: `tools_source.py`、`research_jobs.py`、提示词、README、配置示例、知识库。
- [x] 工具新增显式 resume、python 类型和待审草案导出；不自动晋升或发布。
- [x] 端到端回归与独立审查；记录真实验收和未配置事项，检查临时文件、容器与索引。

## 执行记录

- 2026-11-19：已启动原先停止的本机 Podman VM，完成验收后恢复其停止状态。

- 2026-11-19：续批实现及独立复核通过；全量312 passed / 5 skipped，独立定向复核69项通过。
- 2026-11-19：真实rootless Podman通过UID/只读/无网络/无宿主凭据/CPU/内存/pids/NoNewPrivs/输出/超时/取消及语法诊断验证；没有真实供应商或付费API调用。
- 2026-11-19：修复64份边界启动清理、输入依赖保留、实际seccomp门禁、预检取消竞态、产物元数据摘要和资源释放。
- 待外部输入：aiwencai实际文档、鉴权配置位置和样例；不猜接口。多租户与正式发布仍需各自评审，未自动扩权或部署。

## Task 5：按既有后端实现接入爱问财（用户补充依据）

- [x] 查明 fetchUtil.ts 的首屏/分页地址、表单字段、createV 和响应路径；不修改后端接口或调度。
- [x] 新增 research_iwencai.py，固定Node签名程序、内置来源、元数据严格校验、有界分页和可取消回调。
- [x] 区分股东表/股票筛选、真实零/内外业务错误，规范化条件；分页-1201保留首屏但明确不完整。
- [x] 真实首屏/分页诊断、独立审查与全量338 passed / 5 skipped；更新知识库和环境键。
- 2026-11-19：原先“缺接口文档”的待办已由用户指出的后端源码关闭；无需额外OpenAPI Key。真实分页仍有上游业务错误，不声称完整名单或独立统计已验证。
