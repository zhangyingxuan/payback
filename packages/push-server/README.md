# Pay-Back Push Server - 消息推送服务

<a href="https://nestjs.com/">
    <img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" />
</a>

<a href="https://github.com/nestjs/nest">
    <img src="https://img.shields.io/badge/nestjs-9.0.0-red.svg" alt="nestjs">
</a>
<a href="https://github.com/microsoft/TypeScript">
    <img src="https://img.shields.io/badge/typescript-4.7.4-blue.svg" alt="typescript">
</a>
<a href="https://github.com/consul/consul">
    <img src="https://img.shields.io/badge/consul-1.0.1-green.svg" alt="consul">
</a>
<a href="https://github.com/node-fetch/node-fetch">
    <img src="https://img.shields.io/badge/node--fetch-2.6.9-orange.svg" alt="node-fetch">
</a>

## 📋 项目概述

Pay-Back Push Server 是基于 NestJS + TypeScript 的微服务架构消息推送服务，为 Pay-Back 项目提供实时消息推送、新闻采集和告警通知功能。项目采用微服务架构，支持服务发现和分布式部署。

## 🏗️ 技术架构

### 核心技术栈

- **后端框架**: NestJS 9.0.0 + Microservices
- **微服务通信**: TCP Transport + @nestjs/microservices
- **服务发现**: Consul 1.0.1 + 服务注册发现
- **数据采集**: Node-fetch 2.6.9 + 同花顺API
- **消息推送**: 企业微信机器人API
- **配置管理**: @nestjs/config + 多环境配置

### 架构特性

- **微服务架构**: 基于NestJS微服务模块，支持TCP通信
- **服务发现**: 集成Consul实现服务注册和健康检查
- **实时推送**: 支持企业微信机器人消息推送
- **新闻采集**: 定时采集同花顺重要新闻信息
- **告警监控**: 系统状态监控和异常告警推送

## 📊 业务架构

### 核心业务模块

#### 1. 推送服务模块 (Push Module)
- **企业微信推送**: 集成企业微信机器人API
- **消息格式化**: 支持Markdown格式消息推送
- **多机器人支持**: 支持多个机器人同时推送
- **告警通知**: 系统服务告警和异常通知

#### 2. 新闻服务模块 (News Module)
- **新闻采集**: 定时采集同花顺重要新闻
- **消息过滤**: 基于颜色标识过滤重要新闻
- **实时更新**: 支持增量新闻数据采集
- **时间管理**: 新闻时间戳管理和去重

#### 3. 服务发现模块 (Consul Module)
- **服务注册**: 自动注册到Consul服务发现中心
- **健康检查**: 服务健康状态监控和上报
- **配置管理**: 动态配置更新和同步

### 微服务架构设计

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App     │    │   API Gateway   │    │   Push Server   │
│   (Vue 3)        │◄──►│   (NestJS)      │◄──►│   (Microservice)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                          │
                              ▼                          ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Consul        │    │   News API     │    │   WeChat Bot    │
│   (Service      │◄──►│   (同花顺)      │◄──►│   (企业微信)    │
│   Discovery)    │    └─────────────────┘    └─────────────────┘
└─────────────────┘
```

### 消息推送流程

```
1. 新闻采集 → 2. 消息过滤 → 3. 格式转换 → 4. 机器人推送
```

## 🚀 部署架构

### 开发环境部署

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run start:dev

# 微服务端口: 3001
```

### 生产环境构建

```bash
# 清理构建目录
pnpm run prebuild

# 构建生产版本
pnpm run build

# 启动生产服务
pnpm run start:prod
```

### Docker 部署

```dockerfile
# 多阶段构建
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
RUN pnpm run build

FROM node:18-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN pnpm install --production
COPY --from=builder /app/dist ./dist

EXPOSE 3001
CMD ["node", "dist/main"]
```

### 微服务部署配置

```yaml
# docker-compose.yml
version: '3.8'
services:
  consul:
    image: consul:latest
    ports:
      - "8500:8500"
    
  push-server:
    build: .
    ports:
      - "3001:3001"
    depends_on:
      - consul
    environment:
      NODE_ENV: production
      APP_NAME: push-server
      APP_HOST: push-server
      APP_PORT: 3001
```

### 环境配置管理

项目支持多环境配置：

- `.env.dev` - 开发环境配置
- `.env.prod` - 生产环境配置

关键配置项：
- Consul服务发现配置
- 企业微信机器人密钥
- 同花顺API配置
- 服务端口和主机配置

## 🔧 开发指南

### 项目结构规范

```
src/
├── app.module.ts          # 应用根模块
├── main.ts               # 微服务入口文件
├── push/                 # 推送服务模块
│   ├── push.controller.ts
│   ├── push.service.ts
│   └── push.module.ts
├── news/                 # 新闻服务模块
│   ├── news.controller.ts
│   ├── news.service.ts
│   ├── news.module.ts
│   └── utils/
│       └── fetchUtil.ts
├── consul/               # 服务发现模块
│   ├── consul.service.ts
│   ├── consul.module.ts
│   └── consul.interface.ts
└── portManager.ts        # 端口管理工具
```

### 微服务配置

```typescript
// main.ts - 微服务启动配置
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3001,
    },
  },
);
```

### 服务注册配置

```typescript
// app.module.ts - 服务注册
@Module({
  imports: [
    ConsulModule.forRoot(),
    NewsModule,
    PushModule,
  ],
})
export class AppModule implements OnModuleInit {
  async onModuleInit() {
    await this.consulService.register({
      name: config.get('APP_NAME'),
      address: config.get('APP_HOST'),
      port: Number(config.get('APP_PORT')),
    });
  }
}
```

### API接口规范

#### 推送服务接口

```typescript
// 告警通知接口
POST /push/notice
{
  "serviceName": "服务名称",
  "msgContent": "告警内容"
}

// 新闻推送接口
POST /push/news
{
  "newsTitle": "新闻标题",
  "msgContent": "新闻内容",
  "newsUrl": "新闻链接"
}
```

#### 新闻服务接口

```typescript
// 获取最新新闻
GET /news/latest
{
  "latestTime": "最新时间戳"
}

// 定时任务新闻采集
GET /news/task
```

## 📈 功能特性

### 推送服务特性

#### 1. 多格式消息支持
- **Markdown格式**: 支持富文本消息格式
- **颜色标注**: 涨跌关键字自动颜色标注
- **链接嵌入**: 支持股票和板块链接嵌入
- **时间戳**: 自动添加消息时间戳

#### 2. 多机器人推送
- **并行推送**: 支持多个机器人同时推送
- **负载均衡**: 消息分发到不同机器人
- **容错机制**: 单个机器人失败不影响其他

#### 3. 智能消息过滤
- **重要性判断**: 基于颜色标识过滤重要新闻
- **时间管理**: 增量采集避免重复推送
- **内容优化**: 自动格式化消息内容

### 新闻采集特性

#### 1. 实时数据采集
- **定时任务**: 基于NestJS Schedule定时采集
- **增量更新**: 基于时间戳的增量数据采集
- **错误处理**: 网络异常和API错误处理

#### 2. 智能过滤算法
- **颜色标识**: 基于color字段过滤重要新闻
- **时间管理**: 最新时间戳管理和更新
- **去重机制**: 避免重复消息推送

#### 3. 数据格式化
- **标签处理**: 自动提取股票和板块标签
- **链接生成**: 生成同花顺股票和板块链接
- **内容优化**: 消息内容自动优化和格式化

## 🔐 安全考虑

### 通信安全
- **微服务通信**: TCP传输层安全通信
- **API认证**: 企业微信API密钥认证
- **数据加密**: 敏感信息加密传输

### 服务安全
- **健康检查**: Consul健康状态监控
- **服务隔离**: 微服务间通信隔离
- **错误处理**: 完善的异常处理机制

### 数据安全
- **输入验证**: 所有输入参数严格验证
- **边界检查**: 数值范围和边界条件检查
- **日志记录**: 操作日志和安全审计

## 📊 监控与运维

### 服务监控
- **健康状态**: Consul健康检查监控
- **性能指标**: 服务响应时间和吞吐量
- **错误统计**: 推送失败率和错误类型

### 日志管理
- **访问日志**: API调用日志记录
- **错误日志**: 异常和错误信息记录
- **推送日志**: 消息推送成功失败记录

### 告警机制
- **服务异常**: 服务不可用告警
- **推送失败**: 消息推送失败告警
- **性能告警**: 响应时间超阈值告警

## 🤝 贡献指南

### 开发规范

1. **代码风格**: 遵循NestJS官方编码规范
2. **微服务设计**: 遵循微服务架构设计原则
3. **接口定义**: 清晰的API接口和类型定义
4. **测试覆盖**: 为关键功能添加单元测试

### 提交规范

1. **功能开发**: 基于功能分支进行开发
2. **代码审查**: 提交前进行代码检查和测试
3. **版本管理**: 遵循语义化版本规范
4. **文档更新**: 同步更新相关文档

## 📞 联系方式

- 项目维护者: yxuanzhang@tencent.com
- 项目仓库: [Gitee](https://gitee.com/chongqing-woteng/pay-back.git)

---

**无限未来 (Infinite Future) | 数字前沿 (Digital Frontier) | 云端智造 (Cloud Smart Manufacturing)**