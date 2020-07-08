// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import WebviewManager from './WebviewManager';
import SnippetManager from './SnippetManager';
import TreeViewManager from './TreeViewManager';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	WebviewManager.create(context); // Webview manager
	SnippetManager.create(context); // Snippet manager
	TreeViewManager.create(context); // TreeView manager
}

// this method is called when your extension is deactivated
export function deactivate() {}
