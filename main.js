'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const electrolyte = require('electrolyte');
electrolyte.use(electrolyte.dir('server'));
electrolyte.use(electrolyte.node_modules());

let imapService;

electrolyte.create('imap-service').then(service => {
	imapService = service;
});

electron.ipcMain.on('mail:listen', event => {
	imapService.listen().catch(e => {
		console.error(e);
		return [];
	}).subscribe(a => {
		event.sender.send('mail:fetch', a);
	});
});

electron.ipcMain.on('mail:mark:seen', (event, uid) => {
	imapService.setFlag(uid, '\\Seen').catch(e => {
		console.error(e);
		return [];
	}).subscribe(() => {
		event.sender.send('mail:marked:seen', uid);
	});
});

electron.ipcMain.on('mail:unmark:seen', (event, uid) => {
	imapService.removeFlag(uid, '\\Seen').catch(e => {
		console.error(e);
		return [];
	}).subscribe(() => {
		event.sender.send('mail:unmarked:seen', uid);
	});
});

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		webPreferences: {
			defaultFontFamily: {
				standard: 'Helvetica Neue'
			}
		}
	});
	mainWindow.loadURL(`file://${__dirname}/dist/index.html`);
	mainWindow.on('closed', function() {
		mainWindow = null;
	});
}
app.on('ready', () => {
	createWindow();
	electron.protocol.registerBufferProtocol('cid', (request, callback) => {
		callback({
			mimeType: 'text/html',
			data: new Buffer('<h5>Response</h5>')
		});
	}, error => {
		if (error) {
			console.error('Failed to register protocol', error);
		}
	});
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
