'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const electrolyte = require('electrolyte');
electrolyte.use(electrolyte.dir('server'));
electrolyte.use(electrolyte.node_modules());

let imapService;
let senderService;
let accountSettingsService;

electrolyte.create('imap-service').then(service => {
	imapService = service;
}).catch(console.error);

electrolyte.create('sender-service').then(service => {
	senderService = service;
}).catch(console.error);

electrolyte.create('account-settings-service').then(service => {
	accountSettingsService = service;
}).catch(console.error);

electron.ipcMain.on('contacts:me', event => {
	accountSettingsService.getAll().catch(e => {
		console.error(e);
		return [];
	}).subscribe(settings => {
		event.sender.send('contacts:me', {
			name: settings.name,
			address: settings.mailAddress
		});
	});
});

electron.ipcMain.on('mail:listen', event => {
	imapService.listen().catch(e => {
		console.error(e);
		return [];
	}).subscribe(a => {
		event.sender.send('mail:fetch', a);
	});
});

electron.ipcMain.on('mail:send', (event, mail) => {
	senderService.send(mail).catch(e => {
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
	electron.protocol.registerBufferProtocol('excid', (request, callback) => {
		const excid = request.url.substr(6);
		imapService.getAttachment(excid).catch(console.error).subscribe(attachment => {
			callback({
				mimeType: 'text/html',
				data: new Buffer(attachment)
			});
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
