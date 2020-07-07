import * as vscode from 'vscode';

import Snippet from './Snippet';

export default class SnippetManager {

    public static COPY_SNIPPET = 'snippetify.snippet.copy';
    public static SAVE_SNIPPET = 'snippetify.snippet.save';

    static instance: SnippetManager;

    constructor(readonly ctx: vscode.ExtensionContext) {
        this.registerCommands();
    }

    static create(ctx: vscode.ExtensionContext): SnippetManager {
        if (!this.instance) { this.instance = new SnippetManager(ctx); }
        return this.instance;
    }

    private saveSnippet (snippet: Snippet) {
        console.log('saveeeeeee');
        vscode.window.showErrorMessage('received message');
    }

    private copySnippet (snippet: Snippet) {
        console.log('copyyyyyy....');
    }

    private registerCommands () {
        this.ctx.subscriptions.push(vscode.commands.registerCommand(SnippetManager.SAVE_SNIPPET, (snippet: Snippet) => {
            this.saveSnippet(snippet);
        }));
        this.ctx.subscriptions.push(vscode.commands.registerCommand(SnippetManager.COPY_SNIPPET, (snippet: Snippet) => {
            this.copySnippet(snippet);
        }));
    }
}