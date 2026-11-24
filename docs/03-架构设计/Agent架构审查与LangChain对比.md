# Agent 架构审查与 LangChain 对比

> 最后验证：2026-11-20

PayBack 的 `ask_events()` 已实现模型、工具、结果回填的循环。Agent 负责执行，MCP 提供行情工具，Starlette 通过 SSE 向 Vue 发送进度。主要差异在业务规则的组织方式、执行状态持久化和运行时治理。

| 维度 | PayBack | LangChain / LangGraph |
|---|---|---|
| 编排 | 自研模型循环，兼容 Gateway 和 Codex CLI，Agent 独占并复用 MCP stdio 会话 | `create_agent` 提供模型和工具循环及中间件。MCP 可通过适配器接入。Codex CLI 和现有工具生命周期仍需适配。 |
| 证据 | 对梯队图、全景和两日对比执行预取。跨轮回放可见问答，行情证据按当前问题重新查询。 | 可通过中间件或节点表达这些规则。启用检查点时仍需区分同一次执行的恢复与新一轮行情重查。 |
| 流式协议 | 前端消费 `session`、`delta`、`tool_result`、`done` 等 SSE 事件 | 框架提供模型增量、状态及自定义事件，HTTP 层可以映射到现有契约。 |
| 持久化 | MySQL 保存完成问答和显式偏好。研究任务独立持久化状态。 | LangGraph checkpointer 可保存执行步骤，store 可保存跨线程数据。需要配置持久化后端。 |

[模型循环](../../../payback-agent/src/payback_agent/loop.py) · [工具源](../../../payback-agent/src/payback_agent/tools_source.py) · [LangChain Agents](https://docs.langchain.com/oss/python/langchain/agents) · [MCP](https://docs.langchain.com/oss/python/langchain/mcp) · [Streaming](https://docs.langchain.com/oss/python/langchain/streaming) · [LangGraph Persistence](https://docs.langchain.com/oss/python/langgraph/persistence)

## 审查发现

1. **访问控制（本次已加固）**。原实现把会话和偏好边界交给部署网络。目前 Agent 复用 NestJS 的 JWT 身份校验，仅指定所有者可访问这批数据。框架迁移后，账号归属仍由应用定义。
2. **串行 Worker 与取消**。Chat、每日复盘和双图共用 Worker。慢模型调用会推迟后续任务。在途任务通常在下一次发送事件时才发现浏览器断开。先测排队与执行耗时，再决定是否拆分任务队列或增加独立 MCP 会话。
3. **Chat 中途重启**。Agent 在发送 `done` 前保存完整问答。中途退出后的重试从问题重新执行。研究任务会单独标记中断，并支持显式重新提交。如果需要恢复到已经完成的工作步骤，可在长任务上试验 LangGraph，并明确工具幂等性和证据时效。
4. **可观测性**。CLI 可传入 trace，HTTP 调用未接入同一追踪。可先在请求、模型和工具边界记录关联 ID、排队和阶段耗时，再评估运行时改造。

[Agent 队列、授权与落盘](../../../payback-agent/src/payback_agent/serve.py) · [研究任务](../../../payback-agent/src/payback_agent/research_jobs.py) · [CLI](../../../payback-agent/src/payback_agent/cli.py)

## 所有者授权与升级

- `/chat`、`/sessions`、`/sessions/{id}`、`/memories`、`/memories/{id}` 在访问存储或入队前校验 Bearer token。有效登录账号必须与 `AGENT_OWNER_ACCOUNT` 一致。匿名、凭据失效、其他账号分别按 401、401、403 响应。所有者未配置或身份服务异常时返回 503。
- 配置项指向原有单用户数据的所有者。现有 MySQL 数据无需迁移，更换所有者意味着移交全部现有服务端历史和长期偏好。多人共享需要单独的数据归属与迁移设计。
- 前端按账号缓存会话摘要和未同步内容。旧版无明确归属的本地快照保留在原存储键，升级后页面不会自动读取。服务端历史仍可由所有者载入。
- Agent 与 NestJS 分主机时，经 `AGENT_AUTH_PROFILE_URL` 指定可信身份服务。报告、双图和健康检查仍由部署网络限制访问。

[Agent 配置模板](../../../payback-agent/.env.example) · [部署手册](../04-技术方案/项目部署操作手册.md) · [本地会话存储](../../packages/client/src/store/chat.ts)

当前单用户复盘保留自研循环。先补 HTTP 可观测性与整轮执行预算。需要跨进程续跑、人工确认后继续或分支独立重试时，再选一条研究工作流验证 LangGraph。

## 相关文档

- [Chat 调用链与交互时序](Chat调用链与交互时序.md)
- [三项目协作与 AI 复盘](三项目协作与AI复盘.md)
