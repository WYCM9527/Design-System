# 黄晶（Citrine）项目怎么办

黄晶不再单独维护，并进了 Morganite，成为它的一个颜色「黄晶黄」：一套结构，颜色可选。黄晶的 npm 包 `@wycm9527/citrine` 已于 2026-11-11 下架：还没处理的项目，在新电脑或 CI 上重新安装依赖会失败（报 404 Not Found）。

用过黄晶的项目，二选一：

- **还在继续开发的项目：迁到 Morganite，颜色选黄晶黄（推荐）**。以后跟着 Morganite 升级，想换颜色一句话就行。
- **快上线或近期不改界面的项目：先继续用黄晶**，只改一处依赖，保证以后还能正常安装。黄晶停在 2.12.2，不会再有新版本和修复。

不确定项目用没用黄晶：项目里有 `design-systems/citrine/` 文件夹，或 `package.json` 里有 `@wycm9527/citrine`，就是用了。也可以直接问 AI「这个项目用的是哪套设计规范、哪个版本」。

---

## 推荐：迁到 Morganite，颜色选黄晶黄

迁完以后：

- 品牌色的用法和黄晶一样：主按钮黄底黑字，链接、选中的菜单和焦点框用黑色（暗色下用浅灰），黄色只出现在主按钮、品牌底、指示条和图表上。
- 灰色、间距、圆角、字号和侧栏换成 Morganite 的（沿用 Ant Design Pro），页面看起来会和原来有些不同，这是预期的；业务功能不变。
- 可以先在[在线效果预览（黄晶黄）](https://wycm9527.github.io/Design-System/morganite/previews/rose-gold-admin/?palette=citrine)里看迁完大概的样子。

把下面这段发给 AI：

```text
请把当前项目的设计规范从 Citrine（黄晶）换成 Morganite，颜色用黄晶黄。
来源：https://github.com/WYCM9527/Design-System

先只读检查：项目用的黄晶版本和接入方式（npm / 文件夹 / 下载包）、页面里哪些地方引用了黄晶（包名 @wycm9527/citrine、design-systems/citrine/、黄晶有而 Morganite 没有的变量），告诉我要改哪些文件和大概的工作量，我确认后再动手。
动手前检查未提交的改动，保存一个本机 git 存档点。

按仓库里 design-system-adopter 的「更换现有规范」流程做：
1. 项目里的 design-system-adopter 先更新到仓库里的版本（换颜色要 0.4.0 或更新）；Morganite 用 0.4.0 或更新版本，接入时带上颜色黄晶黄。
2. 原来的 design-system/ 改名保留，当迁移证据。
3. 引用 @wycm9527/citrine 的地方换成 @wycm9527/morganite。
4. 黄晶有、Morganite 没有的变量，按 Morganite 的迁移对照表（migration/roles.json）改成对应的变量；不要在页面上直接写色值或补样式。
5. 验收工具 @wycm9527/citrine-tools 升到 1.4.0 或更新版本，页面清单沿用。

改完重新构建，跑 guard 和验收，亮色、暗色都要过；更新项目规则 AGENTS.md。
结束时给我：存档点、预览网址、改了哪些地方、检查结果，以及还需要我判断的地方。旧的 design-systems/citrine/ 和 design-system.legacy/ 先留着，等我确认页面没问题再删。
```

**做完后检查：**

- 打开 AI 给的网址：主按钮是黄底黑字；链接、选中的菜单和焦点框是黑色；切到暗色正常。
- 检查结果里有未通过或未执行的，先让 AI 处理。
- 页面确认没问题后，让 AI 删掉 `design-systems/citrine/`、`design-system.legacy/` 和 `@wycm9527/citrine` 依赖。之后的用法和其他 Morganite 项目一样，见[零基础上手教程](TUTORIAL.md)。

---

## 先继续用黄晶

把依赖从 npm 改成指向项目里已有的快照 `design-systems/citrine/`，包名不变，页面代码不用改。发给 AI：

```text
当前项目先继续用 Citrine（黄晶），不迁移。黄晶的 npm 包已经下架，请把项目对 @wycm9527/citrine 的依赖改成指向项目里已有的快照 design-systems/citrine/（npm 的写法是 npm i file:./design-systems/citrine，用 pnpm 或 yarn 的按对应写法），保证以后重新安装依赖不再从 npm 下载它。
项目里没有 design-systems/citrine/ 的，改用 GitHub Releases 里同版本的安装包：https://github.com/WYCM9527/Design-System/releases/download/citrine-v<版本>/wycm9527-citrine-<版本>.tgz（2.10.0 起每个版本都有；更早的版本先告诉我，不要自己升级）。
依赖原本就是 file: 链接或 GitHub 下载地址的，不受下架影响，告诉我不用改即可。
不要改快照里的文件，也不要升级其他依赖。
改完删掉 node_modules 重新安装一次，再构建、跑 guard 和验收，确认页面和改之前一样；结束时告诉我改了哪些文件和检查结果。
```

验收工具 `@wycm9527/citrine-tools` 不下架、不改名，这条路不用动它。以后想迁，再用上面「推荐」那段。

---

## 常见问题

| 问题 | 回答 |
| --- | --- |
| 重新安装依赖报 404（`@wycm9527/citrine` Not found）？ | 项目还在从 npm 装黄晶。按上面任一条路处理，最快是「先继续用黄晶」那段，只改一处依赖。 |
| 迁移要多久？ | AI 第一步会先报要改的文件和工作量，你再决定现在迁还是排期。大部分改动是换包名和入口，花时间的是项目自己写的样式里用到黄晶特有变量的地方。 |
| 只想先看看效果？ | 在第一段提示词里加一句「这次只做到预览，不提交」，看完再决定。 |
| 黄晶的源文件和旧版本还在吗？ | 在。仓库的 git 历史、`citrine-v*` 标签和 GitHub Releases 里的旧版本下载都保留，只是不再更新。 |
| 黄晶教程去哪了？ | 合进了[零基础上手教程](TUTORIAL.md)，Morganite 和各个颜色都在里面讲。 |
