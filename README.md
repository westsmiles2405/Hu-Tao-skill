# 🦋 胡桃工作陪伴 — Hutao Companion

> 让往生堂第77代堂主陪你写代码！

![VS Code](https://img.shields.io/badge/VS%20Code-%5E1.85.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ 功能一览

| 功能 | 说明 |
|------|------|
| 🦋 **角色陪伴** | 80+ 条胡桃风格台词，古灵精怪又带点暗黑幽默 |
| 💬 **智能对话** | 关键词意图识别，根据情绪给出安慰 / 鼓励 / 工作建议 |
| 🍅 **番茄钟** | 专注计时 + 休息提醒，状态栏实时显示 |
| 💀 **送葬式代码审判** | 读取项目诊断信息，用往生堂风格点评代码问题 |
| 📊 **数据统计** | 追踪每日番茄钟、对话、保存次数 |
| 👻 **闲置提醒** | 太久不动就会被胡桃的鬼故事吓回来 |
| 🌸 **新手引导** | 首次使用自动发送 3 条欢迎消息 |
| ✍️ **打字机效果** | 消息逐字显示，附带光标闪烁动画 |

## 📦 安装

```bash
git clone https://github.com/westsmiles2405/Hutao-skill.git
cd hutao-companion
npm install
npm run compile
```

在 VS Code 中按 `F5` 启动调试即可体验。

## 🎮 命令

在命令面板（`Ctrl+Shift+P`）中搜索 **胡桃**：

- `胡桃：开启今日往生堂` — 开场白 + 时间问候
- `胡桃：开始番茄钟专注` — 启动番茄钟
- `胡桃：结束番茄钟` — 手动停止
- `胡桃：给我打气` — 随机鼓励
- `胡桃：送葬式审判代码` — 代码问题分析
- `胡桃：今日收工` — 收工总结

## ⚙️ 配置

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `hutao.pomodoroMinutes` | 25 | 专注时长 |
| `hutao.breakMinutes` | 5 | 休息时长 |
| `hutao.enableIdleReminder` | true | 闲置提醒开关 |
| `hutao.idleMinutes` | 30 | 闲置多久后提醒 |
| `hutao.enableStatusBar` | true | 状态栏显示 |

## 🤝 贡献

欢迎 PR 和 Issue！

## 📄 License

MIT © westsmile2405
