import { app, BrowserWindow } from "electron";
import log from "electron-log";
import { autoUpdater } from "electron-updater";
import { startDiscordRPC } from "./discord";
import loadFlashPlugin from "./flash-loader";
import startMenu from "./menu";
import createStore from "./store";
import createWindow from "./window";

log.initialize();

console.log = log.log;

const store = createStore();

if (process.platform === 'linux') {
  app.commandLine.appendSwitch('no-sandbox');
}


loadFlashPlugin(app);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
autoUpdater.checkForUpdatesAndNotify();

let mainWindow: BrowserWindow;

app.on('ready', async () => {
  mainWindow = await createWindow(store);
  
  startMenu(store, mainWindow);

  startDiscordRPC(store, mainWindow);
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

app.setAsDefaultProtocolClient("cpavalanche");

app.on('window-all-closed', async () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    const discordClient = store.private.get('discordState')?.client;

    if (discordClient) {
      await discordClient.destroy();
    }

    app.quit();
    
    process.exit(0);
  }
});

app.on('activate', async () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    mainWindow = await createWindow(store);
  }
});