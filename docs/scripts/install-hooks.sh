#!/bin/bash
# 安装 Git pre-commit 钩子，提交代码时提醒检查相关文档
# 用法: bash scripts/install-hooks.sh
#
# 自动检测项目结构生成提醒规则。

set -e

DOC_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$DOC_DIR/.." && pwd)"
HOOKS_DIR="$REPO_ROOT/.git/hooks"

# 如果知识库是子目录，安装到父仓库
if [ ! -d "$REPO_ROOT/.git" ] && [ -d "$REPO_ROOT/../.git" ]; then
  REPO_ROOT="$(cd "$REPO_ROOT/.." && pwd)"
  HOOKS_DIR="$REPO_ROOT/.git/hooks"
fi

if [ ! -d "$HOOKS_DIR" ]; then
  echo "ERROR: 未找到 .git/hooks 目录，请确认项目在 git 仓库中"
  exit 1
fi

# 尊重 git core.hooksPath（husky 等工具会接管钩子目录）
CURRENT_HOOKS_PATH=$(git -C "$REPO_ROOT" config core.hooksPath 2>/dev/null || true)
if [ -n "$CURRENT_HOOKS_PATH" ]; then
  if [ -d "$REPO_ROOT/$CURRENT_HOOKS_PATH" ]; then
    HOOKS_DIR="$(cd "$REPO_ROOT/$CURRENT_HOOKS_PATH" && pwd)"
    echo "[doc-check] 检测到 core.hooksPath=$CURRENT_HOOKS_PATH，安装到: $HOOKS_DIR"
  else
    echo "[doc-check] 警告: core.hooksPath=$CURRENT_HOOKS_PATH 目录不存在，回退到 .git/hooks"
  fi
fi

HOOK_FILE="$HOOKS_DIR/pre-commit"

# 备份已有 hook
if [ -f "$HOOK_FILE" ] && ! grep -q "doc-check" "$HOOK_FILE" 2>/dev/null; then
  cp "$HOOK_FILE" "${HOOK_FILE}.bak.$(date +%s)"
  echo "[doc-check] 已备份已有 pre-commit 钩子"
fi

# 检测项目类型，生成对应的提醒规则
detect_patterns() {
  local patterns=""

  # Java / Spring Boot
  if find "$REPO_ROOT" -maxdepth 4 -name "pom.xml" -o -name "build.gradle" 2>/dev/null | head -1 | grep -q .; then
    patterns="$patterns
  # Java Controller 变更 → API 文档
  if echo \"\$changed_files\" | grep -qE 'controller/.*\\.java$'; then
    reminders=\"\$reminders\\n  → 05-API文档/接口文档.md\"
    reminders=\"\$reminders\\n  → 04-技术方案/前后端联调方案.md\"
  fi

  # SQL 变更 → 数据库设计
  if echo \"\$changed_files\" | grep -qE 'sql/.*\\.sql$\|migration.*\\.sql$\|db/.*\\.sql$'; then
    reminders=\"\$reminders\\n  → 05-API文档/数据库设计.md\"
  fi

  # 定时任务变更
  if echo \"\$changed_files\" | grep -qE 'job/.*\\.java$\|scheduler/.*\\.java$\|task/.*\\.java$'; then
    reminders=\"\$reminders\\n  → 04-技术方案/后端技术方案.md\"
  fi"
  fi

  # Python / Django / Flask
  if find "$REPO_ROOT" -maxdepth 3 -name "requirements.txt" -o -name "pyproject.toml" -o -name "setup.py" 2>/dev/null | head -1 | grep -q .; then
    patterns="$patterns
  # Python routes/views 变更 → API 文档
  if echo \"\$changed_files\" | grep -qE 'routes/.*\\.py$\|views/.*\\.py$\|api/.*\\.py$'; then
    reminders=\"\$reminders\\n  → 05-API文档/接口文档.md\"
  fi

  # Model 变更 → 数据库设计
  if echo \"\$changed_files\" | grep -qE 'models/.*\\.py$'; then
    reminders=\"\$reminders\\n  → 05-API文档/数据库设计.md\"
  fi"
  fi

  # Go
  if find "$REPO_ROOT" -maxdepth 3 -name "go.mod" 2>/dev/null | head -1 | grep -q .; then
    patterns="$patterns
  # Go handler 变更 → API 文档
  if echo \"\$changed_files\" | grep -qE 'handler/.*\\.go$\|controller/.*\\.go$\|api/.*\\.go$'; then
    reminders=\"\$reminders\\n  → 05-API文档/接口文档.md\"
  fi

  # Model 变更 → 数据库设计
  if echo \"\$changed_files\" | grep -qE 'model/.*\\.go$\|entity/.*\\.go$'; then
    reminders=\"\$reminders\\n  → 05-API文档/数据库设计.md\"
  fi"
  fi

  # Node.js / TypeScript monorepo（payback 定制）
  if find "$REPO_ROOT" -maxdepth 3 -name "package.json" 2>/dev/null | head -1 | grep -q .; then
    patterns="$patterns
  # server controller 变更 → API 文档
  if echo \"\$changed_files\" | grep -qE 'packages/server/src/.*controller\\.ts$'; then
    reminders=\"\$reminders\\n  → 05-API文档/接口文档.md\"
  fi

  # TypeORM entity 变更 → 数据库设计
  if echo \"\$changed_files\" | grep -qE 'packages/server/src/.*entities/.*\\.entity\\.ts$'; then
    reminders=\"\$reminders\\n  → 05-API文档/数据库设计.md\"
  fi

  # 定时任务清单变更 → 后端技术方案 + 业务流程
  if echo \"\$changed_files\" | grep -qE 'packages/server/src/scheduler-task/'; then
    reminders=\"\$reminders\\n  → 04-技术方案/后端技术方案.md\"
    reminders=\"\$reminders\\n  → 02-业务梳理/业务流程.md\"
  fi

  # core 问财查询语句变更 → 术语表
  if echo \"\$changed_files\" | grep -qE 'packages/core/src/config/'; then
    reminders=\"\$reminders\\n  → 02-业务梳理/术语表.md\"
    reminders=\"\$reminders\\n  → 04-技术方案/后端技术方案.md\"
  fi

  # 前端页面/路由变更
  if echo \"\$changed_files\" | grep -qE 'packages/client/src/(views|router)/'; then
    reminders=\"\$reminders\\n  → 04-技术方案/前端技术方案.md\"
    reminders=\"\$reminders\\n  → 01-需求分析/功能需求清单.md\"
  fi

  # 推送事件 / webhook 部署链路变更
  if echo \"\$changed_files\" | grep -qE 'packages/(push-server|webhook-server)/src/'; then
    reminders=\"\$reminders\\n  → 04-技术方案/推送与部署方案.md\"
  fi

  # 依赖变更 → 技术栈
  if echo \"\$changed_files\" | grep -qE 'package\\.json$|pnpm-workspace\\.yaml$|pnpm-lock\\.yaml$'; then
    reminders=\"\$reminders\\n  → 06-开发规范/技术栈.md\"
  fi"
  fi

  # 通用：配置文件
  patterns="$patterns
  # 配置文件变更
  if echo \"\$changed_files\" | grep -qE 'application.*\\.(yml|properties)|\\.env(\\.|$)|docker-compose.*\\.yml|nginx\\.conf|config/.+\\.(yml|yaml|json|toml)'; then
    reminders=\"\$reminders\\n  → 04-技术方案/环境配置.md\"
  fi"

  echo "$patterns"
}

PATTERNS=$(detect_patterns)

# 写入 hook
cat > /tmp/doc-check-hook.sh << HOOK_EOF
# BEGIN doc-check
doc_check() {
  local changed_files
  changed_files=\$(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null)
  [ -z "\$changed_files" ] && return

  local reminders=""
$PATTERNS

  if [ -n "\$reminders" ]; then
    echo ""
    echo "[doc-check] 检测到代码变更，请检查以下文档是否需要更新："
    echo -e "\$reminders"
    echo ""
  fi
}
doc_check
# END doc-check
HOOK_EOF

if [ -f "$HOOK_FILE" ] && grep -q "doc-check" "$HOOK_FILE" 2>/dev/null; then
  echo "[doc-check] pre-commit 钩子已存在，跳过"
else
  if [ -f "$HOOK_FILE" ]; then
    echo "" >> "$HOOK_FILE"
    cat /tmp/doc-check-hook.sh >> "$HOOK_FILE"
  else
    echo "#!/bin/sh" > "$HOOK_FILE"
    cat /tmp/doc-check-hook.sh >> "$HOOK_FILE"
  fi
  chmod +x "$HOOK_FILE"
  echo "[doc-check] pre-commit 钩子已安装到: $HOOK_FILE"
fi

rm -f /tmp/doc-check-hook.sh
echo "[doc-check] 完成"
