# 迁移报告（最近一次 migrate --apply）

- 阶段：replace
- 修改文件 1 个，共改写 1 处。
- 本文件由 migrate.mjs 生成；历史报告请查 git 记录，不要手工编辑。

## 本次改写对照

### src/styles/app.css

| 行 | 位置 | 原值 | 现在 |
| --- | --- | --- | --- |
| 2 | height | `56px` | `var(--layout-topbar-height)` |

## 如何回滚

- 还没提交：运行 `git restore 'src/styles/app.css'`。
- 已经提交：先 `git log --oneline -5` 找到本次迁移的提交号，再 `git revert <提交号>`。

## 建议的下一步

1. 现在就提交，保住回滚点：`git add -A && git commit -m "migrate(replace): swap 1 literals for semantic tokens"`。
2. 打开开发服务器，肉眼过一遍受影响文件对应的页面。
3. 复核本次改动：`node <repo>/skills/design-system-steward/scripts/guard.mjs --project <repo>/citrine/testbed/legacy-shop --changed 'src/styles/app.css'`。

## 待决清单（本次没有自动处理）

- [ambiguous-semantic] #FFFFFF（src/styles/app.css:2）
- [ambiguous-semantic] #fff（src/styles/app.css:6）
- [ambiguous-semantic] #fff（src/styles/app.css:8）
- [ambiguous-semantic] #fff（src/styles/app.css:9）
- [ambiguous-semantic] #fff（src/styles/app.css:11）
- [ambiguous-semantic] 14px（src/styles/app.css:1）
- [ambiguous-semantic] 24px（src/styles/app.css:2）
- [ambiguous-semantic] 12px（src/styles/app.css:2）
- [ambiguous-semantic] 8px（src/styles/app.css:4）
- [ambiguous-semantic] 16px（src/styles/app.css:4）
- [primitive-only] 6px（src/styles/app.css:4）
- [ambiguous-semantic] 20px（src/styles/app.css:6）
- [ambiguous-semantic] 2px（src/styles/app.css:6）
- [ambiguous-semantic] 12px（src/styles/app.css:7）
- [ambiguous-semantic] 16px（src/styles/app.css:7）
- [ambiguous-semantic] 32px（src/styles/app.css:8）
- [ambiguous-semantic] 14px（src/styles/app.css:8）
- [primitive-only] 6px（src/styles/app.css:8）
- [ambiguous-semantic] 14px（src/styles/app.css:8）
- [ambiguous-semantic] 2px（src/styles/app.css:12）
- [ambiguous-semantic] 8px（src/styles/app.css:12）
- [primitive-only] 999px（src/styles/app.css:12）
- [ambiguous-semantic] 12px（src/styles/app.css:12）
- [ambiguous-semantic] 12px（src/styles/app.css:17）
- [primitive-only] 10px（src/styles/app.css:17）
- [ambiguous-semantic] 12px（src/styles/app.css:17）
- [ambiguous-semantic] 12px（src/styles/app.css:18）
- [ambiguous-semantic] 12px（src/styles/app.css:19）
- [unmanaged-literal] 1px（src/styles/app.css）
- [unmanaged-literal] #e7e5e4（src/styles/app.css）
- [unmanaged-literal] #fafaf9（src/styles/app.css）
- [unmanaged-literal] #44403c（src/styles/app.css）
- [unmanaged-literal] #57534e（src/styles/app.css）
- [unmanaged-literal] #7a5b00（src/styles/app.css）
- [unmanaged-literal] #b45309（src/styles/app.css）
- [unmanaged-literal] #c2410c（src/styles/app.css）
- [unmanaged-literal] #c62828（src/styles/app.css）
- [unmanaged-literal] #e6f6ea（src/styles/app.css）
- [unmanaged-literal] #fdebea（src/styles/app.css）
- [unmanaged-literal] #ffefe3（src/styles/app.css）

处理方式：运行 `migrate --phase settle` 逐组决定归并、升级或豁免。

