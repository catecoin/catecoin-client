import { Injectable } from "@angular/core";

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame } from "electron";
import * as remote from "@electron/remote";
import * as childProcess from "child_process";
import * as fs from "fs";
import { Subject } from "rxjs";
import { CloseEvent } from "./closeevent";
import { HttpClient } from "@angular/common/http";
import { AppConfig } from "../../../../environments/environment";

const pathPrefix = AppConfig.production ? "./resources/app/" : "./";
const NodeConf = {
  NetworkId: "115599335577",
  RpcPort: (Math.floor(Math.random() * 100) + 8545).toString(),
  NodePort: (Math.floor(Math.random() * 100) + 30303).toString(),
  CatecoinCorePath: pathPrefix + "bin/geth.exe",
  GenesisConfPath: pathPrefix + "catecoin_data/genesis.json",
  DataPath: pathPrefix + "catecoin_data/chain/",
  NodeKeyPath: pathPrefix + "catecoin_data/chain/geth/nodekey",
  StaticNodeConfPath: pathPrefix + "catecoin_data/chain/static-nodes.json",
};

@Injectable({
  providedIn: "root",
})
export class RPCService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  fs: typeof fs;
  mainProcess: childProcess.ChildProcess;
  onclose: Subject<CloseEvent> = new Subject<CloseEvent>();
  onstarted: Subject<null> = new Subject<null>();
  _started = false;
  corsConfig = AppConfig.production
    ? []
    : ["--http.corsdomain", "http://localhost:4200"];

  get isStarted(): boolean {
    return this._started;
  }
  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }
  get ping(): boolean {
    return null;
  }
  openDevTools() {
    if (this.ipcRenderer) {
      this.ipcRenderer.send("open-devtools");
    }
  }
  get isInitialized(): boolean {
    if (this.fs) {
      return this.fs.existsSync(NodeConf.NodeKeyPath);
    } else {
      return false;
    }
  }
  initNode() {
    if (this.childProcess) {
      var process = this.childProcess.execFile(NodeConf.CatecoinCorePath, [
        "--datadir",
        NodeConf.DataPath,
        "--networkid",
        NodeConf.NetworkId,
        "init",
        NodeConf.GenesisConfPath,
      ]);
      process.on("close", (code) => {
        if (code === 0) {
          this.fs.writeFileSync(
            NodeConf.StaticNodeConfPath,
            JSON.stringify([
              "enode://3086e076518603c96f0a3cd08a2a80396c53e79ab1a3cf832dc2f8762495a8a6a6c258835dd8f168cc6f3c271c531b84eead86aa0fbdf6dd9472678f27cc6fbf@138.197.75.67:30303",
            ])
          );
        }
      });
    }
  }

  startMainProcess() {
    if (this.childProcess) {
      let corsConfig = AppConfig.production
        ? []
        : ["--http.corsdomain", "http://localhost:4200"];

      this.mainProcess = this.childProcess.execFile(NodeConf.CatecoinCorePath, [
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
        "admin,personal,eth",
        ...corsConfig,
        "console",
      ]);
      this.mainProcess.stdout.on("data", (data: string) => {
        if (data.endsWith(">")) {
          this._started = true;
          this.onstarted.next();
        }
      });
    }
  }
  close() {
    if (this.mainProcess && this.mainProcess.exitCode === null) {
      this.mainProcess?.stdin.write("exit\n");
      this.mainProcess?.on("close", (code, signal) => {
        if (code === 0) {
          this.ipcRenderer.send("close");
        }
      });
    } else {
      this.ipcRenderer.send("close");
    }
  }
  async TxtDNSLookup(domain: string) {
    return new Promise<string>((resolve, reject) => {
      let reqId = this.randomString(10);
      this.ipcRenderer.once("dnslookup-feedback-" + reqId, (event, args) => {
        resolve(args);
      });
      this.ipcRenderer.send("dnslookup", [domain, reqId]);
    });
  }
  async rpcCall(method: string, params: string[] = []) {
    var resp: any = await this.http
      .post("http://127.0.0.1:" + NodeConf.RpcPort, {
        jsonrpc: "2.0",
        method,
        params,
        id: 1,
      })
      .toPromise();
    if (resp.result) {
      return resp.result;
    }
  }
  private randomString(len) {
    len = len || 32;
    const $chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
    const maxPos = $chars.length;
    let pwd = "";
    for (let i = 0; i < len; i++) {
      pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
  }
  constructor(private http: HttpClient) {
    if (this.isElectron) {
      this.ipcRenderer = window.require("electron").ipcRenderer;
      this.webFrame = window.require("electron").webFrame;
      this.childProcess = window.require("child_process");
      this.fs = window.require("fs");
      this.ipcRenderer.on("shutdown", () => {
        console.log("got shutdown signal.");
        let event = new CloseEvent();
        this.onclose.next(event);
        if (!event.cancel) {
          this.close();
        }
      });
    }
  }
}
