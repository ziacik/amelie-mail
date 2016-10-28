'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const electrolyte = require('electrolyte');
electrolyte.use(electrolyte.dir('server'));
electrolyte.use(electrolyte.node_modules());

let imapService = electrolyte.create('imap-service');
imapService.listen().catch(e => {
	console.error(e)
	return [];
}).subscribe(a => {
	//console.log(require('util').inspect(a, { depth: null }));
	sender.send('fetch', a);
});

let sender;

electron.ipcMain.on('listen', event => {
	sender = event.sender;
});

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow();
	mainWindow.loadURL(`file://${__dirname}/dist/index.html`);
	mainWindow.on('closed', function() {
		mainWindow = null;
	});
}
app.on('ready', () => {
	createWindow();
});
app.on('window-all-closed', function() {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
app.on('activate', function() {
	if (mainWindow === null) {
		createWindow();
	}
});
