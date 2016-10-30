'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const electrolyte = require('electrolyte');
electrolyte.use(electrolyte.dir('server'));
electrolyte.use(electrolyte.node_modules());



electron.ipcMain.on('listen', event => {
	let imapService = electrolyte.create('imap-service');
	imapService.listen().catch(e => {
		console.error(e)
		return [];
	}).subscribe(a => {
		//console.log(require('util').inspect(a, { depth: null }));
		event.sender.send('fetch', a);
	});
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
	electron.protocol.registerBufferProtocol('cid', (request, callback) => {
		callback({mimeType: 'text/html', data: new Buffer('<h5>Response</h5>')})
	}, (error) => {
		if (error) console.error('Failed to register protocol')
	})
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
