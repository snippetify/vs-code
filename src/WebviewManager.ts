import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import Snippet from './Snippet';
import SnippetManager from './SnippetManager';

class WebviewManager {

    public static SAVE_PANEL_CMD: string   = 'snippetify.webview.save_panel';
    public static SHOW_PANEL_CMD: string   = 'snippetify.webview.show_panel';
    public static CLOSE_PANEL_CMD: string  = 'snippetify.webview.close_panel';
    public static SEARCH_PANEL_CMD: string = 'snippetify.webview.search_panel';

    static instance: WebviewManager;
    
    private config: any;
    private webviewPanel?: vscode.WebviewPanel = undefined;

    constructor(readonly ctx: vscode.ExtensionContext) {
        this.registerCommands();
        this.config = vscode.workspace.getConfiguration('snippetify');
    }

    static create(ctx: vscode.ExtensionContext): WebviewManager {
        if (!this.instance) { this.instance = new WebviewManager(ctx); }
        return this.instance;
    }

    private launchWebview (snippet?: Snippet, meta: any = {}) {
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

            this.webviewPanel.onDidDispose(() => {
                this.webviewPanel = undefined;
            }, undefined, this.ctx.subscriptions);

            this.webviewPanel.webview.onDidReceiveMessage(e => {
                switch (e.action) {
                    case 'save':
                        vscode.commands.executeCommand(SnippetManager.SAVE_SNIPPET_CMD, new Snippet(e.snippet));
                        break;
                    case 'copy':
                        vscode.commands.executeCommand(SnippetManager.COPY_SNIPPET_CMD, new Snippet(e.snippet));
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
        }

        this.hydrateWebview(snippet, meta);
        
        this.webviewPanel.reveal(vscode.ViewColumn.Beside);
    }

    private hydrateWebview (snippet?: Snippet, meta: any = {}) {
        fs.readFile(path.join(this.ctx.extensionPath, 'dist', 'html', 'index.html'), (err, data) => {
            
            if (!this.webviewPanel) { return; }

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
                                meta: ${JSON.stringify(meta)},
                                token: '${this.config.token}',
                                snippet: ${JSON.stringify(snippet?.attributes)},
                                projectPath: '${htmlPath}',
                                vscode: acquireVsCodeApi()
                            };
                        }())
                    </script>
                    </head>
                `);
        });
    }

    public showSnippet (snippet: Snippet, meta: any = {}) {
        this.launchWebview(snippet, { page: 'show', ...meta });
    }

    public searchSnippets (meta: any = {}) {
        this.launchWebview(undefined, { page: 'index', ...meta });
    }

    public saveSnippet (snippet: Snippet, meta: any = {}) {
        this.launchWebview(snippet, { page: 'new', ...meta });
    }

    private registerCommands () {
        this.ctx.subscriptions.push(vscode.commands.registerCommand(WebviewManager.SAVE_PANEL_CMD, (snippet: Snippet, meta: any = {}) => {
            this.saveSnippet(snippet, meta);
        }));

        this.ctx.subscriptions.push(vscode.commands.registerCommand(WebviewManager.SHOW_PANEL_CMD, (snippet: Snippet, meta: any = {}) => {
            this.showSnippet(snippet, meta);
        }));

        this.ctx.subscriptions.push(vscode.commands.registerCommand(WebviewManager.SEARCH_PANEL_CMD, (meta: any = {}) => {
            this.searchSnippets(meta);
        }));

        this.ctx.subscriptions.push(vscode.commands.registerCommand(WebviewManager.CLOSE_PANEL_CMD, () => {
            this.webviewPanel?.dispose();
        }));
    }

    get panel () {
        return this.webviewPanel;
    }
}

export default WebviewManager; 