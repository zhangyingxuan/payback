# Server 端响应速度优化实施计划

- [ ] 1. 实现 Redis 缓存模块

  - 安装 `@nestjs/cache-manager` 和 `cache-manager-redis-store` 依赖
  - 创建 `CacheModule` 配置，支持内存缓存和 Redis 缓存切换
  - 实现 `CacheService` 封装常用缓存操作（get/set/del/clear）
  - 添加缓存配置项到环境变量（REDIS_HOST、REDIS_PORT、CACHE_TTL 等）
  - _需求：1.1、1.4、1.5_

- [ ] 2. 实现缓存装饰器与拦截器

  - 创建 `@Cacheable()` 装饰器，支持自动缓存接口响应
  - 创建 `@CacheEvict()` 装饰器，支持数据变更时自动清除缓存
  - 实现 `CacheInterceptor` 拦截器，统一处理缓存逻辑
  - 添加缓存降级机制，Redis 不可用时自动切换到内存缓存或直接查库
  - _需求：1.1、1.2、1.3_

- [ ] 3. 热点接口添加缓存

  - 识别项目中的热点查询接口（如列表查询、配置数据等）
  - 为热点接口添加 `@Cacheable()` 装饰器
  - 在对应的增删改接口添加 `@CacheEvict()` 清除缓存
  - _需求：1.1、1.2_

- [ ] 4. 数据库查询优化

  - 审查现有 Entity，为常用查询字段添加索引（使用 `@Index()` 装饰器）
  - 检查并修复 N+1 查询问题，使用 `leftJoinAndSelect` 或 `QueryBuilder` 优化
  - 将 `find()` 查询改为 `select` 指定字段，避免 SELECT \*
  - 统一使用分页查询，封装 `PaginationDto` 和分页响应格式
  - _需求：2.1、2.2、2.3、2.4_

- [ ] 5. 配置数据库连接池与慢查询日志

  - 在 TypeORM 配置中设置连接池参数（`poolSize`、`extra.connectionLimit` 等）
  - 开启 TypeORM 日志，配置慢查询阈值记录
  - 添加连接池耗尽时的友好错误处理
  - _需求：2.5、4.1、4.2_

- [ ] 6. 实现 HTTP 缓存与响应优化

  - 创建 `HttpCacheInterceptor`，为 GET 请求自动添加 Cache-Control、ETag 头
  - 优化 compression 中间件配置，调整压缩阈值和压缩级别
  - 实现字段过滤功能，支持通过 `?fields=a,b,c` 参数返回指定字段
  - _需求：3.1、3.2、3.4_

- [ ] 7. 实现异步任务处理机制

  - 安装 `@nestjs/bull` 和 `bull` 依赖，配置 Redis 作为队列后端
  - 创建 `TaskQueue` 模块，封装异步任务的创建和状态查询
  - 实现长耗时接口的异步化改造，返回任务 ID 供前端轮询
  - _需求：3.3_

- [ ] 8. 外部 API 调用优化

  - 封装 `HttpService` 包装类，统一设置超时时间（默认 5s）
  - 实现重试机制（使用 `rxjs` 的 `retry` 或 `axios-retry`）
  - 添加熔断器模式，连续失败时快速失败
  - _需求：4.4、4.5_

- [ ] 9. 实现请求耗时监控中间件

  - 创建 `RequestLoggerMiddleware`，记录每个请求的耗时
  - 实现慢接口告警，响应时间超过阈值时记录 WARN 级别日志
  - 将日志格式改为 JSON 结构化格式，便于 ELK 等工具分析
  - _需求：5.1、5.2、5.5_

- [ ] 10. 集成 Prometheus 监控指标
  - 安装 `@willsoto/nestjs-prometheus` 依赖
  - 暴露 `/metrics` 端点，输出 Prometheus 格式指标
  - 添加自定义指标：请求 QPS、响应时间直方图、错误率计数器
  - _需求：5.3、5.4_
