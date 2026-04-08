/**
 * 番茄钟计时器 — 胡桃风格
 */

import * as vscode from 'vscode';

export type PomodoroPhase = 'focus-end' | 'break-start' | 'break-end';

export class PomodoroTimer {
    private timer?: ReturnType<typeof setInterval>;
    private remaining = 0;
    private statusBarItem: vscode.StatusBarItem;
    private isBreak = false;
    private completed = 0;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100,
        );
    }

    public start(
        minutes: number,
        onPhase: (phase: PomodoroPhase) => void,
    ): void {
        this.stop();
        this.remaining = minutes * 60;
        this.isBreak = false;

        const config = vscode.workspace.getConfiguration('hutao');
        const showStatus = config.get<boolean>('enableStatusBar', true);

        if (showStatus) {
            this.statusBarItem.show();
        }

        this.timer = setInterval(() => {
            this.remaining--;
            const display = this.formatTime(this.remaining);
            const prefix = this.isBreak ? '🦋 休息' : '🔥 专注';
            this.statusBarItem.text = `${prefix} ${display}`;

            if (this.remaining <= 0) {
                if (this.isBreak) {
                    this.stop();
                    onPhase('break-end');
                    return;
                }
                this.completed++;
                onPhase('focus-end');
                const breakMins = config.get<number>('breakMinutes', 5);
                this.remaining = breakMins * 60;
                this.isBreak = true;
                onPhase('break-start');
            }
        }, 1000);
    }

    public stop(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
        this.statusBarItem.hide();
    }

    public get isRunning(): boolean {
        return this.timer !== undefined;
    }

    public get completedCount(): number {
        return this.completed;
    }

    private formatTime(seconds: number): string {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    public dispose(): void {
        this.stop();
        this.statusBarItem.dispose();
    }
}
