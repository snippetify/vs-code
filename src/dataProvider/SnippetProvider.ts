import * as vscode from 'vscode';

import SnippetManager from '../SnippetManager';
import SnippetTreeItem from './SnippetTreeItem';

export default class SnippetProvider implements vscode.TreeDataProvider<SnippetTreeItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<SnippetTreeItem | undefined> = new vscode.EventEmitter<SnippetTreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<SnippetTreeItem | undefined> = this._onDidChangeTreeData.event;

    constructor(
        private readonly ctx: vscode.ExtensionContext,
        public readonly contextValue: string,
        private download: boolean = false,
    ) {}

    public getTreeItem(element: SnippetTreeItem): vscode.TreeItem {
        return element;
    }

    public getChildren(element?: SnippetTreeItem): Thenable<SnippetTreeItem[]> {
        return new Promise((resolve, reject) => {
            SnippetManager.create(this.ctx)
                .getSnippets(this.contextValue, this.download)
                .then(v => resolve(v.map(i => new SnippetTreeItem(i, this.contextValue, vscode.TreeItemCollapsibleState.None))))
                .catch(e => reject(e));
        });
    }

    public refresh(download: boolean = false, data: SnippetTreeItem | undefined = undefined): void {
        this.download = download;
        this._onDidChangeTreeData.fire(data);
    }
}