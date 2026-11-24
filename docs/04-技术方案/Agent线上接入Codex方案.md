# Agent 线上接入 Codex 方案

> 最后验证：2026-11-12

本文记录当前实现和线上部署建议；方案尚未在线上验证。

整体部署、版本与备份入口见[项目部署操作手册](项目部署操作手册.md)；本文只补充 Codex 后端特有的运行要求。

## 当前链路

```text
浏览器 /agentApi/chat → 反向代理 → payback-agent /chat（SSE）
                                         ├─ codex exec → 模型服务
                                         └─ stdio → payback-mcp → 只读数据源
```

- 前端通过 `/agentApi/chat` 发送请求，开发环境的 Vite 代理会移除 `/agentApi` 前缀。生产环境需要配置等价转发。
- `payback-agent` 已实现 `codex` 后端：现有工具循环调用 Codex CLI 决定回答或调用工具，工具仍由 Agent 通过 MCP 执行。无需先迁移到 Codex SDK。
- 每次模型调用启动独立的临时 `codex exec` 进程；当前实现使用只读沙箱并关闭 shell、插件等功能。模型输出完成后才发送内容，不提供逐字流式输出，工具状态仍通过 SSE 发送。
- `/chat`、`/healthz` 和 `/sessions/{id}` 本身无鉴权。会话与长期偏好已通过独立 MySQL 账号持久化，进程内最多 64 个为缓存，不代表历史只保存在内存；当前服务为单 worker 串行处理请求，需评估排队和超时。文件复盘归档也需单独持久化。

## 部署步骤

1. 在运行 Agent 的服务器或容器中安装 `uv` 和 Codex CLI，部署 `payback-agent`、`payback-mcp` 及其依赖；配置 MCP 访问所需的只读数据源和网络。安装及认证以 [Codex CLI 官方文档](https://developers.openai.com/codex/cli) 为准。
2. 使用运行服务的同一系统账户完成 Codex 认证，并确保服务进程能够读取凭据。当前项目 README 采用 `codex login`；自动化环境也可参考 [官方非交互运行说明](https://learn.chatgpt.com/docs/non-interactive-mode)，在目标部署环境验证认证方式、权限和计费。凭据使用密钥管理系统注入，不提交代码、不暴露到浏览器或日志。
3. 按 `.env.example` 配置 Agent 的 `AGENT_MEMORY_MYSQL_*` 独立记忆库账号，再配置模型后端：

   ```ini
   AGENT_LLM_BACKEND=codex
   # 可选：Codex 可执行文件路径及有权限的模型
   AGENT_CODEX_COMMAND=codex
   # AGENT_CODEX_MODEL=<模型名>
   # 非同级目录部署时配置
   # PAYBACK_MCP_DIR=<payback-mcp目录>
   ```

   Codex 模式不需要 `AGENT_LLM_BASE_URL`、`AGENT_LLM_API_KEY` 和 `AGENT_LLM_MODEL` 这组网关配置。已有环境变量优先于 `.env`。
4. 在 Agent 目录启动 `uv run payback-agent --serve`，默认监听 `127.0.0.1:8300`。跨容器访问时改为监听容器网络地址，并通过网络策略限制访问。应由进程管理器或容器平台负责重启和日志管理。
5. 在生产网关为 `/agentApi/` 配置反向代理，将此前缀移除后转发到 Agent；禁用响应缓冲，并设置覆盖模型调用耗时的读取超时。Agent 单次 Codex 调用的超时为 180 秒，一次提问可能包含多次模型调用。

## 上线前必须确认

- **访问控制**：前端向 Chat、会话和记忆接口发送 NestJS 登录凭据。Agent 在读取数据或提交任务前校验凭据，仅允许 `AGENT_OWNER_ACCOUNT` 指定的账号。其余 Agent 路由由部署网关或内网限制访问。
- **数据与权限**：MCP 使用最小权限的只读账号；限制 Agent 运行账户对服务器文件、凭据和网络的访问。对外部模型服务的数据范围和费用进行确认。
- **容量与会话**：已完成问答通过 MySQL 持久化，重启不会清空持久历史；进行中的请求与内存缓存不会自动恢复。仍按单实例部署，避免重复归档调度，且现有会话/记忆没有按登录用户隔离，不能把数据库持久化等同于多租户访问控制。
- **验收**：使用服务账户确认 Codex 能启动并完成模型调用；检查 `/healthz`、代理转发和 SSE 事件；执行一次真实 MCP 数据查询、多轮追问以及认证失败、连接中断和超时场景。检查监控和日志不含密钥或不应暴露的数据。

## 后续可选方案

如需原生任务生命周期、事件流、中断或审批交互，可评估 Codex SDK 或 app-server；它们需要重新适配现有工具调用、SSE 和会话模型，不能视为当前已有能力。[OpenAI 官方集成层说明](https://developers.openai.com/blog/codex-as-a-platform)。

## 相关文档

- [环境配置](环境配置.md)
- [前端技术方案](前端技术方案.md)
- [payback-agent 设计](../superpowers/specs/2026-10-15-payback-agent-design.md)
