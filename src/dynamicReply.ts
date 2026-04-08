/**
 * 胡桃动态回复引擎 — 关键词意图识别 + 角色化生成
 */

import * as vscode from 'vscode';
import {
    getComfort,
    getSolemnComfort,
    getEncourageLine,
    getWorkLine,
    getTimeBasedGreeting,
    getPoem,
    getGhostStory,
    getZhongliEasterEgg,
} from './persona';

// ─── 关键词列表 ──────────────────────────────────────────

const SAD_KEYWORDS = [
    '难过', '伤心', '哭', '崩溃', '失败', '完蛋',
    '无语', '烦', '累', '郁闷', '焦虑', '绝望',
    '不行', '放弃', '痛苦',
];

/** 触发庄重哲学语态的深层悲伤关键词 — 真正的痛苦话题不该嘻嘻哈哈 */
const DEEP_SAD_KEYWORDS = [
    '去世', '死了', '离世', '走了', '不在了',
    '分手', '离婚', '自杀', '想死', '活不下去',
    '亲人', '永别', '葬礼', '丧',
];

const WORK_KEYWORDS = [
    '写代码', '编程', '调试', 'debug', '功能', '需求',
    '上线', '部署', '开发', '测试', '重构', '优化',
    '写完', 'code', '代码', '函数',
];

const ENCOURAGEMENT_KEYWORDS = [
    '加油', '鼓励', '打气', '支持', '帮忙',
    '信心', '坚持', '挺住', '可以', '行不行',
    '给力',
];

const GREETING_KEYWORDS = [
    '你好', '早上好', 'hi', 'hello', '嗨',
    '在吗',
];

const POEM_KEYWORDS = ['写诗', '赋诗', '打油诗', '来首诗', '作诗'];
const GHOST_KEYWORDS = ['鬼故事', '讲鬼', '恐怖', '吓人', '幽灵', '闹鬼'];
const ZHONGLI_KEYWORDS = ['钟离', '岩王帝君', '摩拉克斯', '先生'];

const CODE_ANALYSIS_KEYWORDS = [
    '分析', '诊断', '检查代码', '代码质量', '有没有错',
];

// ─── 意图分析 ──────────────────────────────────────────

function analyzeIntent(
    text: string,
): 'deep_sad' | 'sad' | 'work' | 'encourage' | 'greeting' | 'poem' | 'ghost' | 'zhongli' | 'unknown' {
    const lower = text.toLowerCase();
    if (POEM_KEYWORDS.some((k) => lower.includes(k))) { return 'poem'; }
    if (GHOST_KEYWORDS.some((k) => lower.includes(k))) { return 'ghost'; }
    if (ZHONGLI_KEYWORDS.some((k) => lower.includes(k))) { return 'zhongli'; }
    if (DEEP_SAD_KEYWORDS.some((k) => lower.includes(k))) { return 'deep_sad'; }
    if (SAD_KEYWORDS.some((k) => lower.includes(k))) { return 'sad'; }
    if (ENCOURAGEMENT_KEYWORDS.some((k) => lower.includes(k))) { return 'encourage'; }
    if (WORK_KEYWORDS.some((k) => lower.includes(k))) { return 'work'; }
    if (GREETING_KEYWORDS.some((k) => lower.includes(k))) { return 'greeting'; }
    return 'unknown';
}

function extractInfo(text: string): { type: string; detail: string } {
    const lower = text.toLowerCase();

    if (lower.includes('bug') || lower.includes('报错') || lower.includes('error')) {
        return { type: 'bug', detail: '嗯嗯，bug这种东西嘛~在本堂主眼里就是等待"超度"的幽灵！来，让我看看~' };
    }
    if (lower.includes('deadline') || lower.includes('赶') || lower.includes('来不及')) {
        return { type: 'deadline', detail: '嘿嘿，别急别急~在往生堂工作，本堂主最懂"deadline"了！冷静下来，一步一步来~' };
    }
    if (lower.includes('同事') || lower.includes('老板') || lower.includes('领导')) {
        return { type: 'people', detail: '人际关系嘛~本堂主的经验是：微笑面对所有人，然后在心里给他们念超度经……嘿嘿，开玩笑的~' };
    }
    return { type: 'general', detail: '' };
}

// ─── 主回复函数 ──────────────────────────────────────────

export function generateResponse(userMessage: string): string {
    const intent = analyzeIntent(userMessage);
    const info = extractInfo(userMessage);

    switch (intent) {
        case 'deep_sad':
            return getSolemnComfort();

        case 'sad':
            if (info.detail) {
                return `${getComfort()}\n\n${info.detail}`;
            }
            return getComfort();

        case 'encourage':
            return getEncourageLine();

        case 'work':
            if (info.detail) {
                return `${getWorkLine()}\n\n${info.detail}`;
            }
            return getWorkLine();

        case 'greeting':
            return getTimeBasedGreeting();

        case 'poem':
            return getPoem();

        case 'ghost':
            return getGhostStory();

        case 'zhongli':
            return getZhongliEasterEgg();

        default: {
            const responses = [
                '嗯？你说的本堂主没太明白~不过不管怎样，加油就对了！',
                '嘿嘿，虽然没太懂你的意思，但本堂主觉得你一定能行！',
                '哦~你想聊天吗？本堂主最喜欢聊天了！尤其是关于鬼故事的……啊不是，继续干活吧~',
                '本堂主歪着头想了想……还是不太明白。不过没关系，有什么需要尽管说！',
                '？……本堂主的脑回路虽然清奇，但也没理解你的意思呢~再说一次？',
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
    }
}

// ─── 代码问题分析 ─────────────────────────────────────────

export function analyzeCodeProblems(): string {
    const diagnostics = vscode.languages.getDiagnostics();
    let errors = 0;
    let warnings = 0;
    const topIssues: string[] = [];

    for (const [uri, diags] of diagnostics) {
        for (const d of diags) {
            if (d.severity === vscode.DiagnosticSeverity.Error) {
                errors++;
                if (topIssues.length < 5) {
                    topIssues.push(
                        `💀 [${uri.path.split('/').pop()}:${d.range.start.line + 1}] ${d.message}`,
                    );
                }
            } else if (d.severity === vscode.DiagnosticSeverity.Warning) {
                warnings++;
            }
        }
    }

    if (errors === 0 && warnings === 0) {
        return '哦呀~一个问题都没有！嘿嘿，你的代码像蝴蝶一样完美~本堂主今天无事可做了~';
    }

    const header =
        errors > 0
            ? `呜呜呜~发现了 ${errors} 个错误和 ${warnings} 个警告！这些代码需要"超度"一下了~`
            : `嗯，只有 ${warnings} 个警告，问题不大~不过本堂主还是建议你处理一下。`;

    const issues = topIssues.length > 0 ? '\n\n' + topIssues.join('\n') : '';

    const advice =
        errors > 3
            ? '\n\n本堂主建议你……先深呼吸，然后一个一个来~不要急！'
            : errors > 0
                ? '\n\n嘿嘿，还好不算太多~慢慢修，本堂主在这等着你！'
                : '';

    return `${header}${issues}${advice}`;
}

export { CODE_ANALYSIS_KEYWORDS };
