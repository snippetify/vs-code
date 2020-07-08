import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import Snippet from './Snippet';
import WebviewManager from './WebviewManager';
import { TextEncoder, TextDecoder } from 'util';

export default class SnippetManager {

    private static SAVED_SNIPPETS   = 'snippetify_saved_snippets';

    public static COPY_SNIPPET_CMD = 'snippetify.snippet_manager.copy';
    public static SAVE_SNIPPET_CMD = 'snippetify.snippet_manager.save';

    public static DISPLAY_SAVE_PANEL_CMD   = 'snippetify.snippet.save';
    public static DISPLAY_SHOW_PANEL_CMD   = 'snippetify.snippet.show';
    public static DISPLAY_SEARCH_PANEL_CMD = 'snippetify.snippet.search';

    static instance: SnippetManager;

    constructor(readonly ctx: vscode.ExtensionContext) {
        this.registerCommands();
    }

    static create(ctx: vscode.ExtensionContext): SnippetManager {
        if (!this.instance) { this.instance = new SnippetManager(ctx); }
        return this.instance;
    }

    private saveSnippet (snippet: Snippet): Promise<any> {
        return new Promise((resolve, reject) => {

            let snippets = this.ctx.globalState.get<Array<any>>(SnippetManager.SAVED_SNIPPETS, []);
            let index = snippets.findIndex(item => item.id === snippet.id);
            
            if (index === -1) {
                snippets.push(snippet.attributes);
            } else {
                snippets[index] = snippet.attributes;
            }
            // Save snippet to local storage
            this.ctx.globalState.update(SnippetManager.SAVED_SNIPPETS, snippets).then(() => {
                this.saveSnippetToFile(snippet).then(v => resolve(v)).catch(e => reject(e)); // Save to file
            }, e => reject(e));
        });
    }

    private saveSnippetToFile (snippet: Snippet): Promise<any> {
        return new Promise((resolve, reject) => {

            const wsedit = new vscode.WorkspaceEdit();
            const path   = !snippet.language ? 
                this.getGlobalSnippetFile() : 
                this.getLanguageSnippetFile(snippet.language.toLowerCase());
            
            wsedit.createFile(path, { ignoreIfExists: true });

            vscode.workspace.applyEdit(wsedit).then(() => {
                vscode.workspace.fs.readFile(path).then(data => {
                    
                    const val: string = new TextDecoder().decode(data).trim();
                    let snippets: any = JSON.parse(val.includes('{') ? val : '{}');

                    for (const key of Object.keys(snippets)) {
                        if (snippets[key].id === snippet.id) {
                            delete snippets[key];
                            break;
                        }
                    }

                    snippets[snippet.title] = {
                        "id": snippet.id,
                        "prefix": snippet.title,
                        "body": [snippet.code],
                        "description": snippet.desc
                    };

                    vscode.workspace
                        .fs
                        .writeFile(path, new TextEncoder().encode(JSON.stringify(snippets)))
                        .then(() => resolve(snippets), e => reject(e));
                }, e => reject(e));
            }, e => reject(e));
        });
    }

    private getSnippetsFolder (): string {
        return path.join(this.ctx.globalStoragePath.split('/User/')[0], 'User/snippets');
    }

    private getGlobalSnippetFile(): vscode.Uri {
        return vscode.Uri.parse(path.join(this.getSnippetsFolder(), 'snippetify.code-snippets'));
    }

    private getLanguageSnippetFile(language: string): vscode.Uri {
        return vscode.Uri.parse(path.join(this.getSnippetsFolder(), `${language}.json`));
    }

    private copySnippet (snippet: Snippet): Promise<any> {
        return new Promise((resolve, reject) => {
            const editor = vscode.window.activeTextEditor || vscode.window.visibleTextEditors[0] || undefined;
            if (!editor) { reject(); }
            editor?.insertSnippet(new vscode.SnippetString(snippet.code)).then(() => resolve(), e => reject(e));
        });
    }

    private registerCommands () {
        this.ctx.subscriptions.push(vscode.commands.registerCommand(SnippetManager.SAVE_SNIPPET_CMD, (snippet: Snippet) => {
            this.saveSnippet(snippet)
                .then(() => vscode.window.showInformationMessage('Snippet added to collections'))
                .catch(() => vscode.window.showErrorMessage('Snippet not added to collections'));
        }));

        this.ctx.subscriptions.push(vscode.commands.registerCommand(SnippetManager.COPY_SNIPPET_CMD, (snippet: Snippet) => {
            this.copySnippet(snippet)
                .then(() => vscode.window.showInformationMessage('Snippet inserted'))
                .catch(() => vscode.window.showErrorMessage('Snippet not inserted'));
        }));


        this.ctx.subscriptions.push(vscode.commands.registerCommand(SnippetManager.DISPLAY_SAVE_PANEL_CMD, () => {
            const editor = vscode.window.activeTextEditor || vscode.window.visibleTextEditors[0] || undefined;
            const text = editor.document.getText(editor.selection);
            vscode.commands.executeCommand(WebviewManager.SAVE_PANEL_CMD, new Snippet({ code: text }));
        }));

        this.ctx.subscriptions.push(vscode.commands.registerCommand(SnippetManager.DISPLAY_SHOW_PANEL_CMD, () => {
            
        }));

        this.ctx.subscriptions.push(vscode.commands.registerCommand(SnippetManager.DISPLAY_SEARCH_PANEL_CMD, () => {
            vscode.commands.executeCommand(WebviewManager.SEARCH_PANEL_CMD);
        }));
    }
}