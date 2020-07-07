module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/extension.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/Snippet.ts":
/*!************************!*\
  !*** ./src/Snippet.ts ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Snippet {
    constructor(attributes) {
        this.attributes = attributes;
    }
    get title() { return this.attributes.title; }
    get code() { return this.attributes.code; }
    get type() { return this.attributes.type; }
    get tags() { return this.attributes.tags; }
    get meta() { return this.attributes.meta; }
    get desc() { return this.attributes.description; }
    get toArray() { return this.attributes; }
}
exports.default = Snippet;


/***/ }),

/***/ "./src/SnippetManager.ts":
/*!*******************************!*\
  !*** ./src/SnippetManager.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(/*! vscode */ "vscode");
class SnippetManager {
    constructor(ctx) {
        this.ctx = ctx;
        this.registerCommands();
    }
    static create(ctx) {
        if (!this.instance) {
            this.instance = new SnippetManager(ctx);
        }
        return this.instance;
    }
    saveSnippet(snippet) {
        console.log('saveeeeeee');
        vscode.window.showErrorMessage('received message');
    }
    copySnippet(snippet) {
        console.log('copyyyyyy....');
    }
    registerCommands() {
        this.ctx.subscriptions.push(vscode.commands.registerCommand(SnippetManager.SAVE_SNIPPET, (snippet) => {
            this.saveSnippet(snippet);
        }));
        this.ctx.subscriptions.push(vscode.commands.registerCommand(SnippetManager.COPY_SNIPPET, (snippet) => {
            this.copySnippet(snippet);
        }));
    }
}
exports.default = SnippetManager;
SnippetManager.COPY_SNIPPET = 'snippetify.snippet.copy';
SnippetManager.SAVE_SNIPPET = 'snippetify.snippet.save';


/***/ }),

/***/ "./src/WebviewManager.ts":
/*!*******************************!*\
  !*** ./src/WebviewManager.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
const vscode = __webpack_require__(/*! vscode */ "vscode");
const Snippet_1 = __webpack_require__(/*! ./Snippet */ "./src/Snippet.ts");
const SnippetManager_1 = __webpack_require__(/*! ./SnippetManager */ "./src/SnippetManager.ts");
class WebviewManager {
    constructor(ctx) {
        this.ctx = ctx;
        this.SNIPPET_SAVE = 'snippetify.webview.save_snippet';
        this.SNIPPET_SHOW = 'snippetify.webview.search_snippet';
        this.SNIPPET_SEARCH = 'snippetify.webview.show_snippet';
        this.webviewPanel = undefined;
        this.registerCommands();
    }
    static create(ctx) {
        if (!this.instance) {
            this.instance = new WebviewManager(ctx);
        }
        return this.instance;
    }
    launchWebview(snippet, meta = {}) {
        if (!this.webviewPanel) {
            this.webviewPanel = vscode.window.createWebviewPanel('snippetify', 'Snippetify', vscode.ViewColumn.Beside, {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(this.ctx.extensionPath, 'dist'))]
            });
        }
        this.hydrateWebview(snippet, meta);
    }
    hydrateWebview(snippet, meta = {}) {
        fs.readFile(path.join(this.ctx.extensionPath, 'dist', 'html', 'index.html'), (err, data) => {
            if (!this.webviewPanel) {
                return;
            }
            const token = '';
            const webview = this.webviewPanel.webview;
            const htmlPath = webview.asWebviewUri(vscode.Uri.file(path.join(this.ctx.extensionPath, 'dist/html')));
            webview.html = String(data)
                .replace(/src=\//g, `src=${htmlPath}/`)
                .replace(/href=\//g, `href=${htmlPath}/`)
                .replace(/__cspSource__/g, String(webview.cspSource))
                .replace('</head>', `
                    <script>
                        (function() {
                            window.snippetify = {
                                meta: '${meta}',
                                token: '${token}',
                                snippet: ${snippet === null || snippet === void 0 ? void 0 : snippet.toArray()},
                                projectPath: '${htmlPath}',
                                vscode: acquireVsCodeApi()
                            };
                        }())
                    </script>
                    </head>
                `);
            webview.onDidReceiveMessage(e => {
                var _a;
                switch (e.action) {
                    case 'save':
                        vscode.commands.executeCommand(SnippetManager_1.default.SAVE_SNIPPET, new Snippet_1.default(e.snippet));
                        break;
                    case 'copy':
                        vscode.commands.executeCommand(SnippetManager_1.default.COPY_SNIPPET, new Snippet_1.default(e.snippet));
                        break;
                    case 'show':
                        vscode.window.showInformationMessage('show snippet');
                        console.log(JSON.stringify(e.snippet));
                        this.showSnippet(new Snippet_1.default(e.snippet));
                        break;
                    case 'close':
                        (_a = this.webviewPanel) === null || _a === void 0 ? void 0 : _a.dispose();
                        break;
                    case 'alert':
                        if (e.type === 'error') {
                            vscode.window.showErrorMessage(e.message);
                        }
                        else if (e.type === 'success') {
                            vscode.window.showInformationMessage(e.message);
                        }
                        break;
                }
            }, undefined, this.ctx.subscriptions);
        });
    }
    showSnippet(snippet, meta = {}) {
        this.launchWebview(snippet, Object.assign({ page: 'show' }, meta));
    }
    searchSnippets(meta = {}) {
        this.launchWebview(undefined, Object.assign({ page: 'index' }, meta));
    }
    saveSnippet(snippet, meta = {}) {
        this.launchWebview(snippet, Object.assign({ page: 'new' }, meta));
    }
    registerCommands() {
        this.ctx.subscriptions.push(vscode.commands.registerCommand(this.SNIPPET_SAVE, (snippet, meta = {}) => {
            this.saveSnippet(snippet, meta);
        }));
        this.ctx.subscriptions.push(vscode.commands.registerCommand(this.SNIPPET_SHOW, (snippet, meta = {}) => {
            this.showSnippet(snippet, meta);
        }));
        this.ctx.subscriptions.push(vscode.commands.registerCommand(this.SNIPPET_SEARCH, (meta = {}) => {
            this.searchSnippets(meta);
        }));
    }
    get panel() {
        return this.webviewPanel;
    }
}
exports.default = WebviewManager;


/***/ }),

/***/ "./src/extension.ts":
/*!**************************!*\
  !*** ./src/extension.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __webpack_require__(/*! vscode */ "vscode");
const WebviewManager_1 = __webpack_require__(/*! ./WebviewManager */ "./src/WebviewManager.ts");
const SnippetManager_1 = __webpack_require__(/*! ./SnippetManager */ "./src/SnippetManager.ts");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "snippetify" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('snippetify.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from Snippetify!');
    });
    // Webview manager
    WebviewManager_1.default.create(context);
    SnippetManager_1.default.create(context);
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;


/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),

/***/ "vscode":
/*!*************************!*\
  !*** external "vscode" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("vscode");

/***/ })

/******/ });
//# sourceMappingURL=extension.js.map