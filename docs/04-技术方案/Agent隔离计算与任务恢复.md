# Agent 隔离计算与任务恢复

> 最后验证：2026-11-19
> 状态：续批实现，未部署、未启用本机真实配置。

## 当前能力与责任

沿用[受控研究方案](Agent受控研究与临时工具方案.md)的取数和权限边界，补齐跨 MCP 重连、进程重启后的证据恢复、显式重试、Python 容器计算与待审工具导出。实现位于同级 payback-agent，不修改行情 MCP 的权限或 Codex CLI 的只读限制。

| 模块 | 职责 |
|---|---|
| research_runtime.py | AgentService 持有的研究资源，MCP context 借用，CLI context 自主管理 |
| research_jobs.py | OS 单写锁、请求/证据原子持久化、恢复、依赖保留、完整摘要校验和草案导出 |
| research_sandbox.py | 固定 Podman 命令、安全预检、无网络隔离运行、有界 stdin/stdout、超时与取消 |
| tools_source.py | 现有行情工具与研究工具聚合；新增 python、resume、export_tool |

## 生命周期与恢复语义

- MCP 会话丢失/重建只释放行情连接，不取消研究队列；服务退出才关闭研究 runtime。
- 同一研究目录仅一个写实例，Windows 使用 msvcrt 锁，POSIX 使用 flock；OS 退出自动释放，不能用 PID 文件假装互斥。
- 成功/失败/取消记录可恢复查询；旧 queued/running 标记 interrupted，**不自动重发**。
- 用户要求恢复时 `research_resume(task_id)` 创建新 ID，保留 resumed_from，输入摘要通过后按当前策略重新执行。可能重新调用付费 API，不等于恰好一次执行。
- CLI 退出取消其活动任务；仍可在下次运行显式恢复。已超过保留期限、被容量清理或证据损坏的任务不可恢复。
- 保留最多 64 份产物和 24 小时的延迟清理策略；新提交和活动计算依赖的输入不被抢先删除。启动时不为尚未提交的新任务提前腾位。
- request.json 明文保存查询参数、URL 和代码；**不再是仅存摘要**。不保存宿主注入的凭据，仍须保护目录 ACL、备份与留存。
- 关闭设置取消状态，最多等待 worker 一秒；未结束时继续持有目录锁，直到旧线程退出，避免恢复时双写。

## Python 能力契约

使用 `research_start`，kind 为 python，arguments 为 code 和 inputs（别名 → 成功证据任务 ID）。最多四份输入，读取完整脱敏文本，先校验文本及完整产物摘要。代码通过 `inputs[别名]` 访问文本，使用标准库计算，将 JSON 可序列化结果赋值给 result，不额外 print。

没有 `AGENT_RESEARCH_PYTHON_IMAGE` 时 Python 拒绝运行；镜像格式错误只禁用 Python，不阻断公开取数。镜像必须是预先审核并下载的 `sha256:64位本地ID` 或 `仓库@sha256:摘要`，运行时禁止自动拉取。模型不能指定镜像、环境变量、挂载、依赖安装或容器选项。

| 边界 | 约束 |
|---|---|
| 权限 | rootless Podman、UID 65534、cap-drop=all、no-new-privileges、seccomp；显式私有 PID/IPC/UTS/cgroup 命名空间 |
| 文件/网络 | 根目录只读，无宿主目录/引擎 socket 挂载，无网络，无宿主凭据 |
| 资源 | 128 MiB 内存、1 CPU、32 进程、16 MiB tmpfs、64 文件描述符、CPU 时间10秒 |
| 输入/输出 | 代码32 KiB、stdin总量1 MiB、stdout+stderr总量256 KiB |
| 时间 | 宿主20秒监控，容器端 timeout 兜底，取消后强制清理特定随机名称容器 |

引擎预检要求 rootless、cgroup v2、seccomp 与 CPU/memory/pids 控制器。可信 bootstrap 在执行代码前重新校验实际 UID、Seccomp=2、NoNewPrivs=1、CapEff=0 和容器 cgroup 资源值；不能只相信宿主支持 seccomp。隔离检查失败、镜像/引擎不可用、超时、非法 JSON、非有限数和输出过大都返回失败，不在宿主运行代码。

输入仅通过 stdin，容器输出在独立读取线程中截断并触发终止；不使用无界 communicate。请求参数、代码和凭据不出现在容器命令行；解释器使用 -I/-S，运行镜像只提供标准库。容器取消不能撤回先前已经完成的外部取数。

容器内语法/执行错误回传有界异常类型、行号和最多500字符信息，供模型修正新代码；引擎原始报错不回显。诊断仍属于不可信数据，不授予额外权限。宿主统一将取数和计算产物标记 domain_verified=false，不能由脚本输出自行改为已验证。

## 草案与正式工具

`research_export_tool(task_id,name)` 仅允许成功 Python 任务，导出代码、别名、镜像、输入证据和结果摘要为 tool-draft.json。状态固定 review_required，domain_verified 仍为 false。

草案与原任务同样会过期，应在过期前进入正常代码评审与固定样本测试。不会修改生产目录、注册新 MCP、安装依赖、扩权或发布；人工评审与正式发布不是模型生成脚本就能替代的步骤。

## 验证与待外部输入

已完成真实 rootless Podman 验证：非 root、无宿主凭据、只读目录、无网络、内存/CPU/pids、NoNewPrivs、超长输出、无限循环超时与取消。冒烟入口为 Agent `scripts/smoke_research_sandbox.py --image <固定摘要>`，不自动安装或购买服务。

2026-11-19 全量回归 312 通过、5 跳过；独立复核的定向检查69项通过。修复64份保留边界重启、预检取消竞态、容器实际seccomp、输入依赖清理和资源释放问题；新增真实容器语法错误行号验证。单元测试不调用真实供应商，不以测试通过代表业务统计口径已验证。

爱问财现已依据用户指出的既有后端实现接入，复用现有地址与共享 createV；无需另找 OpenAPI 文档或密钥。首屏可用，分页内部业务错误明确保留样本并标记不完整。上游报告数不能冒充独立全市场复核，具体见[爱问财接入](Agent爱问财接入.md)。

当前仍为可信单用户入口，无多租户认证和产物授权；容器隔离也不是绝对安全保证，运行账户和引擎需正常更新。DNS 超时仍由操作系统管理。

## 相关文档

- [原方案与首批审查](Agent受控研究与临时工具方案.md)
- [续批实施记录](../superpowers/plans/2026-11-19-research-completion.md)
- [受控研究回归用例](../07-测试用例/受控研究回归用例.md)
- [Podman run 官方选项](https://docs.podman.io/en/latest/markdown/podman-run.1.html)
