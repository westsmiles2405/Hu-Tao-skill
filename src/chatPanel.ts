/**
 * 胡桃聊天面板 — Webview sidebar，含统计栏、打字机动效、角色头像
 */

import * as vscode from 'vscode';
import * as crypto from 'crypto';
import { HutaoStats } from './stats';

function getNonce(): string {
    return crypto.randomBytes(16).toString('hex');
}

interface PendingMessage {
    from: 'hutao' | 'user';
    text: string;
}

export class HutaoChatPanel implements vscode.WebviewViewProvider {
    public static readonly viewType = 'hutao.chatPanel';
    private view?: vscode.WebviewView;
    private messages: PendingMessage[] = [];
    private onUserMessage?: (msg: string) => void;
    private latestStats?: HutaoStats;

    constructor(private readonly extensionUri: vscode.Uri) { }

    public setOnUserMessage(cb: (msg: string) => void): void {
        this.onUserMessage = cb;
    }

    public updateStats(stats: HutaoStats): void {
        this.latestStats = stats;
        if (this.view) {
            this.view.webview.postMessage({
                type: 'updateStats',
                stats,
            });
        }
    }

    public addBotMessage(text: string): void {
        this.messages.push({ from: 'hutao', text });
        this.trimMessages();
        this.syncMessages();
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ): void {
        this.view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri],
        };
        webviewView.webview.html = this.getHtml(webviewView.webview);

        webviewView.webview.onDidReceiveMessage((msg) => {
            if (msg.type === 'userMessage' && typeof msg.text === 'string') {
                const trimmed = msg.text.trim();
                if (trimmed && trimmed.length <= 500) {
                    this.messages.push({ from: 'user', text: trimmed });
                    this.trimMessages();
                    this.syncMessages();
                    this.onUserMessage?.(trimmed);
                }
            }
        });

        this.syncMessages();
    }

    private trimMessages(): void {
        const max = 200;
        if (this.messages.length > max) {
            this.messages = this.messages.slice(this.messages.length - max);
        }
    }

    private syncMessages(): void {
        if (!this.view) { return; }
        this.view.webview.postMessage({
            type: 'messages',
            messages: this.messages,
        });
        if (this.latestStats) {
            this.view.webview.postMessage({
                type: 'updateStats',
                stats: this.latestStats,
            });
        }
    }

    private getHtml(webview: vscode.Webview): string {
        const nonce = getNonce();

        return /*html*/ `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"/>
<meta http-equiv="Content-Security-Policy"
      content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style nonce="${nonce}">
:root {
  --hutao-red: #c62828;
  --hutao-red-light: #ef5350;
  --hutao-pink: #f48fb1;
  --hutao-teal: #4db6ac;
  --bg: var(--vscode-sideBar-background, #1e1e1e);
  --fg: var(--vscode-sideBar-foreground, #cccccc);
  --input-bg: var(--vscode-input-background, #3c3c3c);
  --input-fg: var(--vscode-input-foreground, #cccccc);
  --border: var(--vscode-input-border, #555);
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: var(--vscode-font-family, sans-serif);
  font-size: var(--vscode-font-size, 13px);
  background: var(--bg); color: var(--fg);
  display: flex; flex-direction: column; height: 100vh; overflow: hidden;
}
#header {
  text-align: center; padding: 10px 8px 6px;
  border-bottom: 2px solid var(--hutao-red);
}
#header h2 { font-size: 15px; color: var(--hutao-red-light); }
#header small { font-size: 11px; opacity: 0.6; }
#stats-bar {
  display: flex; justify-content: space-around;
  padding: 4px 8px; font-size: 11px; opacity: 0.7;
  border-bottom: 1px solid var(--border);
}
#chat {
  flex: 1; overflow-y: auto; padding: 8px;
  display: flex; flex-direction: column; gap: 8px;
}
.msg {
  display: flex; gap: 6px; max-width: 95%;
  animation: fadeIn 0.3s ease;
}
.msg.hutao { align-self: flex-start; }
.msg.user  { align-self: flex-end; flex-direction: row-reverse; }
.avatar {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; flex-shrink: 0;
}
.msg.hutao .avatar { background: var(--hutao-red); }
.msg.user  .avatar { background: var(--hutao-teal); }
.bubble {
  padding: 6px 10px; border-radius: 10px;
  white-space: pre-wrap; word-break: break-word; line-height: 1.5;
}
.msg.hutao .bubble { background: #3b1515; border: 1px solid var(--hutao-red); }
.msg.user  .bubble { background: #1a3333; border: 1px solid var(--hutao-teal); }
.name { font-size: 10px; opacity: 0.5; margin-bottom: 2px; }
.msg.hutao .name { color: var(--hutao-pink); }
.msg.user  .name { color: var(--hutao-teal); text-align: right; }
.cursor-blink {
  display: inline-block; width: 2px; height: 1em;
  background: var(--hutao-pink); margin-left: 1px;
  animation: blink 0.6s step-end infinite;
  vertical-align: text-bottom;
}
@keyframes blink { 50% { opacity: 0; } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
#input-area {
  display: flex; padding: 6px 8px; gap: 4px;
  border-top: 1px solid var(--border);
}
#input-area input {
  flex: 1; background: var(--input-bg); color: var(--input-fg);
  border: 1px solid var(--border); border-radius: 4px;
  padding: 5px 8px; outline: none; font-size: 13px;
}
#input-area button {
  background: var(--hutao-red); border: none; color: #fff;
  padding: 5px 12px; border-radius: 4px; cursor: pointer;
  font-size: 13px;
}
#input-area button:hover { background: var(--hutao-red-light); }
</style>
</head>
<body>
  <div id="header">
    <h2>🦋 胡桃的往生堂</h2>
    <small>写代码 · 番茄钟 · 送葬式审判</small>
  </div>
  <div id="stats-bar">
    <span>🍅 番茄 <b id="st-pom">0</b></span>
    <span>💬 对话 <b id="st-msg">0</b></span>
    <span>💾 保存 <b id="st-sav">0</b></span>
  </div>
  <div id="chat"></div>
  <div id="input-area">
    <input id="user-input" placeholder="跟胡桃说点什么~" />
    <button id="send-btn">发送</button>
  </div>
<script nonce="${nonce}">
(function(){
  var vscode = acquireVsCodeApi();
  var chat = document.getElementById('chat');
  var inp  = document.getElementById('user-input');
  var btn  = document.getElementById('send-btn');
  var renderedCount = 0;
  var typeQueue = [];
  var typing = false;

  function send() {
    var t = inp.value.trim();
    if (!t) return;
    vscode.postMessage({ type: 'userMessage', text: t });
    inp.value = '';
  }
  btn.addEventListener('click', send);
  inp.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') send();
  });

  window.addEventListener('message', function(e) {
    var msg = e.data;
    if (msg.type === 'messages') renderAll(msg.messages);
    if (msg.type === 'updateStats') updateStats(msg.stats);
  });

  function updateStats(s) {
    document.getElementById('st-pom').textContent = s.todayPomodoros || 0;
    document.getElementById('st-msg').textContent = s.todayMessages || 0;
    document.getElementById('st-sav').textContent = s.todaySaves || 0;
  }

  function renderAll(msgs) {
    for (var i = renderedCount; i < msgs.length; i++) {
      var m = msgs[i];
      var row = document.createElement('div');
      row.className = 'msg ' + m.from;
      var avatar = document.createElement('div');
      avatar.className = 'avatar';
      avatar.textContent = m.from === 'hutao' ? '🦋' : '🌸';
      var col = document.createElement('div');
      var name = document.createElement('div');
      name.className = 'name';
      name.textContent = m.from === 'hutao' ? '胡桃' : '旅行者';
      var bubble = document.createElement('div');
      bubble.className = 'bubble';
      col.appendChild(name);
      col.appendChild(bubble);
      row.appendChild(avatar);
      row.appendChild(col);
      chat.appendChild(row);

      if (m.from === 'hutao' && i >= renderedCount) {
        enqueueType(bubble, m.text);
      } else {
        bubble.textContent = m.text;
      }
    }
    renderedCount = msgs.length;
    chat.scrollTop = chat.scrollHeight;
  }

  function enqueueType(el, text) {
    typeQueue.push({ el: el, text: text });
    if (!typing) processQueue();
  }

  function processQueue() {
    if (typeQueue.length === 0) { typing = false; return; }
    typing = true;
    var job = typeQueue.shift();
    typeText(job.el, job.text, function() { processQueue(); });
  }

  function typeText(el, text, cb) {
    var idx = 0;
    var speed = text.length > 60 ? 20 : text.length > 30 ? 30 : 45;
    var cur = document.createElement('span');
    cur.className = 'cursor-blink';
    el.appendChild(cur);
    var timer = setInterval(function() {
      if (idx < text.length) {
        el.insertBefore(document.createTextNode(text[idx]), cur);
        idx++;
        chat.scrollTop = chat.scrollHeight;
      } else {
        clearInterval(timer);
        if (cur.parentNode) cur.parentNode.removeChild(cur);
        if (cb) cb();
      }
    }, speed);
  }
})();
</script>
</body>
</html>`;
    }
}
