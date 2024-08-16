const { app, BrowserWindow } = require("electron");
const contextMenu = require('electron-context-menu');

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;
const profileCmdlineSwitchName = "profile-name";

contextMenu({
  showSaveImageAs: false,
  showSearchWithGoogle: false,
  showInspectElement: false,
  showCopyLink: true
});

let mainWindow;
let profileName;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    icon: __dirname + "/icon.jpg",
    frame: true,
  });

  mainWindow.loadURL("https://to-do.live.com/tasks/");

  var css = `
  .o365sx-appName,
  #ShellAboutMe,
  #ShellSettings,
  #O365_HeaderLeftRegion,
  #todoWhatsNewBtn,
  .officeApps {
    display: none !important;
  }

  #toDoSearchBox {
    padding: 0 10px;
  }
`;
  mainWindow.webContents.on("did-finish-load", function () {
    mainWindow.webContents.insertCSS(css);
  });

  mainWindow.on("closed", function () {
    mainWindow = null;
  });

  mainWindow.webContents.on("page-title-updated", () => {
    if (profileName) {
      mainWindow.setTitle(app.getName() + " (" + profileName + ")");
    }
    else {
      mainWindow.setTitle(app.getName());
    }
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    if (details.disposition === 'foreground-tab' || details.disposition === 'new-window') {
      require('electron').shell.openExternal(details.url);
      return {
        action: 'deny',
      }
    }

    return {
      action: 'allow',
      createWindow: (options) => {
        const browserView = new BrowserView(options)
        mainWindow.addBrowserView(browserView)
        browserView.setBounds({ x: 0, y: 0, width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT })
        return browserView.webContents
      }
    }
  })
}

if (app.commandLine.hasSwitch(profileCmdlineSwitchName) && app.commandLine.getSwitchValue(profileCmdlineSwitchName)) {
  profileName = app.commandLine.getSwitchValue(profileCmdlineSwitchName);
  app.setPath("sessionData", app.getPath("sessionData") + "-" + app.commandLine.getSwitchValue(profileCmdlineSwitchName));
}

app.on("browser-window-created", function (e, window) {
  window.setMenu(null);
});

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});
