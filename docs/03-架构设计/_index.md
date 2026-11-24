# 架构设计 - 文档索引

> 最后验证：2026-10-13

| 触发关键词 | 文件 | 一句话说明 |
|------------|------|------------|
| Chat 页面, /agentApi/chat, SSE, Agent Worker, 交互时序 | `Chat调用链与交互时序.md` | 从前端发送、代理和流式事件到模型、MCP、MySQL 与 NestJS 的调用边界 |
| Agent 架构审查, LangChain, LangGraph, 单用户授权, Checkpoint | `Agent架构审查与LangChain对比.md` | 当前执行与状态边界、审查发现、所有者授权及框架选型条件 |
| 三项目, Agent, MCP, AI复盘, 跨项目, 工具 | `三项目协作与AI复盘.md` | 三个项目的当前职责、调用链、接口和数据边界 |
| 架构, 全景, 模块关系, 端口, 拓扑, 服务发现 | `系统全景.md` | 全局视角：包职责、数据流、端口、部署拓扑 |
| MCP, agent, 架构草稿, roadmap | `../mcp-agent/2026-10-13-pay-agent-mcp-architecture.md` | pay-agent-mcp 早期 TS 架构草稿（已被取代，仅参考） |

> ADR 决策记录目录（`决策记录/`）暂未启用，出现重大架构决策时按 `001-{主题}.md` 编号创建。
