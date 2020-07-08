import * as fs from 'fs';
import * as path from 'path';
import * as axios from 'axios';
import * as vscode from 'vscode';

export default class Axios {

    private static _instance: axios.AxiosInstance;

    static instance(ctx: vscode.ExtensionContext): axios.AxiosInstance {

        const manifest = JSON.parse(fs.readFileSync(path.join(ctx.extensionPath, 'package.json'), 'utf-8'));
        
        if (!this._instance) {
            this._instance = axios.default.create({
                baseURL: manifest.baseURL || ''
            });
        }
        
        const token = vscode.workspace.getConfiguration('snippetify').token;
        
        if (token.trim().length > 0) {
            this._instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        return this._instance;
    }
}