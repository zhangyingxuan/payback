# Pay-Back Core - 核心共享模块

<a href="https://github.com/microsoft/TypeScript">
    <img src="https://img.shields.io/badge/typescript-5.1.6-blue.svg" alt="typescript">
</a>
<a href="https://github.com/rollup/rollup">
    <img src="https://img.shields.io/badge/rollup-3.28.0-orange.svg" alt="rollup">
</a>
<a href="https://github.com/dayjs/dayjs">
    <img src="https://img.shields.io/badge/dayjs-1.11.9-green.svg" alt="dayjs">
</a>

## 📋 项目概述

Pay-Back Core 是 Pay-Back 项目的核心共享模块，为前后端提供统一的工具函数、配置管理和业务逻辑。项目采用 TypeScript + Rollup 构建，支持多环境打包和类型安全。

## 🏗️ 技术架构

### 核心技术栈

- **开发语言**: TypeScript 5.1.6
- **构建工具**: Rollup 3.28.0
- **日期处理**: Day.js 1.11.9
- **模块系统**: ES Modules + CommonJS

### 构建配置

项目支持多格式输出：
- **ES Modules**: `es/index.esm.js` - 现代浏览器和Node.js
- **CommonJS**: `lib/index.cjs` - 传统Node.js环境
- **UMD**: `lib/index.umd.js` - 浏览器全局变量
- **类型定义**: `es/types/index.d.ts` - TypeScript类型文件

### 开发工具链

- **代码检查**: ESLint + @rollup/plugin-eslint
- **代码转换**: @rollup/plugin-babel
- **模块解析**: @rollup/plugin-node-resolve
- **类型生成**: rollup-plugin-dts
- **代码压缩**: rollup-plugin-terser

## 📊 业务架构

### 核心功能模块

#### 1. 股票分析引擎
- **周期判断**: 基于市场数据判断当前市场周期（启动、发酵、高潮、退潮、冰点、混沌）
- **策略评估**: 涨停板策略、选股条件评估
- **预期分析**: 根据涨停时间和开板次数预测次日开盘表现

#### 2. 配置管理系统
- **选股条件**: 定义各种股票筛选条件和参数配置
- **市场参数**: 连板高度、涨停数量、跌停数量等关键指标
- **策略配置**: 个人偏好条件、基础筛选条件

#### 3. 工具函数库
- **时间处理**: 日期格式化和时间计算
- **数据验证**: 股票代码验证、主板判断
- **算法工具**: 异步任务迭代器、数据转换

### 核心算法

#### 市场周期判断算法

```typescript
// 判断当前市场周期状态
export function getCurrentCycle(currentTradingDayData: any, lastTradingDayData: any) {
  // 基于连板高度、涨停数量、跌停数量等指标
  // 判断市场处于启动、发酵、高潮、退潮、冰点、混沌等状态
}
```

#### 涨停策略算法

```typescript
// 涨停自选策略
export function dailyLimitOptionalStrategy(stock: any, currentLevel: number | string) {
  // 根据股票属性和连板级别判断是否加入自选
  // 主板个股、股价低于30、流通市值20-120亿
}
```

#### 开盘预期算法

```typescript
// 根据涨停特征预测次日开盘表现
export function getExpected(stock: any) {
  // 基于开板次数、最终涨停时间
  // 预测高开5%、4%、3%、0-2%、-2-2%、-2%等
}
```

## 🚀 部署架构

### 构建配置

```bash
# 安装依赖
pnpm install

# 清理构建目录
pnpm run clean

# 构建项目
pnpm run build

# 开发模式（监听文件变化）
pnpm run dev
```

### Rollup 配置说明

```javascript
// rollup.config.js
{
  input: 'src/main.ts',
  output: [
    { file: 'lib/index.cjs', format: 'cjs' },     // CommonJS
    { file: 'es/index.esm.js', format: 'esm' },   // ES Modules
    { file: 'lib/index.umd.js', format: 'umd' }   // UMD
  ],
  plugins: [
    // TypeScript支持、ESLint检查、代码压缩等
  ]
}
```

### 包管理配置

```json
// package.json exports配置
"exports": {
  ".": {
    "import": "./es/index.esm.js",      // ES Modules导入
    "require": "./lib/index.cjs",       // CommonJS导入
    "types": "./es/types/index.d.ts"    // 类型定义
  }
}
```

## 🔧 使用指南

### 安装依赖

```bash
# 在client或server项目中安装core模块
pnpm add pay-back-core

# 或使用workspace链接
pnpm link ../core
```

### 导入使用

#### ES Modules 方式

```typescript
import { getCurrentCycle, dailyLimitOptionalStrategy } from 'pay-back-core';

// 使用市场周期判断
const currentCycle = getCurrentCycle(currentData, lastData);

// 使用涨停策略
const shouldSelect = dailyLimitOptionalStrategy(stock, level);
```

#### CommonJS 方式

```javascript
const { getCurrentCycle, dailyLimitOptionalStrategy } = require('pay-back-core');

// 使用功能模块
```

### 配置管理

```typescript
import { params, personalPreferenceCondition } from 'pay-back-core/config';

// 使用选股条件配置
const condition = params.dailyLimitMoreThan1;
const preference = personalPreferenceCondition;
```

## 📈 功能特性

### 核心算法特性

#### 1. 智能周期判断
- **多维度分析**: 结合连板高度、涨停数量、跌停数量
- **状态识别**: 准确识别市场6种周期状态
- **动态调整**: 根据市场变化自动调整策略

#### 2. 精准选股策略
- **条件筛选**: 基于流通市值、股价、板块等多维度筛选
- **风险控制**: 自动排除ST股、退市股等高风险标的
- **个性化配置**: 支持个人偏好条件配置

#### 3. 开盘预期预测
- **时间分析**: 基于涨停时间和开板次数
- **概率评估**: 提供多种开盘预期概率
- **实战验证**: 经过实际交易数据验证

### 技术特性

#### 1. 类型安全
- **全面TypeScript**: 100% TypeScript覆盖，类型安全
- **接口定义**: 清晰的API接口和类型定义
- **编译检查**: 构建时类型检查，避免运行时错误

#### 2. 模块化设计
- **功能解耦**: 各功能模块独立，便于维护和扩展
- **接口清晰**: 统一的导入导出接口设计
- **依赖管理**: 最小化外部依赖，保持轻量级

#### 3. 多环境支持
- **格式兼容**: 支持ESM、CJS、UMD多种模块格式
- **环境适配**: 适配浏览器、Node.js等多种运行环境
- **工具链完善**: 完整的开发、构建、测试工具链

## 🔐 安全考虑

### 数据安全
- **输入验证**: 所有输入参数进行严格验证
- **边界检查**: 数值范围和边界条件检查
- **异常处理**: 完善的错误处理和异常捕获

### 算法安全
- **逻辑验证**: 核心算法经过实际数据验证
- **风险控制**: 内置风险控制机制
- **性能优化**: 算法性能优化，避免内存泄漏

## 📊 性能优化

### 构建优化
- **Tree Shaking**: 自动移除未使用代码
- **代码分割**: 按功能模块分割代码
- **压缩优化**: 生产环境代码压缩和优化

### 运行时优化
- **算法效率**: 核心算法时间复杂度优化
- **内存管理**: 避免内存泄漏和重复计算
- **缓存策略**: 合理使用缓存提高性能

## 🤝 贡献指南

### 开发规范

1. **代码风格**: 遵循TypeScript官方编码规范
2. **类型定义**: 为所有函数和接口提供完整类型定义
3. **文档注释**: 为公共API添加详细的文档注释
4. **测试覆盖**: 为新功能添加单元测试

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