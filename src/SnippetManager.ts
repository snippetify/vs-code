import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { TextEncoder, TextDecoder } from 'util';

import Axios from './Axios';
import Snippet from './Snippet';
import WebviewManager from './WebviewManager';
import TreeViewManager from './TreeViewManager';

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
            let index    = snippets.findIndex(item => item.id === snippet.id);
            
            if (index === -1) {
                snippets.push(snippet.attributes);
            } else {
                snippets[index] = snippet.attributes;
            }
            // Save snippet to local storage
            this.ctx.globalState.update(SnippetManager.SAVED_SNIPPETS, snippets).then(() => {
                this.updateFileSnippet(snippet).then(v => resolve(v), e => reject(e)); // Save to file
            }, e => reject(e));
        });
    }

    private updateFileSnippet (snippet: Snippet, remove: boolean = false): Promise<any> {
        return new Promise(async (resolve, reject) => {

            const wsedit = new vscode.WorkspaceEdit();
            const langs  = await vscode.languages.getLanguages();
            const lang   = (snippet.language || '').trim().toLowerCase();
            const path   = !langs.includes(lang) ? this.getGlobalSnippetFile() : this.getLanguageSnippetFile(lang);
            
            wsedit.createFile(path, { ignoreIfExists: true });

            vscode.workspace.applyEdit(wsedit).then(() => {
                vscode.workspace.fs.readFile(path).then(data => {
                    
                    const val: string = new TextDecoder().decode(data).trim();
                    let snippets: any = JSON.parse(val.includes('{') ? val : '{}');

                    // Remove snippet by id to update it later
                    for (const key of Object.keys(snippets)) {
                        if (snippets[key].id === snippet.id) {
                            delete snippets[key];
                            break;
                        }
                    }

                    // If remove do not update
                    if (!remove) {
                        snippets[snippet.title] = {
                            "id": snippet.id,
                            "prefix": snippet.title,
                            "body": [snippet.code],
                            "description": snippet.desc
                        };
                    }

                    vscode.workspace
                        .fs
                        .writeFile(path, new TextEncoder().encode(JSON.stringify(snippets)))
                        .then(() => resolve(snippets), e => reject(e));
                    
                }, e => reject(e));
            }, e => reject(e));
        });
    }

    private deleteSnippetFile (snippet: Snippet): Promise<void> {
        return new Promise(async (resolve, reject) => {
            
            const langs  = await vscode.languages.getLanguages();
            const lang   = (snippet.language || '').trim().toLowerCase();
            const path   = !langs.includes(lang) ? this.getGlobalSnippetFile() : this.getLanguageSnippetFile(lang);
            
            if (this.pathExists(path.toString())) {
                vscode.workspace.fs.delete(path).then(() => resolve(), e => reject(e));
            } else {
                resolve();
            }
        });
    }

    private pathExists(path: string): boolean {
        try {
            fs.accessSync(path);
        } catch (err) {
            return false;
        }
        return true;
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

    public downloadSnippets (type: string = 'me'): Promise<any> {
        return new Promise((resolve, reject) => {
            Axios.instance(this.ctx)
                .request({
                    url: 'snippets/me/download',
                    method: 'get',
                    data: { type: type }
                })
                .then(res => {
                    let promises: Array<Promise<any>> = [];
                    res.data.forEach((item: any) => {
                        promises.push(this.saveSnippet(new Snippet(item)));
                    });
                    Promise.all(promises)
                        .then(v => resolve(v))
                        .catch(e => {
                            reject(e);
                            vscode.window.showErrorMessage('Cannot save downloaded snippets');
                        });
                })
                .catch(e => {
                    reject(e);
                    vscode.window.showErrorMessage('Cannot download snippets');
                });
        });
    }

    public getSnippets (type: string = 'me', download: boolean = false): Promise<Snippet[]> {
        return new Promise(async (resolve, reject) => {
            if (download && ['me', 'favorite'].includes(type)) {
                try {
                    await this.downloadSnippets(type);
                } catch (e) {
                    reject(e);
                    return;
                }
            }
            resolve((this.ctx.globalState.get<any[]>(SnippetManager.SAVED_SNIPPETS) || [])
                .filter(item => {
                    return (type === 'me' && item.is_owner) || 
                        (type === 'favorite' && item.is_favorite) || 
                        (!['me', 'favorite'].includes(type) && !item.is_owner);
                })
                .map((item: any) => new Snippet(item)));
        });
    }

    public hasSnippets (type: string = 'me'): boolean {
        return (this.ctx.globalState.get<any[]>(SnippetManager.SAVED_SNIPPETS) || [])
            .filter(item => {
                return (type === 'me' && item.is_owner) || 
                    (type === 'favorite' && item.is_favorite) || 
                    (!['me', 'favorite'].includes(type) && !item.is_owner);
            })
            .length > 0;
    }

    public deleteSnippets (type: string = 'me'): Promise<Snippet[]> {
        return new Promise(async (resolve, reject) => {
            // Get Snippets to save
            const snippets = (this.ctx.globalState.get<any[]>(SnippetManager.SAVED_SNIPPETS) || [])
            .filter(item => {
                return (type === 'me' && !item.is_owner) || 
                (type === 'favorite' && !item.is_favorite) || 
                (!['me', 'favorite'].includes(type) && (item.is_owner || item.is_favorite));
            });

            // Get Snippets to remove
            this.getSnippets(type).then(snipts => {
                // Update snippets storage with new snippets
                this.ctx.globalState.update(SnippetManager.SAVED_SNIPPETS, snippets).then(() => {
                    // Update snippets file storage with new snippets
                    Promise.all(snipts.map(v => this.updateFileSnippet(new Snippet(v), true)))
                    .then(() => {
                        resolve(snipts);
                    }, e => reject(e));
                }, e => reject(e));
            }, e => reject(e));
        });
    }

    private registerCommands () {
        this.ctx.subscriptions.push(vscode.commands.registerCommand(SnippetManager.SAVE_SNIPPET_CMD, (snippet: Snippet) => {
            this.saveSnippet(snippet)
                .then(() => {
                    vscode.window.showInformationMessage('Snippet added to collections');
                    vscode.commands.executeCommand(TreeViewManager.REFRESH_COLLECTION_CMD); // Refresh collection
                })
                .catch(() => vscode.window.showErrorMessage('Snippet not added to collections'));
        }));

        this.ctx.subscriptions.push(vscode.commands.registerCommand(SnippetManager.COPY_SNIPPET_CMD, (snippet: Snippet) => {
            this.copySnippet(snippet)
                .then(() => vscode.window.showInformationMessage('Snippet inserted'))
                .catch(() => vscode.window.showErrorMessage('Snippet not inserted'));
        }));


        this.ctx.subscriptions.push(vscode.commands.registerCommand(SnippetManager.DISPLAY_SAVE_PANEL_CMD, () => {
            const editor = vscode.window.activeTextEditor || vscode.window.visibleTextEditors[0] || undefined;
            const lang = editor.document.languageId;
            const text = editor.document.getText(editor.selection);
            vscode.commands.executeCommand(WebviewManager.SAVE_PANEL_CMD, new Snippet({ code: text, tags: [{ name: lang }] }));
        }));

        this.ctx.subscriptions.push(vscode.commands.registerCommand(SnippetManager.DISPLAY_SHOW_PANEL_CMD, (snippet: Snippet) => {
            vscode.commands.executeCommand(WebviewManager.SHOW_PANEL_CMD, snippet);
        }));

        this.ctx.subscriptions.push(vscode.commands.registerCommand(SnippetManager.DISPLAY_SEARCH_PANEL_CMD, () => {
            vscode.commands.executeCommand(WebviewManager.SEARCH_PANEL_CMD);
        }));
    }
}