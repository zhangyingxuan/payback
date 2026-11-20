# Agent 爱问财接入

> 最后验证：2026-11-19
> 状态：已按项目现有后端源码接入；真实首屏可用，分页存在上游业务错误。未部署、未修改本机真实开关。

## 来源与复用边界

用户明确指向项目已有后端接口，因此以 `packages/server/src/pay-back/core/fetchUtil.ts` 的实际协议为依据，不再要求额外接口文档，也不混用其他供应商的 OpenAPI。

- 首屏：`https://www.iwencai.com/unifiedwap/unified-wap/v2/result/get-robot-data`。
- 分页：`https://www.iwencai.com/gateway/urp/v7/landing/getDataList`。
- 两者均 POST form，保留 source、question/query、perpage、page、secondary_intent 及分页 comp_id/uuid/condition 等现有字段。
- hexin-v 由已安装的 `pay-back-core.createV()` 生成，避免 Python 重写签名而漂移。Node 子进程仅固定调用该函数，不接受模型命令、脚本或模块路径。
- 首屏表路径来自现有 `commonUtil.ts`，但不复用其“异常时空数组/0”的降级方式；Agent 适配严格校验业务状态和表结构。

Python 实现为同级 Agent 的 `src/payback_agent/research_iwencai.py`；未修改后端服务、JWT、调度或原有爬虫。研究队列自己的1.2秒限速不等于复用后端进程内队列，仍可能有同IP争用与上游限制。

## 调用契约

先启用研究功能 `AGENT_RESEARCH_ENABLED=true`；内置来源无需 JSON 注册或额外 OpenAPI Key。Node 与后端已编译共享库必须可用，目录默认同级 `payback/packages/server`，不同部署用 `AGENT_IWENCAI_SERVER_DIR`。available/configured 只代表本地依赖，不证明远端随时可用。

通过 research_start 提交：

```json
{
  "kind": "request",
  "arguments": {
    "source": "aiwencai",
    "operation": "query",
    "parameters": {
      "question": "A股，最新价低于2024年9月24日收盘价，股票代码，股票简称",
      "per_page": 20,
      "max_pages": 1
    }
  }
}
```

问句最多1000字符；per_page 默认20，范围1–100；max_pages 默认1，范围1–20。两接口固定公网 HTTPS，不开放任意 URL、header 或签名。管理员若已登记同名来源，仍以其策略为准。

## 结果语义与失败处理

| 字段 | 含义 |
|---|---|
| reported_total | 上游 row_count，不是 Agent 独立复算 |
| returned_count / rows | 已取得并检查重复代码的名单 |
| parsed_conditions / fields | 上游实际解析条件与列名，JSON条件字符串会规范化为结构化数据 |
| complete | 名单数量是否覆盖报告总数，不代表语义或跨页快照已验证 |
| pages_requested / pages_fetched | 请求页数 / 有效取回页数 |
| stop_reason / paging_error_code | 分页上限、大小上限、空页或上游业务错误 |
| condition_verified / snapshot_verified | 固定 false，不能自行宣称筛选、复权或快照一致已验证 |

同一首屏接口可能返回股东明细等非股票筛选表。因此拒绝缺有效筛选条件、重复股票代码、异常总数和首屏内外业务错误，不能将股东行数当股票数量。合法成功的 row_count=0 与失败严格区分。

分页最多20页，名单聚合限制512 KiB。每页重新生成签名、校验业务状态及重复代码，不自动重试；取消能打断限速等待、停止后续页，但不能撤回在途请求。分页业务错误保留已取得的首屏，不伪装成完整名单；网络/结构异常仍明确失败，不编造结果。

## 真实验证与已知限制

2026-11-19 已验证签名共享库和实际股票条件查询首屏；单独股票代码曾被上游解析为股东表，已补拒绝规则。首屏计数仅可按上游口径引用，还须核对日期、复权、盘中/收盘与实际 parsed_conditions。

现有分页请求实测顶层 status_code="0"，内部 extra.status_code=-1201、空名单。已显式返回 upstream_paging_error、complete=false，不能声称全市场名单已取全。上游接口可变且未提供稳定公开契约，不通过盲目重试、伪造登录或调整未知参数掩盖错误。

## 相关文档

- [受控研究方案](Agent受控研究与临时工具方案.md)
- [隔离计算与任务恢复](Agent隔离计算与任务恢复.md)
- [受控研究回归用例](../07-测试用例/受控研究回归用例.md)
- [三项目协作](../03-架构设计/三项目协作与AI复盘.md)
