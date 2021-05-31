import { app, shell, BrowserWindow, screen, ipcMain } from "electron";
import * as path from "path";
import * as url from "url";
import * as dns from "dns";
import * as fs from "fs";
import * as os from "os";
import * as childProcess from "child_process";
// Initialize remote module
require("@electron/remote/main").initialize();

let win: BrowserWindow = null;
let mainProcess: childProcess.ChildProcess;
let serviceIsStarted = false;
const args = process.argv.slice(1),
  serve = args.some((val) => val === "--serve");

const pathPrefix = !serve ? "./resources/app/" : "./";
const NodeConf = {
  NetworkId: "1618",
  MainNode:
    "enode://1ce2beb5b3037c2e9ac9951e09da27f77a1a44aac99283cc7ecb2adba3b268be0b3ca03ba5c9b78aca12ec6cb2dfa0ebae67923f1739323bd59807cf2b5e271e@138.197.75.67:30303",
  RpcPort: (Math.floor(Math.random() * 100) + 8545).toString(),
  NodePort: (Math.floor(Math.random() * 100) + 30303).toString(),
  CatecoinCorePath: pathPrefix + "bin/geth",
  GenesisConfPath: pathPrefix + "catecoin_data/genesis.json",
  DataPath: pathPrefix + "catecoin_data/chain/",
  NodeKeyPath: pathPrefix + "catecoin_data/chain/geth/nodekey",
  StaticNodeConfPath: pathPrefix + "catecoin_data/chain/static-nodes.json",
};

function createWindow(): BrowserWindow {
  const electronScreen = screen;

  // Create the browser window.
  win = new BrowserWindow({
    width: 900,
    height: 680,
    autoHideMenuBar: true,
    icon: serve
      ? "src/assets/icons/favicon.ico"
      : "resources/app/dist/assets/icons/favicon.ico",
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: serve ? true : false,
      contextIsolation: false, // false if you want to run 2e2 test with Spectron
      enableRemoteModule: true, // true if you want to run 2e2 test  with Spectron or use remote module in renderer context (ie. Angular)
    },
  });

  if (serve) {
    win.webContents.openDevTools();

    require("electron-reload")(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`),
    });
    win.loadURL("http://localhost:4200");
  } else {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, "dist/index.html"),
        protocol: "file:",
        slashes: true,
      })
    );
  }
  win.on("close", (e) => {
    if (win !== null) {
      e.preventDefault();
      win.webContents.send("shutdown");
    }
  });
  ipcMain.on("open-devtools", (e, args) => {
    win.webContents.openDevTools();
  });
  ipcMain.on("close", async () => {
    await closeMainProcess(false);
    win.destroy();
  });
  regEvents();
  return win;
}

try {
  initMainProcess();
  app.on("ready", () => setTimeout(createWindow, 400));
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
  app.on("activate", () => {
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {}

async function initMainProcess() {
  if (!isInitialized()) {
    await initNode();
  }
  startMainProcess();
}
function isInitialized(): boolean {
  return fs.existsSync(NodeConf.NodeKeyPath);
}
function regEvents() {
  ipcMain.on("getNodeConf", (event, args) => {
    win.webContents.send("NodeConf", [NodeConf]);
  });

  ipcMain.on("dnslookup", (event, args) => {
    dns.resolveTxt(args[0], (err, addr) => {
      console.log(err, addr);
      if (addr) {
        win.webContents.send("dnslookup-feedback-" + args[1], [addr]);
      }
    });
  });
  ipcMain.on("getCpuCount", (event, args) => {
    event.returnValue = os.cpus().length;
  });
  ipcMain.on("sys-open", (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });
}
function initNode() {
  return new Promise((resolve, reject) => {
    var process = childProcess.execFile(NodeConf.CatecoinCorePath, [
      "--datadir",
      NodeConf.DataPath,
      "--networkid",
      NodeConf.NetworkId,
      "init",
      NodeConf.GenesisConfPath,
    ]);
    process.on("close", (code) => {
      if (code === 0) {
        fs.writeFileSync(
          NodeConf.StaticNodeConfPath,
          JSON.stringify([NodeConf.MainNode])
        );
        resolve(null);
      } else {
        reject(null);
      }
    });
  });
}
function startMainProcess() {
  let corsConfig = !serve ? [] : ["--http.corsdomain", "http://localhost:4200"];
  closeMainProcess(true);
  mainProcess = childProcess.execFile(NodeConf.CatecoinCorePath, [
    "--datadir",
    NodeConf.DataPath,
    "--networkid",
    NodeConf.NetworkId,
    "--port",
    NodeConf.NodePort,
    "--http",
    "--http.port",
    NodeConf.RpcPort,
    "--http.api",
    "admin,personal,eth,miner,ethash",
    "--allow-insecure-unlock",
    "--ipcdisable",
    ...corsConfig,
    "console",
  ]);
  mainProcess.stdout.on("data", (data: string) => {
    if (data.endsWith(">")) {
      changeServiceStatus(true);
    }
  });
}
async function closeMainProcess(dontCloseApp) {
  return new Promise((resolve, reject) => {
    if (mainProcess && mainProcess.exitCode === null) {
      mainProcess?.stdin.write("exit\n");
      mainProcess?.on("close", (code, signal) => {
        changeServiceStatus(false);
        if (code === 0 && !dontCloseApp) {
          win.destroy();
          app.exit();
        }
        resolve(null);
      });
    } else {
      changeServiceStatus(false);
      resolve(null);
    }
  });
}
function changeServiceStatus(status: boolean) {
  serviceIsStarted = status;
  win?.webContents?.send("serviceStatusUpdate", [serviceIsStarted]);
}
