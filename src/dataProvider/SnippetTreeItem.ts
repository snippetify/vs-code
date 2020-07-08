import * as vscode from 'vscode';

import Snippet from '../Snippet';
import SnippetManager from '../SnippetManager';

export default class SnippetTreeItem extends vscode.TreeItem {
    constructor (
        private readonly snippet: Snippet,
        public readonly contextValue: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(snippet.title, collapsibleState);
    }
  
    get id (): string {
        return `${this.snippet.id}`;
    }
  
    get tooltip (): string {
        return this.snippet.tags.map(v => v.name).join(' - ');
    }
  
    get description (): string {
        return this.snippet.desc;
    }
  
    get command (): vscode.Command {
        return {
            title: 'Show snippet',
            arguments: [this.snippet],
            command: SnippetManager.DISPLAY_SHOW_PANEL_CMD,
        };
    }

    get iconPath (): vscode.ThemeIcon {
        return new vscode.ThemeIcon('code');
    }
}