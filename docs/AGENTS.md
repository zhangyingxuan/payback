# PayBack - AI 上下文

> 本文件是 AI 代理的路由表。先读本文件，再按「路由规则」读取目标文件。不要一次全读。

---

## 1. 项目概述（一句话）

PayBack 是一个个人 A 股短线交易复盘/盯盘系统：定时爬取同花顺/问财行情数据入库 MySQL，提供 Vue3 看盘后台，并向企微/飞书推送快讯与早盘竞价消息。

---

工作区还包含同级的 `payback-agent` 与 `payback-mcp`；跨项目链路和当前工具清单见 `03-架构设计/三项目协作与AI复盘.md`。

## 2. 代码结构（文件在哪）

```
payback/
├── packages/
│   ├── client/src/                  # Vue3 看盘前端（dev 端口 8888）
│   │   ├── views/                   # dashboard、charts(盯盘)、article、news、shortTerm、systemConfig 等
│   │   ├── components/              # header/sidebar/plate/stock/tags/calendar 等
│   │   ├── api/                     # payBack.ts、thsTrade.ts、systemConfig.ts、user.ts、article.ts、tonghuashun.ts
│   │   ├── store/                   # Pinia：permiss(权限)、sidebar、tags
│   │   ├── router/                  # index.ts + auth.ts(路由守卫)
│   │   └── config/                  # 全局配置
│   ├── server/src/                  # NestJS 主后端（端口 3000，全局前缀 /blowsysun）
│   │   ├── pay-back/                # 核心模块：12 个 service + 爬取 utils(playWrightUtil/tradeDateUtil/dataHealthUtil)
│   │   ├── auth/                    # JWT + svg-captcha 登录
│   │   ├── article/                 # 文章 CRUD
│   │   ├── users/                   # 用户查询（无 controller）
│   │   ├── scheduler-task/          # 动态 Cron 调度（config.ts = 任务清单，改定时任务先看这里）
│   │   ├── consul/                  # 服务注册/发现 + PUSH_SERVER TCP ClientProxy
│   │   └── filters/ middleware/ decorator/ utils/
│   ├── core/src/                    # 共享库：utils/(hexin-v 反爬 token、asynTaskIterator) + config/(问财查询语句集)
│   ├── push-server/src/             # TCP 微服务（3001，非 HTTP）：财联社快讯 → 企微/飞书
│   ├── webhook-server/src/          # Gitee webhook 自动部署（3002）
│   └── wxPusher/src/                # Wechaty 机器人原型，未接入主链路
├── docs/                            # 知识库（详见路由规则）
│   ├── superpowers/                 # 计划/设计工件（superpowers skill 产物，原位保留）
│   └── mcp-agent/                   # MCP 早期架构草稿（已被取代，仅 roadmap 参考）
├── docker-compose.yml               # client(8080)+server(3000)+mysql(5.7)
├── docker-compose-consul.yml        # Consul 1.10.1 dev agent（宿主 18500→8500）
├── dockerfile                       # Playwright 1.35 抓取环境镜像
└── lerna.json / nx.json / pnpm-workspace.yaml
```

---

## 3. 知识库路由规则（两级路由）

先按意图定位分类，再读分类索引找具体文件。最多读 3 个文件。

| 用户意图 | 分类索引 |
|----------|----------|
| 功能、需求、验收标准、商业化 | `01-需求分析/_index.md` |
| 业务流程、术语、采集时间线 | `02-业务梳理/_index.md` |
| 架构、设计决策、服务拓扑 | `03-架构设计/_index.md` |
| 开发、联调、环境、报错、部署 | `04-技术方案/_index.md` |
| API 接口、数据库表 | `05-API文档/_index.md` |
| 技术栈、规范、发布、monorepo | `06-开发规范/_index.md` |
| 测试、用例、回归 | `07-测试用例/_index.md` |

**步骤**：读本文件 → 匹配分类 → 读 `_index.md` → 按触发关键词匹配文件 → 读目标文件。
**不确定时先读 `03-架构设计/系统全景.md` 建立全局认知。**

---

## 4. 硬约束（不能做什么）

### Monorepo 通用

| 约束 | 原因 |
|------|------|
| 只用 pnpm，内部包依赖写 `workspace:*` | npm/yarn 无法解析 workspace 协议 |
| Node >= 22 | 根 package.json engines 锁定 |
| 不改 pnpm-workspace.yaml 的 overrides（axios>=1.7.4、vite>=7、ws、multer 等） | 安全漏洞统一治理 |
| 构建走 `lerna run build`（nx 编排，build 依赖 ^build） | 绕过会导致 core 未先构建 |

### 后端（NestJS 9 / TypeORM）

| 约束 | 原因 |
|------|------|
| NestJS 是 9.x，禁止按 10/11 的新写法生成（如 standalone API、新生命周期装饰器） | server 依赖 `@nestjs/*@^9.4.0`（push-server 混用 9+10 的 microservices，仅客户端代理） |
| MySQL 5.7 + `mysql` 驱动 2.18.1，不是 mysql2；不用 MySQL 8 特性（窗口函数、CTE、默认 utf8mb4_0900 排序） | 版本锁定 |
| TypeORM `synchronize: true`：改 entity 会直接改线上表结构，加字段必须评估存量数据 | 无迁移脚本机制 |
| 全局路由前缀 `/blowsysun`；全局 JwtAuthGuard 生效，公开接口必须显式 `@Public()` | main.ts 全局守卫 |
| 定时任务只能通过 `scheduler-task/config.ts` + SchedulerTaskService 动态注册（Asia/Shanghai、防重入、一次性任务自动删除）；`@Cron` 静态装饰器已废弃 | 任务需可开关/重试/告警 |
| 不引入 Swagger 端点前先补 main.ts 的 SwaggerModule.setup（依赖已装但未挂载） | 现状如此 |
| Playwright 抓取逻辑须兼容镜像内固定版本 playwright@1.35 + firefox | dockerfile 锁 `v1.35.0-jammy` |
| push-server 是 TCP 微服务（3001），经 Consul 服务名 `payBack_pushServer_<env>` 发现，不是 HTTP 接口 | 通信协议固定 |

### 前端（Vue 3 / Vite 7）

| 约束 | 原因 |
|------|------|
| Element Plus 由 unplugin-vue-components 按需自动导入，不手写全量引入 | 已配置 ElementPlusResolver |
| 路由是 hash 模式（VITE_ROUTER_HISTORY） | 部署于 nginx 子路径（base='./'） |
| 请求走 `/blowsysun`、`/tonghuashun`、`/thsNews`、`/thsDq` 代理前缀，不写死域名 | vite.config.ts proxy + 多环境 .env |
| `pnpm build` 先跑 `vue-tsc --noEmit`，类型错误即构建失败——禁止用 `as any` 绕过 | 质量门禁 |
| dev 环境 core 别名直指 `../core/src/main.ts`，改 core 会同时热影响 client 和 server，保持向后兼容 | vite alias |

---

## 5. 代码→文档同步规则

| 代码变更 | 必须检查文档 |
|----------|-------------|
| `packages/server/src/**/*.controller.ts` | `05-API文档/接口文档.md` |
| TypeORM entity（`@Entity` 类，位于 `packages/server/src/pay-back/` 等） | `05-API文档/数据库设计.md` |
| `packages/server/src/scheduler-task/config.ts` | `04-技术方案/后端技术方案.md`、`02-业务梳理/业务流程.md` |
| `packages/core/src/config/index.ts`（问财查询语句） | `02-业务梳理/术语表.md`、`04-技术方案/后端技术方案.md` |
| `packages/client/src/views/**` 新增页面/路由 | `04-技术方案/前端技术方案.md`、`01-需求分析/功能需求清单.md` |
| 同级 `payback-agent`、`payback-mcp` 的接口、工具或数据口径变更 | `03-架构设计/三项目协作与AI复盘.md`，并核对相关客户端和各仓库 README |
| `packages/*/package.json` 依赖变更 | `06-开发规范/技术栈.md` |
| `docker-compose*.yml`、`.env*`、`nginx.conf` | `04-技术方案/环境配置.md` |
| push-server `@EventPattern` / webhook 流程 | `04-技术方案/推送与部署方案.md` |

---

## 6. 维护机制

- **文档保鲜**：每份文档头部 `> 最后验证：YYYY-MM-DD`，超 90 天视为过期
- **过期检查**：`bash scripts/check-staleness.sh`（加 `--full` 检查断链）
- **索引覆盖**：`bash scripts/check-index-coverage.sh`
- **Git 钩子**：`bash scripts/install-hooks.sh` 安装 pre-commit 提醒
- **完整制度**：`docs/维护制度.md`
