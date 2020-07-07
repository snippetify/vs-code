import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import Snippet from './Snippet';
import SnippetManager from './SnippetManager';

class WebviewManager {

    private SNIPPET_SAVE: string = 'snippetify.webview.save_snippet';
    private SNIPPET_SHOW: string = 'snippetify.webview.search_snippet';
    private SNIPPET_SEARCH: string = 'snippetify.webview.show_snippet';

    static instance: WebviewManager;
    private webviewPanel?: vscode.WebviewPanel = undefined;

    constructor(readonly ctx: vscode.ExtensionContext) {
        this.registerCommands();
    }

    static create(ctx: vscode.ExtensionContext): WebviewManager {
        if (!this.instance) { this.instance = new WebviewManager(ctx); }
        return this.instance;
    }

    private launchWebview (snippet?: Snippet, meta: object = {}) {
        if (!this.webviewPanel) {
            this.webviewPanel = vscode.window.createWebviewPanel(
                'snippetify',
                'Snippetify',
                vscode.ViewColumn.Beside,
                {
                    enableScripts: true,
                    localResourceRoots: [vscode.Uri.file(path.join(this.ctx.extensionPath, 'dist'))]
                }
            );
        }
        this.hydrateWebview(snippet, meta);
    }

    private hydrateWebview (snippet?: Snippet, meta: object = {}) {
        fs.readFile(path.join(this.ctx.extensionPath, 'dist', 'html', 'index.html'), (err, data) => {
            
            if (!this.webviewPanel) { return; }

            const token    = '';
            const webview  = this.webviewPanel.webview;
            const htmlPath = webview.asWebviewUri(vscode.Uri.file(path.join(this.ctx.extensionPath, 'dist/html')));
            webview.html   = String(data)
                .replace(/src=\//g, `src=${htmlPath}/`)
                .replace(/href=\//g, `href=${htmlPath}/`)
                .replace(/__cspSource__/g, String(webview.cspSource))
                .replace('</head>', `
                    <script>
                        (function() {
                            window.snippetify = {
                                meta: '${meta}',
                                token: '${token}',
                                snippet: ${snippet?.toArray()},
                                projectPath: '${htmlPath}',
                                vscode: acquireVsCodeApi()
                            };
                        }())
                    </script>
                    </head>
                `);
            
            webview.onDidReceiveMessage(e => {
                switch (e.action) {
                    case 'save':
                        vscode.commands.executeCommand(SnippetManager.SAVE_SNIPPET, new Snippet(e.snippet));
                        break;
                    case 'copy':
                        vscode.commands.executeCommand(SnippetManager.COPY_SNIPPET, new Snippet(e.snippet));
                        break;
                    case 'show':
                        vscode.window.showInformationMessage('show snippet');
                        console.log(JSON.stringify(e.snippet));
                        this.showSnippet(new Snippet(e.snippet));
                        break;
                    case 'close':
                        this.webviewPanel?.dispose();
                        break;
                    case 'alert':
                        if (e.type === 'error') { vscode.window.showErrorMessage(e.message); }
                        else if (e.type === 'success') { vscode.window.showInformationMessage(e.message); }
                        break;
                }
            }, undefined, this.ctx.subscriptions);
        });
    }

    public showSnippet (snippet?: Snippet, meta: object = {}) {
        this.launchWebview(snippet, { page: 'show', ...meta });
    }

    public searchSnippets (meta: object = {}) {
        this.launchWebview(undefined, { page: 'index', ...meta });
    }

    public saveSnippet (snippet?: Snippet, meta: object = {}) {
        this.launchWebview(snippet, { page: 'new', ...meta });
    }

    private registerCommands () {
        this.ctx.subscriptions.push(vscode.commands.registerCommand(this.SNIPPET_SAVE, (snippet?: Snippet, meta: object = {}) => {
            this.saveSnippet(snippet, meta);
        }));
        this.ctx.subscriptions.push(vscode.commands.registerCommand(this.SNIPPET_SHOW, (snippet?: Snippet, meta: object = {}) => {
            this.showSnippet(snippet, meta);
        }));
        this.ctx.subscriptions.push(vscode.commands.registerCommand(this.SNIPPET_SEARCH, (meta: object = {}) => {
            this.searchSnippets(meta);
        }));
    }

    get panel () {
        return this.webviewPanel;
    }
}

export default WebviewManager; 