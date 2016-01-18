/// <reference path="../../typings/tsd.d.ts" />

import * as electron from "electron";

let mainWindow: GitHubElectron.BrowserWindow;

electron.app.on("window-all-closed", function() {
  if (process.platform !== "darwin") electron.app.quit();
});

electron.app.on("ready", function() {
  mainWindow = new electron.BrowserWindow({
    width: 1000, height: 600,
    useContentSize: true, autoHideMenuBar: true,
    show: false
  });
  mainWindow.setMenu(null);
  mainWindow.loadURL(`${__dirname}/renderer/index.html`);
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.openDevTools();
    mainWindow.show();
  });
});
