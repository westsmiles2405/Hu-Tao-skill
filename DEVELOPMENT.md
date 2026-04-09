# 🦋 胡桃工作陪伴 — 完整项目指南

## 项目概述

**胡桃工作陪伴**是一个 VS Code 扩展，让《原神》角色**胡桃**化身为你的工作伙伴，以古灵精怪、带点暗黑幽默又充满关怀的方式陪伴你完成工作和学习任务。

---

## 🎯 核心功能

### 1. **往生堂式陪伴 ・ 9 条命令**

| 命令 | 功能 |
|------|------|
| 🦋 `胡桃：开启今日往生堂` | 时间感知的个性化开场 |
| ⏱ `胡桃：开始番茄钟专注` | 25 分钟专注 + 5 分钟休息，状态栏倒计时 |
| ⏹ `胡桃：结束番茄钟` | 提前结束番茄钟 |
| 💪 `胡桃：给我打气` | 获得鼓舞台词 |
| 💀 `胡桃：送葬式审判代码` | 读取诊断信息，往生堂风格点评 |
| 📦 `胡桃：今日收工` | 收工总结 |
| ✍️ `胡桃：来首打油诗` | 胡桃即兴打油诗 |
| 👻 `胡桃：讲个鬼故事` | 往生堂特色怪谈 |
| 🪨 `胡桃：聊聊钟离先生` | 提起钟离的彩蛋对话 |

### 2. **被动陪伴**

- **每保存 10 次文件自动插话**：展示她对工作进度的关注
- **长时间闲置提醒**：超过 30 分钟未操作时，胡桃会发出提醒
- **时间段感知**：凌晨、早上、午后、傍晚各有不同的问候
- **深层悲伤识别**：当用户说出极端消极的话，胡桃会放下玩笑，以生死哲学给出庄重安慰

### 3. **侧边栏聊天面板**

活动栏有 🦋 图标，点开即可进入"**往生堂工作室**"聊天面板：
- 胡桃与用户的消息实时显示
- 打字机逐字效果 + 光标闪烁动画
- 80+ 条手写台词覆盖多种情境

---

## 🏗️ 项目结构

```
hutao-companion/
├── src/
│   ├── extension.ts         # 扩展入口：9 命令、事件循环、dispose
│   ├── persona.ts           # 人格引擎：80+ 台词库
│   ├── dynamicReply.ts      # 动态对话：关键词识别、意图分析、deep_sad
│   ├── chatPanel.ts         # Webview 侧边栏：HTML + CSS + nonce CSP
│   ├── pomodoro.ts          # 番茄钟：PomodoroPhase 三阶段
│   ├── idleWatcher.ts       # 闲置检测：() => void 回调
│   └── stats.ts             # 统计追踪：.current 访问器
├── media/
│   └── hutao-icon.svg       # 活动栏图标
├── package.json             # 配置清单、命令声明、设置项
├── tsconfig.json            # TypeScript 编译配置
└── README.md
```

---

## ⚙️ 配置项

```json
{
  "hutao.pomodoroMinutes": 25,
  "hutao.breakMinutes": 5,
  "hutao.enableIdleReminder": true,
  "hutao.idleMinutes": 30,
  "hutao.enableStatusBar": true
}
```

---

## 🚀 开发与运行

### 首次设置

```bash
cd hutao-companion
npm install
npm run compile
```

### 调试运行

按 `F5` 启动 Extension Development Host。

### 开发中编译

```bash
npm run watch
```

---

## 📖 关键架构

### PomodoroPhase 三阶段

```typescript
type PomodoroPhase = 'focus-end' | 'break-start' | 'break-end';
pomodoro.start(minutes, (phase) => {
    switch (phase) {
        case 'focus-end': /* 专注结束 */ break;
        case 'break-start': /* 休息开始 */ break;
        case 'break-end': /* 休息结束 */ break;
    }
});
```

### 意图识别层级

```
deep_sad → sad → encourage → work → greeting → poem → ghost → zhongli → unknown
```

深层悲伤优先匹配，确保用户在最脆弱时获得庄重安慰而非玩笑。

### 独有角色特色

- **打油诗**：14 首胡桃风格的即兴诗，涵盖 debug、加班、bug 等场景
- **鬼故事**：12 个往生堂怪谈，融合编程梗
- **钟离彩蛋**：5 条关于钟离先生的趣味对话

---

## 📄 License

MIT
