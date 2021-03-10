// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(
		vscode.commands.registerCommand('aspectRatio.openPanel', async () => {
			AspectRatioPanel.createPanel(context.extensionPath);
		})
	);

}

// this method is called when your extension is deactivated
export function deactivate() {}

function getWebviewOptions(extensionUri: string): vscode.WebviewOptions {
	return {
		// Enable javascript in the webview
		enableScripts: true,

		// And restrict the webview to only loading content from our extension's `media` directory.
		localResourceRoots: [
			vscode.Uri.file(
				path.join(extensionUri, 'media')
			),
		]
	};
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

class AspectRatioPanel {

	public static currentPanel: AspectRatioPanel | undefined;

	public static readonly viewType = 'AspectRatio';

	private _panel: vscode.WebviewPanel;
	private readonly _extensionUri: string;
	private _disposables: vscode.Disposable[] = [];

	public static createPanel(extensionUri: string) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;
		
			
		const panel = vscode.window.createWebviewPanel(
			AspectRatioPanel.viewType,
			'Aspect Ratio Generator',
			column || vscode.ViewColumn.One,
			getWebviewOptions(extensionUri),
		);

		panel.webview.onDidReceiveMessage(
			async message => {
				switch (message.command) {
					case 'copy_result':
						vscode.env.clipboard.writeText(message.text);
						vscode.window.showInformationMessage('Copied the result to the clipboard');
						break;
				}
			}
		);

		AspectRatioPanel.currentPanel = new AspectRatioPanel(panel, extensionUri);
	}

	constructor(panel: vscode.WebviewPanel, extensionUri: string) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
	}

	public dispose() {
		AspectRatioPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		
		const scriptAspectRatioPathOnDisk = vscode.Uri.file(
			path.join(this._extensionUri, 'media', 'js/aspectRatio.min.js')
		);

		const scriptAspectRatioUri = webview.asWebviewUri(scriptAspectRatioPathOnDisk);

		const styleMainPath = vscode.Uri.file(
			path.join(this._extensionUri, 'media', 'css/aspectRatio.css')
		);
		const styleMainUri = webview.asWebviewUri(styleMainPath);
		
		const nonce = getNonce();

		let replacements = {
			scriptAspectRatioUri: scriptAspectRatioUri.toString(),
			styleMainUri: styleMainUri.toString(),
			nonce: nonce
		};

		let htmlDoc = fs.readFileSync(path.join(this._extensionUri, 'media', 'aspectRatio.html'));
		let docAsString = htmlDoc.toString('utf8');
		

		for (const [key, value] of Object.entries(replacements)) {
			let regEx = new RegExp('\\${' + key + '}', 'g');
			docAsString = docAsString.replace(regEx, value);
		}
		
		return docAsString;
	}
}
