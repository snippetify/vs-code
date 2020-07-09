import * as vscode from 'vscode';

import WebviewManager from './WebviewManager';
import SnippetManager from './SnippetManager';
import SnippetProvider from './dataProvider/SnippetProvider';

export default class TreeViewManager {

    public static DELETE_COLLECTION_CMD           = 'snippetify.collection.all.delete';
    public static REFRESH_COLLECTION_CMD          = 'snippetify.collection.all.refresh';
    public static DELETE_COLLECTION_MINE_CMD      = 'snippetify.collection.mine.delete';
    public static REFRESH_COLLECTION_MINE_CMD     = 'snippetify.collection.mine.refresh';
    public static DELETE_COLLECTION_FAVORITE_CMD  = 'snippetify.collection.favorite.delete';
    public static REFRESH_COLLECTION_FAVORITE_CMD = 'snippetify.collection.favorite.refresh';

    static instance: TreeViewManager;

    private collectionProvider?: SnippetProvider;
    private userSnippetProvider?: SnippetProvider;
    private userFavoriteProvider?: SnippetProvider;

    private statusBarItem?: vscode.StatusBarItem;
    private snippetManager: SnippetManager;

    constructor(readonly ctx: vscode.ExtensionContext) {
        
        this.snippetManager = SnippetManager.create(this.ctx);

        this.registerCommands();
        this.registerProviders();
        this.createStatusBarItem();
    }

    static create(ctx: vscode.ExtensionContext): TreeViewManager {
        if (!this.instance) { this.instance = new TreeViewManager(ctx); }
        return this.instance;
    }

    private registerProviders () {
        this.collectionProvider = new SnippetProvider(this.ctx, 'collection');
        this.userSnippetProvider = new SnippetProvider(this.ctx, 'me', !this.snippetManager.hasSnippets('me'));
        this.userFavoriteProvider = new SnippetProvider(this.ctx, 'favorite', !this.snippetManager.hasSnippets('favorite'));
        
        vscode.window.registerTreeDataProvider('my-snippets', this.userSnippetProvider);
        vscode.window.registerTreeDataProvider('favorite-snippets', this.userFavoriteProvider);
        vscode.window.registerTreeDataProvider('snippet-collections', this.collectionProvider);
    }

    public removeCollection () {
        const msg = "Are you sure you want to delete your snippet's collections";
        vscode.window.showQuickPick(['Yes', 'No'], { canPickMany: false, placeHolder: msg }).then(v => {
            if (v && v.includes('Yes')) {
                this.snippetManager.deleteSnippets('collection')
                    .then(v => {
                        this.collectionProvider?.refresh();
                        vscode.window.showInformationMessage(`Snippet's collections deleted. (${v.length})`)
                    })
                    .catch(() => vscode.window.showErrorMessage("Cannot delete your snippet's collections"));
            }
        });
    }

    public removeMySnippets () {
        const msg = "Are you sure you want to remove your own snippets from collections";
        vscode.window.showQuickPick(['Yes', 'No'], { canPickMany: false, placeHolder: msg }).then(v => {
            if (v && v.includes('Yes')) {
                this.snippetManager.deleteSnippets('me')
                    .then(v => {
                        this.userSnippetProvider?.refresh();
                        vscode.window.showInformationMessage(`Snippets removed from collection. (${v.length})`);
                    })
                    .catch(() => vscode.window.showErrorMessage("Cannot remove your snippets from collection"));
            }
        });
    }
    
    public removeFavoriteSnippets () {
        const msg = "Are you sure you want to remove your favorite snippets from collections";
        vscode.window.showQuickPick(['Yes', 'No'], { canPickMany: false, placeHolder: msg }).then(v => {
            if (v && v.includes('Yes')) {
                this.snippetManager.deleteSnippets('favorite')
                    .then(v => {
                        this.userFavoriteProvider?.refresh();
                        vscode.window.showInformationMessage(`Favorite snippets removed from collections. (${v.length})`);
                    })
                    .catch(() => vscode.window.showErrorMessage("Cannot remove your favorite snippets from collection"));
            }
        });
    }

    private createStatusBarItem () {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
        this.statusBarItem.text = 'Snippetify';
        this.statusBarItem.command = WebviewManager.SEARCH_PANEL_CMD;
        this.statusBarItem.tooltip = 'Show Snippetify commands';
        this.ctx.subscriptions.push(this.statusBarItem);
        this.statusBarItem.show();
    }

    private registerCommands () {
        this.ctx.subscriptions.push(vscode.commands.registerCommand(TreeViewManager.DELETE_COLLECTION_CMD, () => {
            this.removeCollection();
        }));
        this.ctx.subscriptions.push(vscode.commands.registerCommand(TreeViewManager.DELETE_COLLECTION_MINE_CMD, () => {
            this.removeMySnippets();
        }));
        this.ctx.subscriptions.push(vscode.commands.registerCommand(TreeViewManager.DELETE_COLLECTION_FAVORITE_CMD, () => {
            this.removeFavoriteSnippets();
        }));

        this.ctx.subscriptions.push(vscode.commands.registerCommand(TreeViewManager.REFRESH_COLLECTION_CMD, () => {
            this.collectionProvider?.refresh();
        }));

        this.ctx.subscriptions.push(vscode.commands.registerCommand(TreeViewManager.REFRESH_COLLECTION_MINE_CMD, () => {
            if ((vscode.workspace.getConfiguration('snippetify').token || '').trim().length > 0) {
                this.userSnippetProvider?.refresh(true);
            } else {
                vscode.window.showErrorMessage("You are not authenticated!");
            }
        }));

        this.ctx.subscriptions.push(vscode.commands.registerCommand(TreeViewManager.REFRESH_COLLECTION_FAVORITE_CMD, () => {
            if ((vscode.workspace.getConfiguration('snippetify').token || '').trim().length > 0) {
                this.userFavoriteProvider?.refresh(true);
            } else {
                vscode.window.showErrorMessage("You are not authenticated!");
            }
        }));
    }
}