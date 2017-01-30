'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const electrolyte = require('electrolyte');
electrolyte.use(electrolyte.dir('server'));
electrolyte.use(electrolyte.node_modules());

let imapService;
let smtpService;

electrolyte.create('imap-service').then(service => {
	imapService = service;
}).catch(console.error);

electrolyte.create('smtp-service').then(service => {
	smtpService = service;
}).catch(console.error);

electron.ipcMain.on('mail:listen', event => {
	imapService.listen().catch(e => {
		console.error(e);
		return [];
	}).subscribe(a => {
		event.sender.send('mail:fetch', a);
	});
});

electron.ipcMain.on('mail:send', (event, mail) => {
	smtpService.send(mail).catch(e => {
		console.error(e);
		return [];
	}).subscribe(() => {
		event.sender.send('mail:sent', mail);
	});
});

electron.ipcMain.on('mail:mark:seen', (event, uid) => {
	imapService.addFlag(uid, '\\Seen').catch(e => {
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
		width: 1024,
		height: 768,
		show: false,
		webPreferences: {
			defaultFontFamily: {
				standard: 'Helvetica Neue'
			}
		}
	});
	mainWindow.once('ready-to-show', () => {
		mainWindow.show()
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
