/**
 * 胡桃工作陪伴 — 主入口
 */

import * as vscode from 'vscode';
import { HutaoChatPanel } from './chatPanel';
import { PomodoroTimer } from './pomodoro';
import { IdleWatcher } from './idleWatcher';
import { StatsTracker } from './stats';
import {
    getOpening,
    getWorkLine,
    getEncourageLine,
    getJudgment,
    getFocusStart,
    getFocusEnd,
    getBreakRemind,
    getFinale,
    getIdleRemind,
    getTimeBasedGreeting,
    getPoem,
    getGhostStory,
    getZhongliEasterEgg,
} from './persona';
import {
    generateResponse,
    analyzeCodeProblems,
    CODE_ANALYSIS_KEYWORDS,
} from './dynamicReply';

export function activate(context: vscode.ExtensionContext): void {
    // ── 核心模块 ─────────────────────────────────────
    const panel = new HutaoChatPanel(context.extensionUri);
    const pomodoro = new PomodoroTimer();
    const stats = new StatsTracker(context.globalState);

    const idleWatcher = new IdleWatcher(() => {
        panel.addBotMessage(getIdleRemind());
    });

    // ── 常驻状态栏 ──────────────────────────────────
    const statusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100,
    );
    statusBar.text = '🦋 胡桃';
    statusBar.tooltip = '胡桃工作陪伴';
    statusBar.command = 'hutao.openStage';
    const showStatusBar = vscode.workspace
        .getConfiguration('hutao')
        .get<boolean>('enableStatusBar', true);
    if (showStatusBar) {
        statusBar.show();
    }
    context.subscriptions.push(statusBar);

    // ── 注册 Webview ─────────────────────────────────
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(HutaoChatPanel.viewType, panel),
    );

    // ── 用户消息处理 ──────────────────────────────────
    panel.setOnUserMessage((text) => {
        stats.recordMessage();
        panel.updateStats(stats.current);
        idleWatcher.reset();

        const lower = text.toLowerCase();
        if (CODE_ANALYSIS_KEYWORDS.some((k) => lower.includes(k))) {
            panel.addBotMessage(analyzeCodeProblems());
            return;
        }

        const reply = generateResponse(text);
        panel.addBotMessage(reply);
    });

    // ── 首次欢迎引导 ──────────────────────────────────
    const welcomed = context.globalState.get<boolean>('hutao.welcomed', false);
    if (!welcomed) {
        setTimeout(() => {
            panel.addBotMessage(
                '嘿嘿~欢迎来到往生堂！本堂主是胡桃，从今天起我就是你的专属工作伙伴啦！',
            );
            setTimeout(() => {
                panel.addBotMessage(
                    '你可以跟我聊天、让我帮你看代码、开启番茄钟专注模式~试试在下面的输入框打个招呼？',
                );
                setTimeout(() => {
                    panel.addBotMessage(
                        '小提示：在命令面板（Ctrl+Shift+P）搜索"胡桃"，可以找到更多有趣的功能哦~嘿嘿！',
                    );
                }, 2500);
            }, 2000);
        }, 1500);
        context.globalState.update('hutao.welcomed', true);
    } else {
        panel.addBotMessage(getTimeBasedGreeting());
    }

    // 初始推送统计
    panel.updateStats(stats.current);

    // ── 命令注册 ──────────────────────────────────────
    context.subscriptions.push(
        vscode.commands.registerCommand('hutao.openStage', () => {
            const msg = getOpening();
            panel.addBotMessage(msg);
            panel.addBotMessage(getTimeBasedGreeting());
            vscode.window.showInformationMessage(`🦋 胡桃：${msg}`);
        }),

        vscode.commands.registerCommand('hutao.startPomodoro', () => {
            if (pomodoro.isRunning) {
                panel.addBotMessage('诶？番茄钟已经在跑了呀~别急别急，专心当前这轮就好！');
                return;
            }
            const config = vscode.workspace.getConfiguration('hutao');
            const minutes = config.get<number>('pomodoroMinutes', 25);
            panel.addBotMessage(getFocusStart(minutes));

            pomodoro.start(
                minutes,
                () => { },
                (isBreak) => {
                    if (isBreak) {
                        panel.addBotMessage(getBreakRemind());
                    } else {
                        panel.addBotMessage(getFocusEnd());
                        stats.recordPomodoro();
                        panel.updateStats(stats.current);
                    }
                },
            );
        }),

        vscode.commands.registerCommand('hutao.stopPomodoro', () => {
            pomodoro.stop();
            panel.addBotMessage('番茄钟已经停啦~本堂主给你记上了！');
        }),

        vscode.commands.registerCommand('hutao.encourageMe', () => {
            const msg = getEncourageLine();
            panel.addBotMessage(msg);
            vscode.window.showInformationMessage(`🦋 胡桃：${msg}`);
        }),

        vscode.commands.registerCommand('hutao.reviewWork', () => {
            const diagnostics = vscode.languages.getDiagnostics();
            const issues: string[] = [];
            for (const [uri, diags] of diagnostics) {
                for (const d of diags) {
                    if (d.severity === vscode.DiagnosticSeverity.Error) {
                        const fileName = vscode.workspace.asRelativePath(uri);
                        issues.push(
                            `${fileName}:${d.range.start.line + 1} — ${d.message}`,
                        );
                    }
                }
            }
            if (issues.length > 10) {
                issues.splice(10, issues.length - 10, `……以及另外 ${issues.length - 10} 项问题。`);
            }
            panel.addBotMessage(getJudgment(issues));
            vscode.window.showInformationMessage(
                `🦋 胡桃送葬式审判：发现 ${issues.length} 项错误`,
            );
        }),

        vscode.commands.registerCommand('hutao.finale', () => {
            const msg = getFinale(pomodoro.completedCount);
            panel.addBotMessage(msg);
            pomodoro.stop();
            vscode.window.showInformationMessage(`🦋 胡桃：${msg}`);
        }),

        vscode.commands.registerCommand('hutao.poem', () => {
            panel.addBotMessage(getPoem());
        }),

        vscode.commands.registerCommand('hutao.ghostStory', () => {
            panel.addBotMessage(getGhostStory());
        }),

        vscode.commands.registerCommand('hutao.zhongli', () => {
            panel.addBotMessage(getZhongliEasterEgg());
        }),
    );

    // ── 保存事件 → 统计 + 彩蛋 ──────────────────────
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(() => {
            stats.recordSave();
            panel.updateStats(stats.current);
            idleWatcher.reset();
            if (stats.current.todaySaves % 10 === 0) {
                panel.addBotMessage(getWorkLine());
            }
        }),
    );

    // ── 编辑事件 → 重置闲置 ──────────────────────────
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(() => {
            idleWatcher.reset();
        }),
    );

    // ── 清理 ──────────────────────────────────────────
    context.subscriptions.push({
        dispose() {
            pomodoro.dispose();
            idleWatcher.dispose();
        },
    });
}

export function deactivate(): void { }
