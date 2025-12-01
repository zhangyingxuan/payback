# Pay-Back WxPusher - 微信推送服务

<a href="https://nestjs.com/">
    <img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" />
</a>

<a href="https://github.com/nestjs/nest">
    <img src="https://img.shields.io/badge/nestjs-9.0.0-red.svg" alt="nestjs">
</a>
<a href="https://github.com/wechaty/wechaty">
    <img src="https://img.shields.io/badge/wechaty-1.18.1-green.svg" alt="wechaty">
</a>
<a href="https://github.com/microsoft/TypeScript">
    <img src="https://img.shields.io/badge/typescript-4.7.4-blue.svg" alt="typescript">
</a>
<a href="https://github.com/node-fetch/node-fetch">
    <img src="https://img.shields.io/badge/node--fetch-2.6.9-orange.svg" alt="node-fetch">
</a>

## 📋 项目概述

Pay-Back WxPusher 是基于 NestJS + Wechaty 的微信个人号推送服务，为 Pay-Back 项目提供微信个人号消息推送功能。项目利用微信网页版协议实现消息自动推送，支持多种消息格式和智能回复功能。

## 🏗️ 技术架构

### 核心技术栈

- **后端框架**: NestJS 9.0.0 + Express
- **微信机器人**: Wechaty 1.18.1 + 多协议支持
- **微信协议**: wechaty-puppet-wechat4u + wechaty-puppet-wechat
- **消息处理**: 智能消息路由和回复机制
- **配置管理**: @nestjs/config + 环境变量配置

### 架构特性

- **微信集成**: 基于 Wechaty 框架的微信机器人集成
- **多协议支持**: 支持多种微信协议和登录方式
- **消息路由**: 智能消息分发和回复处理
- **二维码登录**: 支持扫码登录和会话管理
- **插件系统**: 可扩展的插件机制

## 📊 业务架构

### 核心业务模块

#### 1. 微信机器人模块 (Wechaty Bot)

- **自动登录**: 支持二维码扫码登录
- **消息监听**: 实时监听微信消息
- **智能回复**: 基于关键词的自动回复
- **会话管理**: 微信会话状态管理

#### 2. 消息推送模块 (Message Push)

- **定向推送**: 向指定联系人推送消息
- **群组推送**: 支持微信群消息推送
- **消息格式**: 支持文本、图片、链接等格式
- **推送策略**: 智能推送频率控制

#### 3. 事件处理模块 (Event Handler)

- **登录事件**: 登录成功/失败事件处理
- **消息事件**: 消息接收和发送事件处理
- **扫描事件**: 二维码扫描状态监控
- **异常处理**: 网络异常和登录异常处理

### 系统架构设计

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Pay-Back      │    │   WxPusher      │    │   WeChat        │
│   Server        │◄──►│   Service       │◄──►│   Web API       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                          │
                              ▼                          ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Message       │    │   Event         │    │   QR Code       │
│   Router        │◄──►│   Handler       │◄──►│   Scanner       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 消息处理流程

```
1. 微信登录 → 2. 消息监听 → 3. 事件处理 → 4. 智能回复 → 5. 消息推送
```

## 🚀 部署架构

### 开发环境部署

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run start:dev

# 服务端口: 3002 (默认)
```

### 生产环境构建

```bash
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

EXPOSE 3002
CMD ["node", "dist/main"]
```

### 微信协议配置

项目支持多种微信协议：

```typescript
// wechaty-puppet-wechat4u - 微信网页版协议
// wechaty-puppet-wechat - 微信PC版协议
// wechaty-puppet-padlocal - PadLocal协议（需token）

const bot = WechatyBuilder.build({
  name: 'ding-dong-bot',
  puppet: 'wechaty-puppet-wechat4u', // 选择协议
});
```

### 环境配置管理

项目支持多环境配置：

- `.env.dev` - 开发环境配置
- `.env.prod` - 生产环境配置

关键配置项：

- 微信协议选择
- 机器人名称配置
- 服务端口配置
- 日志级别配置

## 🔧 开发指南

### 项目结构规范

```
src/
├── app.module.ts          # 应用根模块
├── main.ts               # 应用入口文件
├── app.controller.ts     # 控制器
├── app.service.ts        # 服务层
├── utils/                # 工具模块
│   ├── ding-dong-bot.ts # 微信机器人核心
│   └── portManager.ts   # 端口管理工具
├── decorator/            # 装饰器模块
│   └── public.decorator.ts
└── filters/              # 过滤器模块
    └── HttpExceptionFilter.ts
```

### 微信机器人配置

```typescript
// ding-dong-bot.ts - 微信机器人配置
export function getRobotInstance() {
  const bot = WechatyBuilder.build({
    name: 'ding-dong-bot',
    puppet: 'wechaty-puppet-wechat4u',
  });

  // 事件监听配置
  bot.on('scan', onScan); // 扫码事件
  bot.on('login', onLogin); // 登录事件
  bot.on('logout', onLogout); // 登出事件
  bot.on('message', onMessage); // 消息事件

  return bot;
}
```

### 消息事件处理

```typescript
// 消息处理函数
async function onMessage(msg) {
  // 过滤自己发送的消息
  if (msg.self()) return;

  // 记录消息日志
  log.info('StarterBot', msg.toString());

  // 关键词回复
  if (msg.text() === 'ding') {
    await msg.say('dong');
  }
}
```

### API 接口规范

#### 微信推送接口

```typescript
// 推送消息到指定联系人
POST /wxpusher/message
{
  "contact": "联系人微信号",
  "message": "推送消息内容",
  "type": "text" // text/image/link
}

// 获取机器人状态
GET /wxpusher/status
{
  "status": "online/offline",
  "loginUser": "登录用户信息"
}
```

#### 事件监控接口

```typescript
// 获取扫码状态
GET /wxpusher/scan
{
  "status": "waiting/timeout/scanning",
  "qrcodeUrl": "二维码链接"
}

// 重启机器人服务
POST /wxpusher/restart
```

## 📈 功能特性

### 微信机器人特性

#### 1. 多协议支持

- **网页版协议**: wechaty-puppet-wechat4u
- **PC 版协议**: wechaty-puppet-wechat
- **PadLocal 协议**: wechaty-puppet-padlocal (需 token)
- **服务协议**: wechaty-puppet-service (需 token)

#### 2. 智能消息处理

- **关键词回复**: 基于关键词的自动回复
- **消息过滤**: 过滤自己发送的消息
- **会话管理**: 多会话并发处理
- **消息格式**: 支持多种消息格式

#### 3. 事件监控

- **登录状态**: 实时监控登录状态
- **扫码状态**: 二维码扫描状态监控
- **网络状态**: 网络连接状态监控
- **异常告警**: 异常事件告警通知

### 推送服务特性

#### 1. 定向推送

- **个人推送**: 向指定好友推送消息
- **群组推送**: 向指定群组推送消息
- **批量推送**: 支持批量消息推送
- **定时推送**: 定时任务消息推送

#### 2. 消息管理

- **消息队列**: 消息发送队列管理
- **频率控制**: 推送频率智能控制
- **重试机制**: 失败消息重试机制
- **状态跟踪**: 消息发送状态跟踪

#### 3. 安全机制

- **身份验证**: 推送身份验证机制
- **权限控制**: 推送权限分级控制
- **内容审核**: 消息内容安全审核
- **日志审计**: 操作日志完整记录

## 🔐 安全考虑

### 微信安全

- **协议安全**: 使用官方支持的微信协议
- **账号安全**: 避免账号被封禁风险
- **数据加密**: 敏感信息加密存储
- **权限控制**: 严格的推送权限控制

### 服务安全

- **接口认证**: API 接口身份认证
- **请求限制**: API 请求频率限制
- **输入验证**: 所有输入参数严格验证
- **异常处理**: 完善的异常处理机制

### 数据安全

- **消息加密**: 敏感消息内容加密
- **日志脱敏**: 日志中敏感信息脱敏
- **备份机制**: 重要数据定期备份
- **访问控制**: 数据访问权限控制

## 📊 监控与运维

### 服务监控

- **状态监控**: 机器人服务状态监控
- **性能监控**: 消息处理性能监控
- **错误监控**: 错误率和异常监控
- **网络监控**: 网络连接状态监控

### 日志管理

- **操作日志**: 用户操作日志记录
- **消息日志**: 消息收发日志记录
- **错误日志**: 系统错误日志记录
- **审计日志**: 安全审计日志记录

### 告警机制

- **服务异常**: 服务不可用告警
- **登录异常**: 微信登录失败告警
- **消息异常**: 消息推送失败告警
- **性能告警**: 性能指标异常告警

## 🤝 贡献指南

### 开发规范

1. **代码风格**: 遵循 NestJS 官方编码规范
2. **微信协议**: 使用官方支持的微信协议
3. **安全考虑**: 充分考虑微信账号安全
4. **测试覆盖**: 为关键功能添加单元测试

### 提交规范

1. **功能开发**: 基于功能分支进行开发
2. **代码审查**: 提交前进行代码检查和测试
3. **安全评估**: 评估微信账号安全风险
4. **文档更新**: 同步更新相关文档

### 注意事项

1. **微信限制**: 注意微信官方对机器人的限制
2. **账号安全**: 避免频繁操作导致账号被封
3. **协议选择**: 根据需求选择合适的微信协议
4. **合规使用**: 确保使用符合微信平台规则

## 📞 联系方式

- 项目维护者: yxuanzhang@tencent.com
- 项目仓库: [Gitee](https://gitee.com/chongqing-woteng/pay-back.git)

---

**无限未来 (Infinite Future) | 数字前沿 (Digital Frontier) | 云端智造 (Cloud Smart Manufacturing)**
